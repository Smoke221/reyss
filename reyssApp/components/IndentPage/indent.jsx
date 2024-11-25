import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { ipAddress } from "../../urls";
import CalendarComponent from "./calendar";
import OrdersList from "./orderList";

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

      const response = await fetch(`http://${ipAddress}:8090/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userAuthToken}`,
        },
      });

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

  // Memoizing orders for the selected date
  const { amOrder, pmOrder } = useMemo(() => {
    const dayOrders = orders[selectedDate] || {};
    return {
      amOrder: dayOrders.AM || null,
      pmOrder: dayOrders.PM || null,
    };
  }, [orders, selectedDate]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Indent</Text>
      </View>

      {/* Calendar Component */}
      <CalendarComponent
        selectedDate={selectedDate}
        handleDatePress={handleDatePress}
      />

      {/* Orders List */}
      <OrdersList
        amOrder={amOrder}
        pmOrder={pmOrder}
        selectedDate={selectedDate}
        navigation={navigation}
      />
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
});

export default IndentPage;
