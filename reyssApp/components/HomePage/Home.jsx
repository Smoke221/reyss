import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const HomePage = () => {
  const amountPending = "₹ 10,000";
  const activeIndentAmount = "₹ 10,000";
  const activeIndentDate = "2024-11-15";
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDataAsync = async () => {
      await fetchData();
    };
    fetchDataAsync();
  }, []);

  // Fetch data and update state
  const fetchData = async () => {
    setIsLoading(true);
    const userDetailsData = await userDetailsData1();
    if (userDetailsData) {
      setUserDetails(userDetailsData);
    }
    setIsLoading(false); // Reset loading state after data is fetched
  };

  const isHighAmountPending =
    parseInt(amountPending.replace(/[^0-9]/g, ""), 10) > 5000;

  // Fetch user details from API
  const userDetailsData1 = async () => {
    try {
      const customerId = await AsyncStorage.getItem("customerId");
      const response = await fetch(
        `http://192.168.0.108:8090/userDetails?customerId=${customerId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const userGetResponse = await response.json();
      if (!response.ok || !userGetResponse.status) {
        Alert.alert("Failed", user.message || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const userDetails = {
        customerName: userGetResponse.user.customerName,
        customerID: userGetResponse.user.customerId,
        route: userGetResponse.user.route,
      };
      return userDetails;
    } catch (err) {
      console.error("User details fetch error:", err);
      setIsLoading(false);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  // Destructure userDetails or use empty object to prevent errors
  const { customerName, customerID, route } = userDetails || {};
  return (
    <View style={styles.container}>
      {/* Header section with logo */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
      </View>

      {/* SL Enterprises Logo section */}
      <View style={styles.logoSection}>
        <Image
          source={require("../../assets/SL (1).png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>
          <Text style={styles.boldText}>SL Enterprises</Text> {"\n"}
          Proprietor Lokesh Naidu
        </Text>
      </View>

      {/* Customer Details Section */}
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardText}>Name: {customerName}</Text>
            <Text style={styles.cardText}>ID: {customerID}</Text>
            <Text style={styles.cardText}>Route: {route}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <MaterialIcons name="call" size={24} color="#ffcc00" />
            <Text style={styles.callText}>Call us</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Pending Section with conditional styling */}
      <View
        style={[
          styles.card,
          isHighAmountPending && styles.highAmountCard,
          styles.borderRadiusCard,
        ]}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>Amount Pending: {amountPending}</Text>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>PAY</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Indent Section */}
      <View style={[styles.card, styles.borderRadiusCard]}>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardText}>Active Indent</Text>
            <Text style={styles.cardText}>Date: {activeIndentDate}</Text>
          </View>
          <View style={styles.indentDetails}>
            <Text style={styles.indentAmount}>{activeIndentAmount}</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="#ffcc00"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    backgroundColor: "#ffcc00",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoSection: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    margin: 10,
    marginTop: 100,
    borderRadius: 15,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  logoText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: "#333",
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 18,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 10,
    borderRadius: 15,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  callButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  callText: {
    marginTop: 5,
    fontSize: 16,
    color: "#ffcc00",
    fontWeight: "bold",
  },
  payButton: {
    backgroundColor: "#ffcc00",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  indentDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  indentAmount: {
    fontSize: 16,
    marginRight: 5,
    color: "#333",
  },
  highAmountCard: {
    borderColor: "#ff0000", // Example: red border for high amounts
    borderWidth: 2,
  },
  borderRadiusCard: {
    borderRadius: 50,
  },
});

export default HomePage;
