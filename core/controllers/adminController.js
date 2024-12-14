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

    res.status(result.statusCode).send(result.response);
  } catch (error) {
    console.error("Error in getAllOrdersController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.setAmOrderController = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || !products.length) {
      return res.status(400).json({
        status: false,
        message: "Not valid products",
      });
    }

    const result = await adminService.setAmOrderService(products);

    res.status(result.statusCode).send(result.response);
  } catch (error) {
    console.error("Error in setAmOrderController:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to set AM Order products.",
    });
  }
};

exports.getAllUsersController = async (req, res) => {
  try {
    const searchQuery = req.query.search || "";
    const getResponse = await adminService.getAllUsersService(searchQuery);

    res.status(getResponse.statusCode).send(getResponse.response);
  } catch (error) {
    console.error("Error in getAllUsersController:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get users.",
    });
  }
};

exports.addProductController = async (req, res) => {
  try {
    const { name, brand, category, price, discountPrice } = req.body;

    if (!name || !category || !price || !brand) {
      return res.status(400).json({
        status: "error",
        message: "Required fields: name, category, and price.",
      });
    }

    const productData = {
      name,
      brand,
      category,
      price,
      discountPrice: discountPrice || 0,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
    };

    const addResponse = await adminService.addProductService(productData);

    res.status(addResponse.statusCode).send(addResponse.response);
  } catch (error) {
    console.error("Error in addProductController:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add product.",
    });
  }
};

exports.exportToExcelController = async (req, res) => {
  try {
    const { data, fileName } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid data provided. Data must be a non-empty array.",
      });
    }

    if (!fileName) {
      return res.status(400).json({
        status: false,
        message: "Filename is required.",
      });
    }

    const excelBuffer = await adminService.exportToExcelService(data);

    // Set headers to download the file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.status(200).send(excelBuffer); // Send the Excel file as a buffer
  } catch (error) {
    console.error("Error in exportToExcelController:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to export data to Excel." });
  }
};
