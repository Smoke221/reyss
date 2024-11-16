const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  placeOrderController,
  orderHistoryController,
} = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/place", authenticate, placeOrderController);
orderRouter.get("/history", authenticate, orderHistoryController);

module.exports = orderRouter;
