const express = require("express");
const {
  loginController,
  userDetailsController,
  changePasswordController,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");

const userRouter = express.Router();

userRouter.post("/auth", loginController);

userRouter.get("/userDetails", authenticate, userDetailsController);

userRouter.post("/changePass", authenticate, changePasswordController);

module.exports = userRouter;
