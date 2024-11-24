const moment = require("moment/moment");
const { orderModel } = require("../dbUtils/ordersModel");
const {
  isUserExists,
  getOrdersByCustomerId,
  getOrder,
  getProductById,
} = require("./dbUtility");
const { productModel } = require("../dbUtils/productModel");

const placeOrderService = async (
  customerId,
  { products, orderType, totalAmount }
) => {
  try {
    const newOrder = new orderModel({
      customerId,
      orderType,
      products,
      totalAmount,
      placedOn: new Date(),
    });

    await newOrder.save();

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Order place successfully.",
        orderId: newOrder._id,
        customerId: newOrder.customerId,
        orderType: newOrder.orderType,
        products: newOrder.products,
        totalAmount: newOrder.totalAmount,
      },
    };
  } catch (error) {
    console.error("Error in placeOrderService:", error);
    throw new Error("Failed to place the order.");
  }
};

const checkOrderService = async (customerId, orderType, orderDetails) => {
  try {
    const isUser = await isUserExists(customerId);
    if (!isUser) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "User doesn't exist.",
        },
      };
    }

    let totalAmount = 0;
    const invalidProducts = [];

    for (const product of orderDetails) {
      const { productId, quantity } = product;

      const productData = await productModel.findById(productId);
      if (!productData) {
        invalidProducts.push(productId);
        continue;
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        invalidProducts.push(productId);
        continue;
      }

      totalAmount += productData.price * quantity;
    }

    if (invalidProducts.length > 0) {
      throw new Error(`Invalid products found: ${invalidProducts.join(", ")}`);
    }
    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Valid order, can proceed further.",
        data: { customerId, orderType, orderDetails, totalAmount },
      },
    };
  } catch (error) {
    console.error("Error in checkOrderService:", error);
    throw new Error(error.message);
  }
};

const orderHistoryService = async (customerId) => {
  const orders = await getOrdersByCustomerId(customerId);

  // Function to group orders by date and type (AM/PM)
  const groupOrdersByDateAndType = (orders) => {
    const result = {};

    orders.forEach((order) => {
      const orderDate = order.placedOn.toISOString().split("T")[0];
      const orderType = order.orderType;

      const totalQuantity = order.products.reduce(
        (total, product) => total + product.quantity,
        0
      );
      if (!result[orderDate]) {
        result[orderDate] = {};
      }
      result[orderDate][orderType] = {
        quantity: totalQuantity,
        route: order.route, 
        totalAmount: order.totalAmount,
        orderId: order._id.toString()
      };
    });

    return result;
  };
  const groupedOrders = groupOrdersByDateAndType(orders);

  return groupedOrders;
};

const getOrderService = async (customerId, orderId) => {
  try {
    const order = await getOrder(customerId, orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    const productsWithDetails = await Promise.all(
      order[0].products.map(async (product) => {
        const productDetails = await getProductById(product.productId);
        return {
          ...productDetails._doc,
          quantity: product.quantity,
        };
      })
    );

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Fetched order details.",
        data: {
          ...order[0]._doc,
          products: productsWithDetails,
        },
      },
    };
  } catch (error) {
    console.error("Error in getOrderService:", error);
    throw error;
  }
};

module.exports = {
  placeOrderService,
  orderHistoryService,
  checkOrderService,
  getOrderService,
};
