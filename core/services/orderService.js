const moment = require("moment/moment");
const { orderModel } = require("../dbUtils/ordersModel");

const placeOrder = async (customerId, orderDetails) => {
  try {
    const { products, totalAmount, orderType, amountPaid } = orderDetails;

    if (!products || products.length === 0) {
      throw new Error("No products to place an order.");
    }

    if (totalAmount <= 0) {
      throw new Error("total price invalid.");
    }

    let deliveryOn;
    const currentDate = moment();

    if (orderType === "AM") {
      deliveryOn = currentDate.add(1, "day").toDate();
    } else if (orderType === "PM") {
      deliveryOn = currentDate.toDate();
    } else {
      return res
        .status(400)
        .json({ error: "Order type must be either 'AM' or 'PM'" });
    }

    const newOrder = new orderModel({
      customerId,
      products,
      orderType,
      totalAmount,
      deliveryOn,
      amountPaid: amountPaid || false,
    });

    await newOrder.save();

    return {
      status: true,
      message: "Order placed successfully",
      order: newOrder,
    };
  } catch (error) {
    console.error("Error in placeOrder service:", error);
    throw new Error(error.message || "Failed to place the order");
  }
};

const orderHistoryService = async (customerId) => {
  const orders = await orderModel.find({ customerId });

  // Function to group orders by date and type (AM/PM)
  const groupOrdersByDateAndType = (orders) => {
    const result = {};

    orders.forEach((order) => {
      const deliveryDate = order.deliveryOn.toISOString().split("T")[0];
      const orderType = order.orderType;

      const totalQuantity = order.products.reduce(
        (total, product) => total + product.quantity,
        0
      );
      if (!result[deliveryDate]) {
        result[deliveryDate] = {};
      }
      result[deliveryDate][orderType] = {
        quantity: totalQuantity,
        route: order.route,
        totalAmount: order.totalAmount,
      };
    });

    return result;
  };
  const groupedOrders = groupOrdersByDateAndType(orders);

  return groupedOrders;
};

module.exports = {
  placeOrder,
  orderHistoryService,
};
