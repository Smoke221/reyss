const moment = require("moment/moment");
const {
  isUserExists,
  getOrdersByCustomerId,
  getOrder,
  getProductById,
  getProducts,
  createOrder,
  addOrderProducts,
  createTransactionForCOD,
  getProductss,
  checkExistingOrder,
} = require("./dbUtility");
const { executeQuery } = require("../dbUtils/db");

const placeOrderService = async (
  customerId,
  { products, orderType, totalAmount, orderDate }
) => {
  try {
    // Create the order entry
    const placedOn = orderDate;
    const currentEpoch = Math.floor(Date.now() / 1000);
    const createdAt = currentEpoch;
    const updatedAt = currentEpoch;

    const orderId = await createOrder(
      customerId,
      totalAmount,
      orderType,
      placedOn,
      createdAt,
      updatedAt
    );

    // Add products to the order
    await addOrderProducts(orderId, products);

    // Create a transaction for COD orders
    await createTransactionForCOD(orderId, customerId, totalAmount);

    // Return the result (Order placed successfully)
    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Order placed successfully.",
        data: {
          orderId,
          customerId,
          orderType,
          totalAmount,
          placedOn,
          products,
        },
      },
    };
  } catch (error) {
    console.error("Error in placeOrderService:", error);
    throw new Error("Failed to place the order.");
  }
};

const checkOrderService = async (
  customerId,
  orderType,
  products,
  orderDate
) => {
  try {
    // Check if the user exists
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

    // Check if an order for the same type and date already exists for this customer
    const existingOrder = await checkExistingOrder(
      customerId,
      orderDate,
      orderType
    );
    if (existingOrder) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: `Order already exists for ${orderType} on this date.`,
        },
      };
    }

    // Validate products and calculate total amount
    let totalAmount = 0;
    const invalidProducts = [];
    const dbProducts = await getProductss();

    for (const product of products) {
      console.log(`🪵 → product:`, product)
      const { product_id, quantity } = product;
      const productData = dbProducts.find((p) => p.id === product_id);

      if (!productData) {
        invalidProducts.push(product_id);
        continue;
      }

      const parsedQuantity = parseInt(quantity, 10);
      if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
        invalidProducts.push(product_id);
        continue;
      }

      totalAmount += productData.price * parsedQuantity;
    }

    // If there are any invalid products, return an error
    if (invalidProducts.length > 0) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: `Invalid products found: ${invalidProducts.join(", ")}`,
        },
      };
    }

    // Return valid order data
    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Valid order, can proceed further.",
        data: { customerId, orderType, products, totalAmount },
      },
    };
  } catch (error) {
    console.error("Error in checkOrderService:", error);
    return {
      statusCode: 500,
      response: {
        status: false,
        message: "Internal server error.",
      },
    };
  }
};

const orderHistoryService = async (customerId) => {
  try {
    const orders = await getOrdersByCustomerId(customerId);

    const getStartOfDayTimestamp = (date) => {
      const dateObj = new Date(date * 1000);
      dateObj.setUTCHours(0, 0, 0, 0);
      return Math.floor(dateObj.getTime() / 1000);
    };

    const groupOrdersByDateAndType = (orders) => {
      const result = {};

      orders.forEach((order) => {
        const orderDateTimestamp = getStartOfDayTimestamp(order.placedOn);
        const orderType = order.orderType;

        if (!result[orderDateTimestamp]) {
          result[orderDateTimestamp] = {};
        }

        if (!result[orderDateTimestamp][orderType]) {
          result[orderDateTimestamp][orderType] = {
            quantity: 0,
            totalAmount: 0,
            route: order.route,
            orderId: order.orderId,
          };
        }

        result[orderDateTimestamp][orderType].quantity += order.quantity;
        result[orderDateTimestamp][orderType].totalAmount = order.totalAmount;
      });

      console.log(`🪵 → result:`, result)
      return result;
    };

    const groupedOrders = groupOrdersByDateAndType(orders);

    return groupedOrders;
  } catch (error) {
    console.error("Error in orderHistoryService:", error.message);
    throw new Error("Failed to fetch order history.");
  }
};

const getOrderService = async (customerId, orderId) => {
  try {
    // Fetch the order details from the orders table
    const orderQuery = `
      SELECT * 
      FROM orders 
      WHERE customer_id = ? AND id = ?
    `;
    const [order] = await executeQuery(orderQuery, [customerId, orderId]);

    if (!order) {
      throw new Error(
        `Order with ID ${orderId} not found for customer ${customerId}`
      );
    }

    // Fetch the related products for the order from the order_products table
    const orderProductsQuery = `
      SELECT op.product_id, op.quantity, op.price, p.name, p.category 
      FROM order_products op
      JOIN products p ON op.product_id = p.id
      WHERE op.order_id = ?
    `;
    const products = await executeQuery(orderProductsQuery, [orderId]);

    return {
      order,
      products,
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
