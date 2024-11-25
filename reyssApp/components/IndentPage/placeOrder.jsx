import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import moment from "moment"; // Use moment to handle date comparison
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../urls";
import LoadingIndicator from "../general/Loader";

const PlaceOrderPage = ({ route }) => {
  const { order, selectedDate, shift } = route.params; // orderId is passed as part of route params
  const [orderDetails, setOrderDetails] = useState(null); // To store order details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling state
  const navigation = useNavigation();

  // Check if the selected date is in the past
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

  // Render each product in the order
  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text
        style={[styles.itemText, { flex: 6 }, { marginRight: 10 }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
      <Text style={[styles.itemText, { flex: 1 }]}>{item.quantity}</Text>
      <Text style={[styles.itemText, { flex: 1 }]}>pkts</Text>
    </View>
  );

  // Handle order submission (e.g., API call)
  const handleSubmit = () => {
    console.log("Order submitted");
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.headerText}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Order Info */}

      {isPastDate ? (
        orderDetails ? (
          <>
            <View style={styles.orderInfoContainer}>
              <Text style={styles.orderText}>Order ID: {orderDetails._id}</Text>
              <Text style={styles.orderText}>
                Delivery Date: {selectedDate}
              </Text>
              <Text style={styles.orderText}>
                Customer Name: {/* Customer Name Here */}
              </Text>
              <Text style={styles.orderText}>
                Route: {/* Route info here */}
              </Text>
              <Text style={styles.orderText}>Shift: {shift}</Text>
              <Text style={styles.orderText}>
                Total Amount: {orderDetails.totalAmount}
              </Text>
            </View>
            {/* Order List */}
            <View style={styles.orderListContainer}>
              <View style={styles.itemHeaderRow}>
                <Text style={[styles.itemHeaderText, { flex: 6 }]}>Item</Text>
                <Text style={[styles.itemHeaderText, { flex: 1 }]}>Qty</Text>
                <Text style={[styles.itemHeaderText, { flex: 1 }]}>Unit</Text>
              </View>
              <FlatList
                data={orderDetails.products}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
              />
            </View>
          </>
        ) : (
          <Text style={styles.noOrderText}>
            There are no orders for this date.
          </Text>
        )
      ) : (
        <View>
          {/* Display for Current and Future Dates */}
          {orderDetails ? (
            <View style={styles.orderInfoContainer}>
              <Text style={styles.orderText}>Default Order Details</Text>
              {/* Render default order details */}
            </View>
          ) : (
            <Text style={styles.noOrderText}>No default order available.</Text>
          )}

          {/* Submit Button for Future/Current Dates */}
          {!isPastDate && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
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
  header: {
    backgroundColor: "#ffcc00",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  orderInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  orderText: {
    fontSize: 16,
    marginVertical: 2,
  },
  orderListContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "left", // Left-align for better readability
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
    textAlign: "left",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#ffcc00",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#fff",
    padding: 10,
    margin: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  noOrderText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default PlaceOrderPage;
