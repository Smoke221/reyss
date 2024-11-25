import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment"; // Use moment to handle date comparison
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../urls";
import LoadingIndicator from "../general/Loader";
import OrderDetails from "./nestedPage/orderDetails";
import OrderProductsList from "./nestedPage/orderProductsList";
import BackButton from "../general/backButton";
import SubmitButton from "./nestedPage/submitButton";
import ErrorMessage from "../general/errorMessage";

const PlaceOrderPage = ({ route }) => {
  const { order, selectedDate, shift } = route.params;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Alert to show when there are no orders and navigate back on dismissal
  const showAlertAndGoBack = (message) => {
    Alert.alert(
      message,
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  const isPastDate = moment(selectedDate).isBefore(moment(), "day");

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order.orderId);
    } else {
      setLoading(false); // No order to fetch, just display a message
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

      if (data.status) {
        setOrderDetails(data.data);
      } else {
        setError("Order details not found");
      }
    } catch (err) {
      setError(err.message || "Error fetching order details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    console.log("Order submitted");
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
          {orderDetails ? (
            <OrderDetails
              orderDetails={orderDetails}
              selectedDate={selectedDate}
              shift={shift}
            />
          ) : (
            <ErrorMessage message="No default order available." />
          )}

          {!isPastDate && <SubmitButton handleSubmit={handleSubmit} />}
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
