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
    res.status(loginResponse.statusCode).send(loginResponse.response);
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

    if (!customerId) {
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
      defaultOrder: result.defaultOrder,
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

const changePasswordController = async (req, res) => {
  try {
    const customer_id = req.userID;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Old password and new password are required.",
      });
    }

    const changePasswordResponse = await userService.changePasswordService(
      customer_id,
      oldPassword,
      newPassword
    );

    return res
      .status(changePasswordResponse.statusCode)
      .json(changePasswordResponse.response);
  } catch (err) {
    console.error("Error in changePasswordController:", err.message);
    return res.status(500).json({
      status: false,
      message: "Failed to change password.",
    });
  }
};

module.exports = {
  loginController,
  userDetailsController,
  changePasswordController,
};
