const express = require("express");
const {
  addUserController,
  getAllOrdersController,
} = require("../controllers/adminController");

const adminRouter = express.Router();

adminRouter.post("/addUser", addUserController);

adminRouter.get("/allOrders", getAllOrdersController);

module.exports = adminRouter;
