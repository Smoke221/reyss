const express = require("express");
const {
  addUserController,
  getAllOrdersController,
  setAmOrderController,
  getAllUsersController,
} = require("../controllers/adminController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

const adminRouter = express.Router();

adminRouter.post("/addUser", addUserController);

adminRouter.get("/allOrders", getAllOrdersController);

adminRouter.post(
  "/setAmOrder",
  authenticate,
  authorizeAdmin,
  setAmOrderController
);

adminRouter.get("/allUsers", authenticate, authorizeAdmin, getAllUsersController)

module.exports = adminRouter;
