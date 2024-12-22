const express = require("express");
const {
  addUserController,
  getAllOrdersController,
  setAmOrderController,
  getAllUsersController,
  addProductController,
  exportToExcelController,
  updateUserController,
  updateProductController,
} = require("../controllers/adminController");
const { authenticate, authorizeAdmin } = require("../middleware/authenticate");

const adminRouter = express.Router();

adminRouter.post("/addUser", authenticate, authorizeAdmin, addUserController);

adminRouter.get(
  "/allOrders",
  authenticate,
  authorizeAdmin,
  getAllOrdersController
);

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

adminRouter.post("/update", authenticate, authorizeAdmin, updateUserController);

adminRouter.post(
  "/editProd",
  authenticate,
  authorizeAdmin,
  updateProductController
);

adminRouter.post("/export", exportToExcelController);

module.exports = adminRouter;
