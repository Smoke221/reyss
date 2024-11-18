import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const PlaceOrderPage = ({ route }) => {
  const { orderDetails, selectedDate, shift } = route.params;
  const navigation = useNavigation();

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>{item.quantity}</Text>
      <Text style={styles.itemText}>{item.units}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.headerText}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        {/* <Text style={styles.dateText}>{selectedDate}</Text> */}
      </View>

      {/* Order Info */}
      <View style={styles.orderInfoContainer}>
        <Text style={styles.orderText}>Delivery: {selectedDate}</Text>
        <Text style={styles.orderText}>Customer Name</Text>
        <Text style={styles.orderText}>Route</Text>
        <Text style={styles.orderText}>Shift: {shift}</Text>
        <Text style={styles.orderText}>Total Amount</Text>
      </View>

      {/* Order List */}
      <View style={styles.orderListContainer}>
        <View style={styles.itemHeaderRow}>
          <Text style={styles.itemHeaderText}>Item</Text>
          <Text style={styles.itemHeaderText}>Quantity</Text>
          <Text style={styles.itemHeaderText}>Units</Text>
        </View>
        <FlatList
          data={orderDetails}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
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
  dateText: {
    fontSize: 18,
    color: "#fff",
  },
  orderInfoContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  orderText: {
    fontSize: 16,
    marginVertical: 2,
  },
  orderListContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 16,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PlaceOrderPage;
