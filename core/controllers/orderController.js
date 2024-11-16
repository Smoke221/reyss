const { placeOrder, orderHistoryService } = require("../services/orderService");

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

const orderHistoryController = async (req, res) => {
  const customerId = req.userID;

  const getResponse = await orderHistoryService(customerId);
  console.log(getResponse);
  

  res.status(200).json(getResponse);
};

module.exports = {
  placeOrderController,
  orderHistoryController,
};
