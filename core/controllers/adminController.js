const adminService = require("../services/adminService");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

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
    const orders = req.body;
    console.log(`🪵 → req.body:`, orders);

    const formattedOrders = orders.map((order) => ({
      "Order ID": order.id,
      "Customer ID": order.customer_id,
      "Customer Name": order.customer_name,
      "Total Amount": order.total_amount,
      "Order Type": order.order_type,
      "Placed On": new Date(order.placed_on * 1000).toLocaleString(), // Convert epoch to readable date
      "Product Category": order.category,
      "Product Name": order.product_name,
      Status: order.status,
      "Created At": new Date(order.created_at * 1000).toLocaleString(),
      "Updated At": new Date(order.updated_at * 1000).toLocaleString(),
    }));

    // Create a new workbook and add the sheet with data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(formattedOrders);
    XLSX.utils.book_append_sheet(wb, ws, "Orders");

    // Generate buffer for the workbook
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set proper response headers to force download
    res.setHeader("Content-Disposition", "attachment; filename=orders.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send the buffer as a response
    res.send(buffer);
  } catch (error) {
    console.error("Error in exportToExcelController:", error);
    res
      .status(500)
      .json({ status: false, message: "Failed to export data to Excel." });
  }
};

exports.updateUserController = async (req, res) => {
  try {
    const { customer_id } = req.query;
    if (!customer_id) {
      return res
        .status(401)
        .json({ status: false, message: "Unauthorized access" });
    }
    const result = await adminService.updateUserService(customer_id, req.body);
    res.status(result.statusCode).send(result.response);
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ status: false, message: "Failed to update user." });
  }
};
