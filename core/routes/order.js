const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const {
  placeOrderController,
  orderHistoryController,
  checkOrderController,
  getOrderController,
} = require("../controllers/orderController");
const { getProducts } = require("../services/dbUtility");

const orderRouter = express.Router();

orderRouter.get("/check", authenticate, checkOrderController);
orderRouter.post("/place", authenticate, placeOrderController);
orderRouter.get("/history", authenticate, orderHistoryController);
orderRouter.get("/order", authenticate, getOrderController);

orderRouter.get("/products", async (req, res) => {
  const products = await getProducts();
  res.status(200).json(products);
});

module.exports = orderRouter;
