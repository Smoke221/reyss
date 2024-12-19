const express = require("express");
const {
  loginController,
  userDetailsController,
  changePasswordController,
  orderHistoryController,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");

const userRouter = express.Router();

userRouter.post("/auth", loginController);

userRouter.get("/userDetails", authenticate, userDetailsController);

userRouter.post("/changePass", authenticate, changePasswordController);

userRouter.get("/orderHistory", authenticate, orderHistoryController);

module.exports = userRouter;
