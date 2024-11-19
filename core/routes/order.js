const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  placeOrderController,
  orderHistoryController,
  checkOrderController,
} = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.get("/check", authenticate ,checkOrderController);
orderRouter.post("/place", authenticate, placeOrderController);
orderRouter.get("/history", authenticate, orderHistoryController);

module.exports = orderRouter;
