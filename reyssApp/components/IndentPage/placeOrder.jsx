import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons"; // Assuming you're using Expo
import LoadingIndicator from "../general/Loader";
import OrderDetails from "./nestedPage/orderDetails";
import OrderProductsList from "./nestedPage/orderProductsList";
import BackButton from "../general/backButton";
import SubmitButton from "./nestedPage/submitButton";
import ErrorMessage from "../general/errorMessage";
import OrderModal from "../general/orderModal";
import SearchProductModal from "./nestedPage/searchProductModal";
import { ipAddress } from "../../urls";

const PlaceOrderPage = ({ route }) => {
  const { order, selectedDate, shift } = route.params;
  const [orderDetails, setOrderDetails] = useState([null]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultOrder, setDefaultOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigation = useNavigation();
  const [editable, setEditable] = useState(false);
  const [updatedQuantities, setUpdatedQuantities] = useState({});

  const isPastDate = moment(selectedDate).isBefore(moment(), "day");
  const isCurrentDate = moment(selectedDate).isSame(moment(), "day");

  useEffect(() => {
    const fetchDefaultOrder = async () => {
      const storedOrder = await AsyncStorage.getItem("default");
      console.log(storedOrder);
      if (storedOrder) {
        setDefaultOrder(JSON.parse(storedOrder));
        setShowModal(true); // Show the modal when default order is loaded
      }
      setLoading(false);
    };

    fetchDefaultOrder();
  }, []);

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order.orderId);
    } else {
      if (isPastDate && !orderDetails) {
        showAlertAndGoBack();
      }
    }
  }, [order]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        setError("Authorization token is missing");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://${ipAddress}:8090/order?orderId=${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userAuthToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      setError(err.message || "Error fetching order details");
    } finally {
      setLoading(false);
    }
  };

  const showAlertAndGoBack = () => {
    Alert.alert(
      "No Orders Found",
      "There are no orders for this date.",
      [
        {
          text: "OK",
          // onPress: () => {
          //   navigation.goBack();
          // },
        },
      ],
      { cancelable: false }
    );

    setTimeout(() => {
      navigation.goBack();
    }, 3000);
  };

  const handleAddProduct = async (product) => {
    try {
      // Get current modified order from AsyncStorage
      const storedOrder = await AsyncStorage.getItem("modifiedOrder");
      const currentProducts = storedOrder
        ? JSON.parse(storedOrder)
        : defaultOrder?.products || [];

      // Check if the product already exists
      const isDuplicate = currentProducts.some(
        (existingProduct) => existingProduct.product_id === product.id
      );

      if (isDuplicate) {
        Alert.alert(
          "Item Exists",
          "Please increase the quantity."
        );
        return;
      }

      // Create new product object
      const newProduct = {
        category: product.category,
        name: product.name,
        price: product.discountPrice || product.price,
        product_id: product.id,
        quantity: 1,
      };

      // Add new product to current products
      const updatedProducts = [...currentProducts, newProduct];

      // Update state
      setDefaultOrder({ ...defaultOrder, products: updatedProducts });

      // Save to AsyncStorage
      await AsyncStorage.setItem(
        "modifiedOrder",
        JSON.stringify(updatedProducts)
      );

      // Close search modal
      setShowSearchModal(false);
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Could not add product to the order");
    }
  };

  const handleQuantityChange = async (text, index) => {
    try {
      // Get current products from AsyncStorage
      const storedOrder = await AsyncStorage.getItem("modifiedOrder");
      const currentProducts = storedOrder
        ? JSON.parse(storedOrder)
        : defaultOrder?.products || [];

      // Create a new array of products
      const updatedProducts = [...currentProducts];
      const parsedQuantity = parseInt(text, 10);

      // Update quantity for the specific product
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: isNaN(parsedQuantity) ? 0 : parsedQuantity,
      };

      // Update state with new products
      setDefaultOrder({ ...defaultOrder, products: updatedProducts });

      // Save to AsyncStorage - store just the products array
      await AsyncStorage.setItem(
        "modifiedOrder",
        JSON.stringify(updatedProducts)
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Could not update quantity");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const updatedOrder = {
        ...defaultOrder,
        products: defaultOrder.products.map((product) => ({
          ...product,
          quantity: updatedQuantities[product.id] || product.quantity,
        })),
      };

      // Update state
      setDefaultOrder(updatedOrder);

      // Save to AsyncStorage
      await AsyncStorage.setItem("modifiedOrder", JSON.stringify(updatedOrder));

      // Exit edit mode
      setEditable(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert("Error", "Could not save changes");
    }
  };

  const handleSelectOrder = () => {
    setEditable(false);
    setShowModal(false);
  };

  const handleEditOrder = () => {
    setEditable(true);
    setShowModal(false);
    const initialQuantities = defaultOrder?.products.reduce((acc, product) => {
      acc[product.id] = product.quantity;
      return acc;
    }, {});
    setUpdatedQuantities(initialQuantities);
  };

  const handleSubmit = async () => {
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        Alert.alert("Error", "Authorization token is missing.");
        return;
      }
      const orderDate = new Date().toISOString();

      const options = {
        method: "POST",
        url: `http://${ipAddress}:8090/place`,
        data: {
          products: defaultOrder.products,
          orderType: shift,
          orderDate,
        },
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios(options);
      if (response.status === 200) {
        // Clear the modified order after successful submission
        await AsyncStorage.removeItem("modifiedOrder");

        Alert.alert("Success", "Order has been submitted successfully.");
        navigation.navigate("IndentPage");
      } else {
        throw new Error("Unexpected response status.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response) {
        console.log(error.response.data.message);
        Alert.alert(
          "Error",
          error.response.data.message || "Server error occurred."
        );
      } else if (error.request) {
        console.log("Network error:", error.request);
        Alert.alert("Error", "Network error, please check your connection.");
      } else {
        console.error("Error:", error.message);
        Alert.alert("Error", error.message || "An error occurred.");
      }
    }
  };

  const handleSubmitEdit = async () => {
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        Alert.alert("Error", "Authorization token is missing.");
        return;
      }

      const modified = await AsyncStorage.getItem("modifiedOrder");
      const data = JSON.parse(modified);

      // Transform the data
      const transformedData = data.map((item) => ({
        id: item.product_id,
        quantity: item.quantity,
      }));
      const orderDate = new Date().toISOString();

      const options = {
        method: "POST",
        url: `http://${ipAddress}:8090/place`,
        data: {
          products: transformedData,
          orderType: shift,
          orderDate,
        },
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios(options);
      if (response.status === 200) {
        // Clear the modified order after successful submission
        await AsyncStorage.removeItem("modifiedOrder");

        Alert.alert("Success", "Order has been submitted successfully.");
        navigation.navigate("IndentPage");
      } else {
        throw new Error("Unexpected response status.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      if (error.response) {
        console.log(error.response.data.message);
        Alert.alert(
          "Failure",
          error.response.data.message || "Server error occurred."
        );
      } else if (error.request) {
        console.log("Network error:", error.request);
        Alert.alert("Error", "Network error, please check your connection.");
      } else {
        console.error("Error:", error.message);
        Alert.alert("Error", error.message || "An error occurred.");
      }
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton navigation={navigation} />
        {editable && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearchModal(true)}
          >
            <Icon name="search" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Render defaultOrder and handle logic based on whether it's a past date */}
      {defaultOrder && (
        <>
          {/* Handle logic for past dates */}
          {isPastDate || (isCurrentDate && !orderDetails) ? (
            // View-only mode for past dates, no editing or submitting
            <>
              <OrderDetails
                orderDetails={orderDetails}
                selectedDate={selectedDate}
                shift={shift}
                isEditable={editable}
              />
              <OrderProductsList
                products={orderDetails.products}
                isEditable={false} // Disable edit mode for past dates
              />
            </>
          ) : (
            // Editable mode for current or future dates
            <>
              <OrderDetails
                orderDetails={defaultOrder}
                selectedDate={selectedDate}
                shift={shift}
                isEditable={editable}
              />
              <OrderProductsList
                products={defaultOrder.products}
                isEditable={editable}
                onQuantityChange={handleQuantityChange}
              />

              {/* Show SubmitButton or OrderModal based on the editable state */}
              {editable ? (
                <SubmitButton handleSubmit={handleSubmitEdit} />
              ) : (
                <>
                  <OrderModal
                    isVisible={showModal}
                    onClose={() => setShowModal(false)}
                    onSelect={handleSelectOrder}
                    onEdit={handleEditOrder}
                  />
                  <SubmitButton handleSubmit={handleSubmit} />
                </>
              )}

              {/* Show search modal when adding products */}
              <SearchProductModal
                isVisible={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                onAddProduct={handleAddProduct}
              />
            </>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffcc00",
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  searchButton: {
    padding: 10,
  },
});

export default PlaceOrderPage;
