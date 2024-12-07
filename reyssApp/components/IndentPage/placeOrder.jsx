import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../urls";
import LoadingIndicator from "../general/Loader";
import OrderDetails from "./nestedPage/orderDetails";
import OrderProductsList from "./nestedPage/orderProductsList";
import BackButton from "../general/backButton";
import SubmitButton from "./nestedPage/submitButton";
import ErrorMessage from "../general/errorMessage";
import OrderModal from "../general/orderModal";
import axios from "axios";

const PlaceOrderPage = ({ route }) => {
  const { order, selectedDate, shift } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultOrder, setDefaultOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation();
  const [editable, setEditable] = useState(false); // For editing mode
  const [updatedQuantities, setUpdatedQuantities] = useState({}); // Track updated quantities

  const isPastDate = moment(selectedDate).isBefore(moment(), "day");

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

      // if (data.status) {
      //   setOrderDetails(data);
      // } else {
      //   setError("Order details not found");
      // }
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

  const handleSubmit = async () => {
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        Alert.alert("Error", "Authorization token is missing.");
        return;
      }

      const options = {
        method: "POST",
        url: `http://${ipAddress}:8090/place`,
        data: {
          products: defaultOrder.products,
          orderType: shift,
        },
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios(options);
      if (response.status === 200) {
        console.log("Order submitted successfully:", response.data);
        Alert.alert("Success", "Order has been submitted successfully.");
        // navigation.navigate("OrderHistoryPage");
      } else {
        throw new Error("Unexpected response status.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        Alert.alert(
          "Error",
          error.response.data.message || "Server error occurred."
        );
      } else if (error.request) {
        console.error("Network error:", error.request);
        Alert.alert("Error", "Network error, please check your connection.");
      } else {
        console.error("Error:", error.message);
        Alert.alert("Error", error.message || "An error occurred.");
      }
    }
  };

  const handleSelectOrder = () => {
    // setOrderDetails(defaultOrder);
    setShowModal(false);
  };

  // Toggle between edit and non-edit mode
  const handleEditOrder = () => {
    setEditable(true);
    setShowModal(false);
    const initialQuantities = defaultOrder?.products.reduce((acc, product) => {
      acc[product.id] = product.quantity; // Initialize the quantities
      return acc;
    }, {});
    setUpdatedQuantities(initialQuantities);
  };

  const handleQuantityChange = (text, index) => {
    const updatedProducts = [...defaultOrder.products];
    const parsedQuantity = parseInt(text, 10);

    // Ensure that the value is a valid number, otherwise default to 0
    updatedProducts[index].quantity = isNaN(parsedQuantity) ? 0 : parsedQuantity;
    
    setDefaultOrder({ ...defaultOrder, products: updatedProducts });
  };

  const handleSaveChanges = () => {
    const updatedOrder = {
      ...defaultOrder,
      products: defaultOrder.products.map((product) => ({
        ...product,
        quantity: updatedQuantities[product.id] || product.quantity,
      })),
    };
    setDefaultOrder(updatedOrder); // Update order with new quantities
    setEditable(false);
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

  console.log(orderDetails, selectedDate, shift);

  return (
    <View style={styles.container}>
      <BackButton navigation={navigation} />
      {isPastDate ? (
        orderDetails ? (
          <>
            <OrderDetails
              orderDetails={orderDetails}
              selectedDate={selectedDate}
              shift={shift}
            />
            <OrderProductsList products={orderDetails.products} />
          </>
        ) : (
          <ErrorMessage message="There are no orders for this date." />
        )
      ) : (
        <View>
          {defaultOrder ? (
            <>
              <OrderDetails
                orderDetails={defaultOrder}
                selectedDate={selectedDate}
                shift={shift}
              />
              <OrderProductsList
                products={
                  orderDetails ? orderDetails.products : defaultOrder.products
                }
                isEditable={!isPastDate}
                onQuantityChange={handleQuantityChange}
              />
              {editable ? (
                <SubmitButton
                  handleSubmit={handleSaveChanges}
                  label="Save Changes"
                />
              ) : (
                <>
                  <OrderModal
                    isVisible={showModal}
                    onClose={() => setShowModal(false)}
                    onSelect={handleSelectOrder}
                    onEdit={handleEditOrder}
                  />
                  <SubmitButton
                    handleSubmit={handleSubmit}
                    label="Submit Order"
                  />
                </>
              )}
            </>
          ) : (
            <ErrorMessage message="No default order available." />
          )}
        </View>
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
});

export default PlaceOrderPage;
