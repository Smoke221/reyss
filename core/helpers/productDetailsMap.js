const { getProductById } = require("../services/dbUtility");

const getProductsWithDetails = async (products) => {  
  return Promise.all(
    products.map(async (product) => {
      const productDetails = await getProductById(product.product);
      return {
        ...productDetails._doc,
        quantity: product.quantity,
      };
    })
  );
};

module.exports = { getProductsWithDetails };
