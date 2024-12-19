const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  findUserByUserName,
  getUserById,
  changePassword,
  updateUser,
  orderHistory,
} = require("./dbUtility");
const { getProductsWithDetails } = require("../helpers/productDetailsMap");

const loginUser = async (username, password) => {
  try {
    const user = await findUserByUserName(username);

    if (!user || !user.username) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "User not found.",
        },
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "Incorrect credentials.",
        },
      };
    }

    const token = jwt.sign(
      { id: user.customer_id, username: user.username, role: user.role },
      "smokeFirstMobileApp",
      { expiresIn: "1h" }
    );

    await updateUser(user.customer_id, {
      last_login: Math.floor(Date.now() / 1000),
    });

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Login successful",
        token,
      },
    };
  } catch (err) {
    console.error("Error in loginUser:", err.message);
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

const changePasswordService = async (id, oldPassword, newPassword) => {
  try {
    // Fetch user details and verify old password
    const user = await changePassword(id, oldPassword, newPassword);

    if (!user) {
      return {
        statusCode: 400,
        response: {
          status: false,
          message: "Old password is incorrect.",
        },
      };
    }

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Password changed successfully.",
      },
    };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

const orderHistoryService = async (customerId, params) => {
  try {
    const getResponse = await orderHistory(customerId, params);

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Orders retrieved.",
        orders: getResponse.response,
        count: getResponse.count,
      },
    };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

module.exports = {
  loginUser,
  getUserDetailsByCustomerId,
  changePasswordService,
  orderHistoryService,
};
