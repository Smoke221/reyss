const {
  addUser,
  isUserExists,
  getAllOrders,
  setAmOrder,
  getAllUsers,
  addProduct,
  updateUser,
} = require("./dbUtility");
const XLSX = require("xlsx");
const ExcelJS = require("exceljs");

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

exports.addProductService = async (productData) => {
  try {
    // Check if product already exists
    // const existingProduct = await getProductByName(productData.name);
    // if (existingProduct) {
    //   throw new Error("Product already exists.");
    // }

    const addResponse = await addProduct(productData);
    return {
      statusCode: 201,
      response: {
        status: true,
        message: "Product added successfully",
        productId: addResponse.insertId,
      },
    };
  } catch (error) {
    console.error("Error in addProductService:", error);
    throw new Error("Failed to add product.");
  }
};

exports.exportToExcelService = async (data) => {
  try {
    console.log(`🪵 → data:`, data);
    // Check if data is valid and not empty
    // if (!Array.isArray(data) || data.length === 0) {
    //   throw new Error("No data provided for Excel export.");
    // }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Data");

    // Dynamically set columns using the keys of the first object in the data array
    const columns = Object.keys(data[0]).map((key) => ({
      header: key, // Column header
      key, // Access key in data objects
    }));
    worksheet.columns = columns;

    // Add rows
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Create buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return buffer; // Return the buffer for file download
  } catch (error) {
    console.error("Error in exportToExcelService:", error.message);
    throw new Error("Failed to generate Excel file.");
  }
};

exports.updateUserService = async (customer_id, data) => {
  try {
    const response = await updateUser(customer_id, data);
    return {
      statusCode: 201,
      response: {
        status: true,
        message: "Update user.",
      },
    };
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    throw new Error("Failed to update users.");
  }
};
