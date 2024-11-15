const jwt = require("jsonwebtoken");
const { userModel } = require("../dbUtils/userModel");

const loginUser = async (username, password) => {
  try {
    // Find the user by username
    const user = await userModel.findOne({ username });

    // Check if user exists and if the password matches
    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token, user };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

const getUserDetailsByCustomerId = async (customerId) => {
  try {
    const user = await userModel.findById(customerId).select('-password');

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

module.exports = { loginUser, getUserDetailsByCustomerId };
