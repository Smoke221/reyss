const express = require("express");
const { authenticate } = require("../middleware/authenticate");
const { placeOrderController } = require("../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/place", authenticate, placeOrderController);

module.exports = orderRouter;
