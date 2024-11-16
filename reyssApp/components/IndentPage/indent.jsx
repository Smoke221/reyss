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
      const response = await fetch("YOUR_BACKEND_API/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleDatePress = (day) => {
    setSelectedDate(day.dateString);
    console.log(setSelectedDate(day.dateString));

    const dayOrders = orders[day.dateString];
    if (dayOrders) {
      setAmOrder(dayOrders.AM || null);
      setPmOrder(dayOrders.PM || null);
    } else {
      setAmOrder(null);
      setPmOrder(null);
    }
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
            color="#ffcc00" // Customize arrow colo
          />
        )}
      />

      {/* Order Details */}
      <ScrollView style={styles.ordersContainer}>
        {/* AM Order */}
        <View style={styles.orderCard}>
          <Text style={styles.orderType}>AM</Text>
          {amOrder ? (
            <>
              <Text style={styles.orderText}>Quantity: {amOrder.quantity}</Text>
              <Text style={styles.orderText}>Route: {amOrder.route}</Text>
              <Text style={styles.orderText}>Date: {selectedDate}</Text>
              <TouchableOpacity style={styles.arrowButton}>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.naText}>N/A</Text>
          )}
        </View>

        {/* PM Order */}
        <View style={styles.orderCard}>
          <Text style={styles.orderType}>PM</Text>
          {pmOrder ? (
            <>
              <Text style={styles.orderText}>Quantity: {pmOrder.quantity}</Text>
              <Text style={styles.orderText}>Route: {pmOrder.route}</Text>
              <Text style={styles.orderText}>Date: {selectedDate}</Text>
              <TouchableOpacity style={styles.arrowButton}>
                <Text style={styles.arrowText}>→</Text>
              </TouchableOpacity>
            </>
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
    fontSize: 18,
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
  arrowText: {
    fontSize: 24,
    color: "#ffcc00",
  },
});

export default IndentPage;
