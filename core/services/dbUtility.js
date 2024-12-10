const { executeQuery } = require("../dbUtils/db");

const findUserByUserName = async (userName) => {
  try {
    const query = "SELECT * FROM users WHERE username = ?";
    const user = await executeQuery(query, [userName]);

    if (!user[0]) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "Invalid user. Please try again.",
        },
      };
    }
    return user[0];
  } catch (error) {
    console.error("Error in dbutility --> findUserByUserName:", error.message);
    throw error;
  }
};

const getUserById = async (customerId) => {
  try {
    const userQuery =
      "SELECT customer_id, name, username, phone, delivery_address, route FROM users WHERE customer_id = ?";
    const [user] = await executeQuery(userQuery, [customerId]);

    const latestOrderQuery = `
      SELECT id, customer_id, total_amount, order_type, placed_on FROM orders WHERE customer_id = ? ORDER BY placed_on DESC LIMIT 1
    `;
    const [latestOrder] = await executeQuery(latestOrderQuery, [customerId]);

    const defaultOrderQuery = `
      SELECT id, customer_id, total_amount, order_type FROM default_orders WHERE customer_id = ? LIMIT 1
    `;
    const [defaultOrder] = await executeQuery(defaultOrderQuery, [customerId]);

    return {
      user,
      defaultOrder: defaultOrder || [],
      latestOrder: latestOrder || [],
    };
  } catch (error) {
    console.error("Error in dbutility --> getUserById:", error.message);
    throw new Error("Database query failed while fetching user.");
  }
};

const isUserExists = async (customerId) => {
  try {
    const query = "SELECT * FROM users WHERE customer_id = ?";
    const [user] = await executeQuery(query, [customerId]);
    return user ? true : false;
  } catch (error) {
    console.error("Error in dbutility --> isUserExists.");
    throw error;
  }
};

const getOrdersByCustomerId = async (customerId) => {
  try {
    const ordersQuery = `
      SELECT o.id AS orderId, o.total_amount AS totalAmount, o.order_type AS orderType, 
             o.placed_on AS placedOn, 
             p.product_id AS productId, p.quantity, p.price
      FROM orders o
      JOIN order_products p ON o.id = p.order_id
      WHERE o.customer_id = ?
    `;

    const orders = await executeQuery(ordersQuery, [customerId]);
    return orders;
  } catch (error) {
    console.error("Error in dbutility --> getOrdersByCustomerId.");
    throw error;
  }
};

const getProducts = async () => {
  try {
    const query = "SELECT * FROM products";
    const products = await executeQuery(query);
    return products;
  } catch (error) {
    console.error("Error in dbutility --> getProducts.");
    throw error;
  }
};

const getOrder = async (customerId, orderId) => {
  try {
    const query = "SELECT * FROM orders WHERE customer_id = ? AND order_id = ?";
    const order = await executeQuery(query, [customerId, orderId]);
    return order;
  } catch (error) {
    console.error("Error in dbutility --> getOrder.");
    throw error;
  }
};

const getProductById = async (productId) => {
  try {
    const query = "SELECT * FROM products WHERE product_id = ?";
    const product = await executeQuery(query, [productId]);
    return product;
  } catch (error) {
    console.error("Error in dbutility --> getProductById.");
    throw error;
  }
};

const lastPMOrder = async (orderId) => {
  try {
    const query = `
      SELECT * FROM orders
      WHERE customer_id = (SELECT customer_id FROM orders WHERE order_id = ?)
        AND order_type = 'PM'
      ORDER BY placed_on DESC LIMIT 1
    `;
    const [order] = await executeQuery(query, [orderId]);
    return order;
  } catch (error) {
    console.error("Error in dbutility --> lastPMOrder.");
    throw error;
  }
};

const createOrder = async (
  customerId,
  totalAmount,
  orderType,
  placedOn,
  createdAt,
  updatedAt
) => {
  try {
    const query = `
      INSERT INTO orders (customer_id, total_amount, order_type, placed_on, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    const values = [
      customerId,
      totalAmount,
      orderType,
      placedOn,
      createdAt,
      updatedAt,
    ];
    const orderResult = await executeQuery(query, values);
    return orderResult.insertId;
  } catch (error) {
    console.error("Error in createOrder:", error);
    throw new Error("Failed to create the order.");
  }
};

// Function to insert products into the order_products table
const addOrderProducts = async (orderId, products) => {
  try {
    const availableProducts = await getProducts();

    const orderProductQueries = products.map((product) => {
      const { product_id, quantity } = product;
      const productData = availableProducts.find((p) => p.id === product_id);

      if (!productData) {
        throw new Error(
          `Product with ID ${product_id} not found in available products.`
        );
      }

      const price = productData.price;

      return {
        query: `
          INSERT INTO order_products (order_id, product_id, quantity, price, name, category)
          VALUES (?, ?, ?, ?, ?, ?);
        `,
        values: [
          orderId,
          product_id,
          quantity,
          price,
          productData.name,
          productData.category,
        ],
      };
    });

    for (const query of orderProductQueries) {
      await executeQuery(query.query, query.values);
    }
  } catch (error) {
    console.error("Error in addOrderProducts:", error);
    throw new Error("Failed to add products to the order.");
  }
};
const getDailyTransactions = async (userId, month, year) => {
  try {
    const getDailyTransactionsQuery = `
  SELECT 
      DATE(FROM_UNIXTIME(o.placed_on)) AS order_date, 
      SUM(o.total_amount) AS total_order_amount, 
      SUM(IFNULL(t.amount, 0)) AS total_amount_paid
  FROM 
      orders o
  LEFT JOIN 
      transactions t ON o.id = t.order_id
  WHERE 
      o.customer_id = ? AND
      MONTH(FROM_UNIXTIME(o.placed_on)) = ? AND
      YEAR(FROM_UNIXTIME(o.placed_on)) = ?
  GROUP BY 
      DATE(FROM_UNIXTIME(o.placed_on))
  ORDER BY 
      order_date;
`;
    const result = await executeQuery(getDailyTransactionsQuery, [
      userId,
      month,
      year,
    ]);
    return result;
  } catch (error) {
    console.error("Error executing daily transactions query:", error.message);
    throw new Error("Unable to fetch daily transactions.");
  }
};

const getMonthlyTotals = async (userId, month, year) => {
  try {
    const getMonthlyTotalsQuery = `
  SELECT 
      SUM(o.total_amount) AS total_order_amount, 
      SUM(IFNULL(t.amount, 0)) AS total_amount_paid
  FROM 
      orders o
  LEFT JOIN 
      transactions t ON o.id = t.order_id
  WHERE 
      o.customer_id = ? AND
      MONTH(FROM_UNIXTIME(o.placed_on)) = ? AND
      YEAR(FROM_UNIXTIME(o.placed_on)) = ?;
`;
    const result = await executeQuery(getMonthlyTotalsQuery, [
      userId,
      month,
      year,
    ]);
    return result[0] || { total_order_amount: 0, total_amount_paid: 0 };
  } catch (error) {
    console.error("Error executing monthly totals query:", error.message);
    throw new Error("Unable to fetch monthly totals.");
  }
};

const createTransactionForCOD = async (orderId, amount) => {
  try {
    const query = `
      INSERT INTO transactions (order_id, amount, payment_gateway, payment_status, payment_date)
      VALUES (?, ?, 'COD', 'pending', NOW())
    `;

    await executeQuery(query, [orderId, amount]);

    console.log(`Transaction created for COD order with orderId: ${orderId}`);
  } catch (error) {
    console.error("Error creating transaction for COD order:", error.message);
    throw new Error("Error creating COD transaction.");
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
  createOrder,
  addOrderProducts,
  createTransactionForCOD,
  getDailyTransactions,
  getMonthlyTotals,
};
