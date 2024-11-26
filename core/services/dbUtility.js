const { orderModel } = require("../dbUtils/ordersModel");
const { productModel } = require("../dbUtils/productModel");
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
      defaultOrder: user.defaultOrder || [],
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

const getProducts = async () => {
  try {
    const products = await productModel.find();
    return products;
  } catch (error) {
    console.error("Error in dbutility --> getProducts.");
    throw error;
  }
};

const getOrder = async (customerId, orderId) => {
  try {
    const order = await orderModel.find({ customerId, _id: orderId });
    return order;
  } catch (error) {
    console.error("Error in dbutility --> getOrder.");
    throw error;
  }
};

const getProductById = async (productId) => {
  try {
    const product = await productModel.findById(productId);
    return product;
  } catch (error) {
    console.error("Error in dbutility --> getProductById.");
    throw error;
  }
};

const lastPMOrder = async (orderId) => {
  try {
    const order = await orderModel
      .findOne({
        customerId: order.customerId,
        orderType: "PM",
      })
      .sort({ placedOn: -1 });
    return order;
  } catch (error) {
    console.error("Error in dbutility --> getProductById.");
    throw error;
  }
};

module.exports = {
  isUserExists,
  findUserByUserName,
  getOrdersByCustomerId,
  getProducts,
  getUserById,
  getOrder,
  getProductById,
  lastPMOrder,
};
