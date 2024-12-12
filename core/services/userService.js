const jwt = require("jsonwebtoken");
const { findUserByUserName, getUserById } = require("./dbUtility");
const { getProductsWithDetails } = require("../helpers/productDetailsMap");

const loginUser = async (username, password) => {
  try {
    const user = await findUserByUserName(username);

    if (user.password !== password) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "Incorrect password.",
        },
      };
    }
    const token = jwt.sign(
      { id: user.customer_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Login successful",
        data: { token, user: user[0] },
      },
    };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

const getUserDetailsByCustomerId = async (customerId) => {
  try {
    const { user, defaultOrder, latestOrder } = await getUserById(customerId);

    let detailedDefaultOrder = defaultOrder
      ? await getProductsWithDetails(defaultOrder)
      : null;
    // const detailedLatestOrder = await getProductsWithDetails(latestOrder);
    return {
      user,
      defaultOrder: detailedDefaultOrder,
      latestOrder,
    };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

module.exports = { loginUser, getUserDetailsByCustomerId };
