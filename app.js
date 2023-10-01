const express = require("express");
const authenticate = require("./middleware/auth.middleware");
const app = express();
const port = 3005;
const jwt = require("jsonwebtoken");

app.get("/protected", authenticate, (req, res) => {
  res.send("Welcome to the protected route");
});

app.post("/login", (req, res) => {
  const user = {
    id: 1,
    username: "john.doe",
  };

  const accessToken = jwt.sign({ user }, process.env.TOKEN_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign({ user }, secretKey, { expiresIn: "1d" });

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
    })
    .header("Authorization", accessToken)
    .send(user);
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies["refreshToken"];

  if (!refreshToken) {
    return res.status(401).send("Access Denied. No refresh token provided.");
  }

  try {
    const decoded = jwt.verify(refreshToken, secretKey);
    const accessToken = jwt.sign({ user: decoded.user }, secretKey, {
      expiresIn: "1h",
    });

    res.header("Authorization", accessToken).send(decoded.user);
  } catch (error) {
    return res.status(400).send("Invalid refresh token.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
