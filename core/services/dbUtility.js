const { orderModel } = require("../dbUtils/ordersModel");
const { userModel } = require("../dbUtils/userModel");

const findUserByUserName = async (userName) => {
  try {
    const user = await userModel.findOne({ username: userName });
    if (!user) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "Invalid user. Please try again.",
        },
      };
    }
    return user;
  } catch (error) {
    console.error("Error in dbutility --> findUserByUserName:", error.message);
    throw error;
  }
};

const getUserById = async (customerId) => {
  try {
    const user = await userModel.findById(customerId).select("-password");
    const latestOrder = await orderModel
      .findOne({ customerId })
      .sort({ orderDate: -1 })
      .limit(1);

    return {
      user,
      latestOrder: latestOrder || [],
    };
  } catch (error) {
    console.error("Error in dbutility --> getUserById:", error.message);
    throw new Error("Database query failed while fetching user.");
  }
};

const isUserExists = async (customerId) => {
  try {
    const user = await userModel.findById(customerId).select("-password");
    return user ? true : false;
  } catch (error) {
    console.error("Error in dbutility --> isUserExists.");
    throw error;
  }
};

const getOrdersByCustomerId = async (customerId) => {
  try {
    const orders = await orderModel.find({ customerId });
    return orders;
  } catch (error) {
    console.error("Error in dbutility --> getOrdersByCustomerId.");
    throw error;
  }
};

module.exports = { isUserExists, findUserByUserName, getOrdersByCustomerId };
