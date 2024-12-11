const { addUser, isUserExists, getAllOrders } = require("./dbUtility");

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
