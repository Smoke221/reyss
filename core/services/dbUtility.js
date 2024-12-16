const { executeQuery } = require("../dbUtils/db");
const bcrypt = require("bcryptjs");

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

const getProductss = async () => {
  try {
    let query = "SELECT * FROM products";
    const products = await executeQuery(query);
    console.log(`🪵 → products:`, products);
    return products;
  } catch (error) {
    console.error("Error in dbutility --> getProducts:", error);
    throw error;
  }
};

const getProducts = async (filters) => {
  try {
    let query = "SELECT * FROM products";
    const values = [];

    if (filters.search) {
      query += " WHERE name LIKE ?";
      values.push(`%${filters.search}%`);
    }

    const products = await executeQuery(query, values);
    return products;
  } catch (error) {
    console.error("Error in dbutility --> getProducts:", error);
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
    const availableProducts = await getProductss();

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

const addUser = async (userDetails) => {
  try {
    const insertUserQuery = `
      INSERT INTO users (customer_id, username, name, password, created_at, updated_at)
      VALUES (?, ?, ?, ?, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
    `;

    await executeQuery(insertUserQuery, [
      userDetails.customer_id,
      userDetails.username,
      userDetails.name,
      userDetails.password,
    ]);
  } catch (error) {
    console.error("Error addUser dbUtility", error.message);
    throw new Error("Error in addUser.");
  }
};

const getAllOrders = async (params) => {
  try {
    const {
      search = "",
      orderBy = "ASC", // Default order
      status = "ACTIVE", // Default status
      limit = 10,
      page = 1,
      category, // Category filter
      name, // Product name filter
      date, // Date filter (specific date)
    } = params;

    const offset = (page - 1) * limit;

    // Base query for orders, joining with users for customer details and order_products for product details
    let query = `SELECT o.*, u.name AS customer_name, op.category, op.name AS product_name
                 FROM orders o
                 JOIN users u ON o.customer_id = u.customer_id
                 JOIN order_products op ON o.id = op.order_id
                 WHERE 1=1 `;

    const values = [];

    // Dynamically add search condition if `search` is provided
    if (search) {
      query += ` AND u.name LIKE ?`;
      values.push(`%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query += ` AND op.category = ?`;
      values.push(category);
    }

    // Add product name filter if provided
    if (name) {
      query += ` AND op.name LIKE ?`;
      values.push(`%${name}%`);
    }

    // Add date filter if provided
    if (date) {
      const startDate = new Date(date).setHours(0, 0, 0, 0) / 1000; // Start of the day (epoch time)
      const endDate = new Date(date).setHours(23, 59, 59, 999) / 1000; // End of the day (epoch time)
      query += ` AND o.placed_on BETWEEN ? AND ?`;
      values.push(startDate, endDate);
    }

    // Dynamically add sorting
    query += ` ORDER BY o.placed_on ${orderBy} LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    // Execute the query
    const orders = await executeQuery(query, values);

    // Count query for total orders (without any filters)
    let countQuery = `SELECT COUNT(*) AS count
                      FROM orders o
                      JOIN order_products op ON o.id = op.order_id
                      JOIN users u ON o.customer_id = u.customer_id
                      WHERE 1=1`;

    const countValues = [];

    const [countResult] = await executeQuery(countQuery, countValues);

    // Return both the filtered orders and the total count
    return { orders, count: countResult.count };
  } catch (error) {
    console.error("Error in getAllOrders dbUtility:", error);
    throw new Error("Failed to get all orders.");
  }
};

const setAmOrder = async (products) => {
  try {
    const query = `INSERT INTO am_order_products (product_id) VALUES ?`;

    const values = products.map((id) => [id]);
    const response = await executeQuery(query, [values]);
    return response;
  } catch (error) {
    console.error("Error in setAmOrder dbUtility:", error);
    throw new Error("Failed to set AM orders.");
  }
};

const getAllUsers = async (searchQuery) => {
  try {
    let query = `SELECT * FROM users WHERE role = "user"`;

    if (searchQuery) {
      query += `AND name LIKE ?`;
    }

    const values = searchQuery ? [`%${searchQuery}%`] : [];
    const response = await executeQuery(query, values);
    return response;
  } catch (error) {
    console.error("Error in getAllUsers dbUtility:", error);
    throw new Error("Failed to get all users.");
  }
};

const addProduct = async (productData) => {
  try {
    const query = `
      INSERT INTO products (name, brand, category, price, discountPrice, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      productData.name,
      productData.brand,
      productData.category,
      productData.price,
      productData.discountPrice,
      productData.created_at,
      productData.updated_at,
    ];

    const response = await executeQuery(query, values);
    return response;
  } catch (error) {
    console.error("Error in addProduct dbUtility:", error);
    throw new Error("Failed to add product.");
  }
};

const changePassword = async (id, oldPassword, newPassword) => {
  try {
    const query = `SELECT password FROM users WHERE customer_id = ?`;
    const [user] = await executeQuery(query, [id]);

    if (!user) {
      throw new Error("User not found.");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return null;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updateQuery = `UPDATE users SET password = ?, updated_at = ? WHERE customer_id = ?`;
    await executeQuery(updateQuery, [
      hashedPassword,
      Math.floor(Date.now() / 1000),
      id,
    ]);

    return true;
  } catch (error) {
    console.error("Error in changePassword dbUtility:", error);
    throw new Error("Failed to change password.");
  }
};

const updateUser = async (customer_id, userDetails) => {
  try {
    const setPlaceholders = Object.keys(userDetails)
      .map((key) => `${key} = ?`)
      .join(", ");

    const updateQuery = `UPDATE users SET ${setPlaceholders} WHERE customer_id = ?`;

    const values = [...Object.values(userDetails), customer_id];
    const response = await executeQuery(updateQuery, values);
    return response;
  } catch (error) {
    console.error("Error in updateUser dbUtility:", error);
    throw new Error("Failed to update user.");
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
  addUser,
  getAllOrders,
  setAmOrder,
  getAllUsers,
  addProduct,
  changePassword,
  updateUser,
  getProductss,
};
