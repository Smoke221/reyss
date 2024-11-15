import React from "react";
import { View, Text, StyleSheet } from "react-native";

const HomePage = () => {
  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.headerText}>Account</Text>
      </View> */}
      <Text style={styles.text}>Welcome to the Home Page!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default HomePage;
