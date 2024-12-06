const { executeQuery } = require("../dbUtils/db");

const getProductsWithDetails = async (defaultOrder) => {
  try {
    const defaultOrderId = defaultOrder.id;
    const query = `
      SELECT dop.product_id, dop.quantity, dop.price, p.name, p.category
      FROM default_order_products dop
      JOIN products p ON dop.product_id = p.id
      WHERE dop.default_order_id = ?
    `;
    const products = await executeQuery(query, [defaultOrderId]);

    if (products.length === 0) {
      return { message: "No products found in the default order." };
    }
    return {
      order: { ...defaultOrder },
      products: products,
    };
  } catch (error) {
    console.error("Error retrieving product details for default order:", error);
    throw new Error("Failed to get product details.");
  }
};

module.exports = { getProductsWithDetails };
