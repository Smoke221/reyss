import React from "react";
import { View, Text, StyleSheet } from "react-native";

const OrderDetails = ({ orderDetails, selectedDate, shift }) => {
  console.log(orderDetails, selectedDate, shift);
  
  return (
    <View style={styles.orderInfoContainer}>
      {orderDetails.order.id && (
        <Text style={styles.orderText}>Order ID: {orderDetails.order.id}</Text>
      )}
      <Text style={styles.orderText}>Delivery Date: {selectedDate}</Text>
      {/* <Text style={styles.orderText}>Customer Name: Customer Name</Text> */}
      {/* <Text style={styles.orderText}>Route: Route info here</Text> */}
      <Text style={styles.orderText}>Shift: {shift}</Text>
      <Text style={styles.orderText}>
        Total Amount: ₹{orderDetails.order.total_amount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default OrderDetails;
