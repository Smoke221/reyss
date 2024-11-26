const jwt = require("jsonwebtoken");
const { findUserByUserName, getUserById } = require("./dbUtility");
const { getProductsWithDetails } = require("../helpers/productDetailsMap");

const loginUser = async (username, password) => {
  try {
    const user = await findUserByUserName(username);
    if (user.statusCode) {
      return user;
    }
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
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return {
      statusCode: 200,
      response: {
        status: true,
        message: "Login successful",
        data: { token, user },
      },
    };
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
};

const getUserDetailsByCustomerId = async (customerId) => {
  try {
    const { user, defaultOrder, latestOrder } = await getUserById(customerId);

    const detailedDefaultOrder = await getProductsWithDetails(defaultOrder);
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
