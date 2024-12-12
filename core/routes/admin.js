const express = require("express");
const {
  addUserController,
  getAllOrdersController,
  setAmOrderController,
  getAllUsersController,
  addProductController,
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

adminRouter.get(
  "/allUsers",
  authenticate,
  authorizeAdmin,
  getAllUsersController
);

adminRouter.post(
  "/newItem",
  authenticate,
  authorizeAdmin,
  addProductController
);

module.exports = adminRouter;
