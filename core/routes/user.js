const express = require("express");
const { loginController } = require("../controller/userController");
const { authenticate } = require("../middleware/authenticate");

const userRouter = express.Router();

userRouter.post("/auth", loginController);

module.exports = userRouter;
