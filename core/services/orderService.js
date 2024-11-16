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

module.exports = {
  placeOrder,
};
