import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import axios from "axios";
import moment from "moment";
import { ipAddress } from "../../urls";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import MaterialIcons

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment().format("MM"));
  const [currentYear, setCurrentYear] = useState(moment().format("YYYY"));
  const [viewedMonth, setViewedMonth] = useState(currentMonth);
  const [viewedYear, setViewedYear] = useState(currentYear);
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);

  const fetchTransactions = async (month, year) => {
    setLoading(true);
    try {
      const userAuthToken = await AsyncStorage.getItem("userAuthToken");
      if (!userAuthToken) {
        Alert.alert("Error", "Authorization token is missing.");
        return;
      }

      const options = {
        method: "GET",
        url: `http://16.171.111.246:8090/trans`,
        params: { month, year },
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios(options);

      const { orders, total_order_amount, total_amount_paid } =
        response.data.data;
      setTransactions(orders);
      setTotalOrderAmount(total_order_amount);
      setTotalAmountPaid(total_amount_paid);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(viewedMonth, viewedYear);
  }, [viewedMonth, viewedYear]);

  const goToPreviousMonth = () => {
    const previousMonth = moment(
      `${viewedYear}-${viewedMonth}`,
      "YYYY-MM"
    ).subtract(1, "month");
    setViewedMonth(previousMonth.format("MM"));
    setViewedYear(previousMonth.format("YYYY"));
  };

  const goToNextMonth = () => {
    const nextMonth = moment(`${viewedYear}-${viewedMonth}`, "YYYY-MM").add(
      1,
      "month"
    );
    if (nextMonth.isAfter(moment())) return; // Prevent future navigation
    setViewedMonth(nextMonth.format("MM"));
    setViewedYear(nextMonth.format("YYYY"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.tabTitle}>Transactions</Text>

      {/* Month Navigation */}
      <View style={styles.navigation}>
        <Icon
          name="navigate-before"
          size={30}
          color={
            viewedMonth === "01" && viewedYear === currentYear
              ? "#d3d3d3"
              : "#ffcc00"
          } // Disable for the first month of the current year
          onPress={goToPreviousMonth}
          disabled={viewedMonth === "01" && viewedYear === currentYear}
        />
        <Text style={styles.monthText}>
          {moment(`${viewedYear}-${viewedMonth}`).format("MMMM YYYY")}
        </Text>
        <Icon
          name="navigate-next"
          size={30}
          color={
            moment(`${viewedYear}-${viewedMonth}`, "YYYY-MM").isSame(
              moment(),
              "month"
            )
              ? "#d3d3d3"
              : "#ffcc00"
          } // Disable next button for current month
          onPress={goToNextMonth}
          disabled={moment(`${viewedYear}-${viewedMonth}`, "YYYY-MM").isSame(
            moment(),
            "month"
          )}
        />
      </View>

      {/* Totals for the month */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          Total Invoice: ₹{totalOrderAmount || 0}
        </Text>
        <Text style={styles.totalText}>Total Paid: ₹{totalAmountPaid || 0}</Text>
      </View>

      {/* Header for transactions */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Date</Text>
        <Text style={styles.headerText}>Invoice</Text>
        <Text style={styles.headerText}>Paid</Text>
      </View>

      {/* Transactions */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text>{moment(item.order_date).format("MMM DD")}</Text>
              <Text style={styles.amountText}>₹{item.order_amount}</Text>
              <Text style={styles.amountText}>₹{item.amount_paid}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No transactions for this month.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  tabTitle: {
    backgroundColor: "#ffcc00",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffcc00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
    elevation: 2,
  },
  amountText: {
    width: 90,
    textAlign: "center",
  },
});

export default TransactionsPage;
