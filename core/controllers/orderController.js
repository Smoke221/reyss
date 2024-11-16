const { placeOrder } = require("../services/orderService");

const placeOrderController = async (req, res) => {
  try {
    const customerId = req.userID;

    const { products, totalAmount, orderType, amountPaid } = req.body;

    const result = await placeOrder(customerId, {
      products,
      totalAmount,
      orderType,
      amountPaid,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in placeOrderController:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  placeOrderController,
};
