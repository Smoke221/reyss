const { mongoose } = require("mongoose");
const userService = require("../services/userService");

const loginController = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: false,
      message: "Username and password are required.",
    });
  }
  try {
    const loginResponse = await userService.loginUser(username, password);

    if (loginResponse.statusCode !== 200) {
      return res.status(loginResponse.statusCode).json({
        status: loginResponse.response.status,
        message: loginResponse.response.message,
      });
    }

    console.log("Login successful for username:", username);
    res.status(200).json({
      status: loginResponse.response.status,
      message: loginResponse.response.message,
      token: loginResponse.response.data.token,
    });
  } catch (err) {
    console.error("Error during login:", err.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

const userDetailsController = async (req, res) => {
  try {
    const customerId = req.userID;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid customerId provided.",
      });
    }

    const result = await userService.getUserDetailsByCustomerId(customerId);

    if (!result || !result.latestOrder) {
      return res.status(404).json({
        status: false,
        message: "User or order not found.",
      });
    }

    console.log("User details and latest order fetched successfully");
    return res.status(200).json({
      status: true,
      message: "User details and latest order fetched successfully",
      user: result.user,
      latestOrder: result.latestOrder,
    });
  } catch (err) {
    console.error("Error fetching user details:", err.message);
    return res.status(500).json({
      status: false,
      message:
        err.message || "Unable to fetch user details. Please try again later.",
    });
  }
};

module.exports = { loginController, userDetailsController };
