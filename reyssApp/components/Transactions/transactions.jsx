import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const TransactionsPage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Transactions Page!</Text>
      {/* You can add further transaction details or functionality here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default TransactionsPage;
