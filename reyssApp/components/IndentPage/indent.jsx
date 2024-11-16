import React, { useState, useEffect } from "react";
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

const IndentPage = () => {
  const [orders, setOrders] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [amOrder, setAmOrder] = useState(null);
  const [pmOrder, setPmOrder] = useState(null);

  // Fetch orders when the component loads
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
        `http://192.168.0.108:8090/history?customerId=${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userAuthToken}`,
          },
        }
      );

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDatePress = (day) => {
    const dateString = day.dateString;
    setSelectedDate(dateString);

    const dayOrders = orders[dateString] || "";

    if (dayOrders) {
      setAmOrder(dayOrders.AM || null);
      setPmOrder(dayOrders.PM || null);
    } else {
      setAmOrder(null);
      setPmOrder(null);
    }
  };

  const renderDay = (day) => {
    const dateText = "Note";

    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#888", fontSize: 8 }}>{dateText}</Text>
        <Text style={{ color: "#000", fontSize: 16 }}>{day}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Indent</Text>
      </View>

      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDatePress}
        markedDates={{
          [selectedDate]: { selected: true },
        }}
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
        // dayComponent={({ date, state }) => renderDay(date.day)}
      />

      {/* Order Details */}
      <ScrollView style={styles.ordersContainer}>
        {/* AM Order */}
        <View style={styles.orderCard}>
          <Text style={styles.orderType}>AM</Text>
          {amOrder ? (
            <View style={styles.orderBox}>
              <Text style={styles.orderText}>Quantity: {amOrder.quantity}</Text>
              <Text style={styles.orderText}>
                Total Amount: ₹{amOrder.totalAmount}
              </Text>
              <Text style={styles.orderText}>Date: {selectedDate}</Text>
              <TouchableOpacity style={styles.arrowButton}>
                <MaterialIcons name="arrow-forward" size={30} color="#ffcc00" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.naText}>N/A</Text>
          )}
        </View>

        {/* PM Order */}
        <View style={styles.orderCard}>
          <Text style={styles.orderType}>PM</Text>
          {pmOrder ? (
            <View style={styles.orderBox}>
              <Text style={styles.orderText}>Quantity: {amOrder.quantity}</Text>
              <Text style={styles.orderText}>
                Total Amount: ₹{amOrder.totalAmount}
              </Text>
              <Text style={styles.orderText}>Date: {selectedDate}</Text>
              <TouchableOpacity style={styles.arrowButton}>
                <MaterialIcons name="arrow-forward" size={30} color="#ffcc00" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.naText}>N/A</Text>
          )}
        </View>
      </ScrollView>
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
    // color: "#ffcc00",
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
