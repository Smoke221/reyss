const moment = require("moment/moment");
const {
  isUserExists,
  getOrdersByCustomerId,
  getOrder,
  getProductById,
  getProducts,
  createOrder,
  addOrderProducts,
} = require("./dbUtility");
const { executeQuery } = require("../dbUtils/db");

const placeOrderService = async (
  customerId,
  { products, orderType, totalAmount }
) => {
  try {
    // Step 1: Create the order entry
    const placedOn = Math.floor(Date.now() / 1000); // Current epoch time
    const createdAt = placedOn;
    const updatedAt = placedOn;

    const orderId = await createOrder(
      customerId,
      totalAmount,
      orderType,
      placedOn,
      createdAt,
      updatedAt
    );

    // Step 2: Add products to the order
    await addOrderProducts(orderId, products);

    // Step 3: Return the result (Order placed successfully)
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
          products,
        },
      },
    };
  } catch (error) {
    console.error("Error in placeOrderService:", error);
    throw new Error("Failed to place the order.");
  }
};

// Function to check order validity
const checkOrderService = async (customerId, orderType, products) => {
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
    let dbProducts = await getProducts();
    for (const product of products) {
      const { product_id, quantity } = product;
      const productData = dbProducts.find((p) => p.id === product_id);

      if (!productData) {
        invalidProducts.push(product_id);
        continue;
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        invalidProducts.push(product_id);
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
        data: { customerId, orderType, products, totalAmount },
      },
    };
  } catch (error) {
    console.error("Error in checkOrderService:", error);
    throw new Error(error.message);
  }
};

const orderHistoryService = async (customerId) => {
  try {
    const orders = await getOrdersByCustomerId(customerId);
    const groupOrdersByDateAndType = (orders) => {
      const result = {};

      orders.forEach((order) => {
        const orderDate = order.placedOn;
        const orderType = order.orderType;

        const totalQuantity = order.quantity;

        if (!result[orderDate]) {
          result[orderDate] = {};
        }
        result[orderDate][orderType] = {
          quantity: totalQuantity,
          route: order.route,
          totalAmount: order.totalAmount,
          orderId: order.orderId,
        };
      });

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
