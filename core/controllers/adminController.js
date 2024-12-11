const adminService = require("../services/adminService");
const bcrypt = require("bcryptjs");

exports.addUserController = async (req, res) => {
  try {
    const { customer_id, username, name, password } = req.body;

    if (!customer_id || !username || !name || !password) {
      return res.status(400).json({
        status: false,
        message: "customer_id, username, name, and password are required.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const addResult = await adminService.addUserService({
      customer_id,
      username,
      name,
      password: hashedPassword,
    });

    res.status(addResult.statusCode).send(addResult.response);
  } catch (error) {
    console.error("Error in addUserController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getAllOrdersController = async (req, res) => {
  try {
    const params = req.query;

    const result = await adminService.getAllOrdersService(params);

    res.status(result.statusCode).send(result.response)
  } catch (error) {
    console.error("Error in getAllOrdersController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
