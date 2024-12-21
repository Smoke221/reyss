import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";

const OrderCard = ({ shift, order, selectedDate, onOrderClick }) => {

  const isPastDate = moment(selectedDate, "YYYY-MM-DD").isBefore(
    moment(),
    "day"
  );

  // Determine if the arrow button should be shown
  const showArrowButton = order || (!order && !isPastDate);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderContent}>
        <Text style={styles.orderType}>{shift}</Text>
        <Text style={styles.orderText}>
          {selectedDate.split("-").reverse().join("-")}
        </Text>
        {order ? (
          <>
            <Text style={styles.orderText}>Quantity: {order.quantity}</Text>
            <Text style={styles.orderText}>
              Total Amount: ₹{order.totalAmount}
            </Text>
          </>
        ) : (
          <Text style={styles.naText}>No Indent</Text>
        )}
      </View>

      {/* Conditionally render the arrow button */}
      {showArrowButton && (
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => onOrderClick(order, shift, selectedDate)}
        >
          <MaterialIcons name="arrow-forward" size={30} color="#ffcc00" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
  },
  orderType: {
    fontSize: 24,
    fontWeight: "bold",
  },
  orderText: {
    fontSize: 16,
    marginVertical: 2,
  },
  naText: {
    fontSize: 16,
    color: "red",
    marginVertical: 2,
  },
  arrowButton: {
    position: "absolute",
    right: 10,
    top: 20,
  },
});

export default OrderCard;
