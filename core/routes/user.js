const express = require("express");
const { loginController, userDetailsController } = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");

const userRouter = express.Router();

userRouter.post("/auth", loginController);
userRouter.get('/userDetails', authenticate ,userDetailsController)

module.exports = userRouter;
