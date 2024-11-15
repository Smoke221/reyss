const userService = require("../services/userService");

const loginController = async (req, res) => {
  const { username, password } = req.body;

  console.log(`Login attempt for username: ${username}`);

  try {
    const { token, user } = await userService.loginUser(username, password);

    console.log("Login successful for username:", username);
    return res.status(200).json({
      status: true,
      message: "Login success",
      token,
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(401).json({
      status: false,
      message: err.message || "Internal server error. Please try again later.",
    });
  }
};

module.exports = { loginController };
