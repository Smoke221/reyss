const jwt = require("jsonwebtoken");
const { userModel } = require("../dbUtils/userModel");
const mongoose = require("mongoose");
const { orderModel } = require("../dbUtils/ordersModel");

async function loginController(req, res) {
  const { username, password } = req.body;

  console.log(`Login attempt for username: ${username}`);

  try {
    const user = await userModel.findOne({ username });

    if (!user || user.password !== password) {
      console.log("Invalid login attempt");
      return res.status(401).json({
        status: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Login successful for username:", username);
    return res.status(200).json({
      status: true,
      message: "Login success",
      token,
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error. Please try again later.",
    });
  }
}

module.exports = { loginController };
