const {
  addUser,
  isUserExists,
  getAllOrders,
  setAmOrder,
  getAllUsers,
} = require("./dbUtility");

exports.addUserService = async (userDetails) => {
  try {
    const existingUser = await isUserExists(userDetails.customer_id);

    if (existingUser) {
      return {
        statusCode: 400,
        response: { status: false, message: "User already exists." },
      };
    }

    const insertResponse = await addUser(userDetails);
    return {
      statusCode: 201,
      response: {
        status: true,
        message: "Added user.",
      },
    };
  } catch (error) {
    console.error("Error in addUserService:", error);
    throw new Error("Failed to add user to db from admin.");
  }
};

exports.getAllOrdersService = async (params) => {
  try {
    const getResult = await getAllOrders(params);

    return {
      statusCode: 200,
      response: {
        status: true,
        data: getResult,
      },
    };
  } catch (error) {
    console.error("Error in getAllOrdersService:", error);
    throw new Error("Failed to get all orders.");
  }
};

exports.setAmOrderService = async (products) => {
  try {
    const addResponse = await setAmOrder(products);

    return {
      statusCode: 200,
      response: {
        status: true,
        data: addResponse,
      },
    };
  } catch (error) {
    console.error("Error in setAmOrderService:", error);
    throw new Error("Failed to set AM order.");
  }
};

exports.getAllUsersService = async (searchQuery) => {
  try {
    const getResponse = await getAllUsers(searchQuery);
    return {
      statusCode: 200,
      response: {
        status: true,
        data: getResponse,
      },
    };
  } catch (error) {
    console.error("Error in getAllUsersService:", error);
    throw new Error("Failed to get all users.");
  }
};
