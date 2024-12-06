const { default: mongoose } = require("mongoose");
const {
  placeOrder,
  orderHistoryService,
  checkOrderService,
  placeOrderService,
  getOrderService,
} = require("../services/orderService");

const placeOrderController = async (req, res) => {
  try {
    const customerId = req.userID;
    const { products, orderType } = req.body;

    const checkResult = await checkOrderService(
      customerId,
      orderType,
      products
    );

    const orderData = {
      products,
      orderType,
      totalAmount: checkResult.response.data.totalAmount,
    };

    const result = await placeOrderService(customerId, orderData);

    return res.status(result.statusCode).json(result.response);
  } catch (error) {
    console.error("Error in placeOrderController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const checkOrderController = async (req, res) => {
  try {
    const customerId = req.userID;

    if (!customerId) {
      return res.status(400).json({
        status: false,
        message: "Invalid customerId provided.",
      });
    }

    const { products, orderType } = req.body;

    // Validate orderType
    if (!orderType || !["AM", "PM"].includes(orderType)) {
      return res.status(400).json({
        status: false,
        message: "Not a valid order type.",
      });
    }
    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Products list is empty.",
      });
    }

    const checkResult = await checkOrderService(
      customerId,
      orderType,
      products
    );

    if (!checkResult.status) {
      return res.status(checkResult.statusCode).json(checkResult.response);
    }
    return res.status(checkResult.statusCode).json(checkResult.response);
  } catch (error) {
    console.error("Error in checkOrderController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const orderHistoryController = async (req, res) => {
  const customerId = req.userID;

  const getResponse = await orderHistoryService(customerId);

  res.status(200).json(getResponse);
};

const getOrderController = async (req, res) => {
  try {
    const customerId = req.userID;
    const { orderId } = req.query;

    if (!customerId || !orderId) {
      return res.status(400).json({
        status: false,
        message: "Id is not valid.",
      });
    }

    const getResponse = await getOrderService(customerId, orderId);
    return res.status(200).json(getResponse);
  } catch (error) {
    console.error("Error in getOrderController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  placeOrderController,
  orderHistoryController,
  checkOrderController,
  getOrderController,
};
