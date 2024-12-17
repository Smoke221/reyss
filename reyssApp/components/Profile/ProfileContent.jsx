import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For storing and retrieving the token
import axios from "axios";
import { ipAddress } from "../../urls";

const ProfileContent = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [defaultOrder, setDefaultOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch user data on component mount
    const fetchUserDetails = async () => {
      try {
        // Get the token from AsyncStorage
        const token = await AsyncStorage.getItem("userAuthToken");
        if (!token) {
          throw new Error("No authorization token found.");
        }

        // API call to /userDetails with the Authorization Bearer token
        const response = await axios.get(`http://${ipAddress}:8090/userDetails`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { user, defaultOrder } = response.data;
        setUserData(user); // Set the user data
        setDefaultOrder(defaultOrder); // Set the default order
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchUserDetails();
  }, []);

  // Handle loading and error states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>User Details</Text>

      {/* Display User Information */}
      <View style={styles.section}>
        <Text style={styles.title}>Name: {userData?.name}</Text>
        <Text>Email: {userData?.email}</Text>
        <Text>Phone: {userData?.phone}</Text>
        {/* Add more user details as necessary */}
      </View>

      {/* Display Default Order */}
      {defaultOrder ? (
        <View style={styles.section}>
          <Text style={styles.title}>Default Order</Text>
          <Text>Order ID: {defaultOrder.id}</Text>
          <Text>Order Date: {new Date(defaultOrder.date).toDateString()}</Text>
          {/* Assuming defaultOrder contains a list of products */}
          <Text>Products:</Text>
          {defaultOrder.products.map((product, index) => (
            <Text key={index}>
              {product.name} - {product.quantity} x {product.price} USD
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.title}>No Default Order</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ProfileContent;
