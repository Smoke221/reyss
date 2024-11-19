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
    const { token, user } = await userService.loginUser(username, password);

    console.log("Login successful for username:", username);
    return res.status(200).json({
      status: true,
      message: "Login successful.",
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
      message: "Internal server error.",
    });
  }
};

const userDetailsController = async (req, res) => {
  const { customerId } = req.query;

  console.log(`Fetching details for customerId: ${customerId}`);
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid customerId provided.",
    });
  }

  try {
    const userDetails = await userService.getUserDetailsByCustomerId(
      customerId
    );

    console.log("User details fetched successfully");
    return res.status(200).json({
      status: true,
      message: "User details fetched successfully",
      user: userDetails,
    });
  } catch (err) {
    console.error("Error fetching user details:", err.message);
    return res.status(400).json({
      status: false,
      message:
        err.message || "Unable to fetch user details. Please try again later.",
    });
  }
};

module.exports = { loginController, userDetailsController };
