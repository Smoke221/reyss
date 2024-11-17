import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";

const API_BASE_URL = "http://10.0.18.105:8090";

const IndentPage = () => {
  const [orders, setOrders] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const customerId = await AsyncStorage.getItem("customerId");
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");

      if (!customerId || !userAuthToken) {
        console.error("Missing customerId or userAuthToken");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/history?customerId=${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuthToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDatePress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);
  };

  // Memoizing orders for the selected date to prevent recalculations on every render
  const { amOrder, pmOrder } = useMemo(() => {
    const dayOrders = orders[selectedDate] || {};
    return {
      amOrder: dayOrders.AM || null,
      pmOrder: dayOrders.PM || null,
    };
  }, [orders, selectedDate]);

  const handleOrderClick = (orderDetails, shift) => {
    navigation.navigate("PlaceOrderPage", {
      orderDetails,
      selectedDate,
      shift,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Indent</Text>
      </View>

      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDatePress}
        markedDates={{ [selectedDate]: { selected: true } }}
        theme={{
          selectedDayBackgroundColor: "#ffcc00",
          todayTextColor: "#ffcc00",
        }}
        renderArrow={(direction) => (
          <MaterialIcons
            name={direction === "left" ? "arrow-back" : "arrow-forward"}
            size={24}
            color="#ffcc00"
          />
        )}
      />

      {/* Order Details */}
      <ScrollView style={styles.ordersContainer}>
        {/* AM Order */}
        <OrderCard
          shift="AM"
          order={amOrder}
          selectedDate={selectedDate}
          onOrderClick={handleOrderClick}
        />

        {/* PM Order */}
        <OrderCard
          shift="PM"
          order={pmOrder}
          selectedDate={selectedDate}
          onOrderClick={handleOrderClick}
        />
      </ScrollView>
    </View>
  );
};

const OrderCard = ({ shift, order, selectedDate, onOrderClick }) => (
  <View style={styles.orderCard}>
    <Text style={styles.orderType}>{shift}</Text>
    {order ? (
      <View style={styles.orderBox}>
        <Text style={styles.orderText}>Quantity: {order.quantity}</Text>
        <Text style={styles.orderText}>Total Amount: ₹{order.totalAmount}</Text>
        <Text style={styles.orderText}>Date: {selectedDate}</Text>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => onOrderClick(order.items, shift)}
        >
          <MaterialIcons name="arrow-forward" size={30} color="#ffcc00" />
        </TouchableOpacity>
      </View>
    ) : (
      <Text style={styles.naText}>N/A</Text>
    )}
  </View>
);

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
  ordersContainer: {
    flex: 1,
    padding: 10,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
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
    top: 10,
  },
});

export default IndentPage;
