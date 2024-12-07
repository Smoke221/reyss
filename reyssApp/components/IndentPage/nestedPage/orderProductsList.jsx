import React from "react";
import { View, Text, FlatList, StyleSheet, TextInput } from "react-native";

const OrderProductsList = ({ products, isEditable, onQuantityChange }) => {
  const renderItem = ({ item, index }) => (
    <View style={styles.itemRow}>
      <Text style={[styles.itemText, { flex: 6 }]}>{item.name}</Text>

      {isEditable ? (
        <TextInput
          style={[styles.input, { flex: 1 }]}
          keyboardType="numeric"
          value={String(item.quantity)}
          onChangeText={(text) => onQuantityChange(text, index)}
        />
      ) : (
        <Text style={[styles.itemText, { flex: 1 }]}>{item.quantity}</Text>
      )}

      <Text style={[styles.itemText, { flex: 1 }]}>pkts</Text>
    </View>
  );

  return (
    <View style={styles.orderListContainer}>
      <View style={styles.itemHeaderRow}>
        <Text style={[styles.itemHeaderText, { flex: 6 }]}>Item</Text>
        <Text style={[styles.itemHeaderText, { flex: 1 }]}>Qty</Text>
        <Text style={[styles.itemHeaderText, { flex: 1 }]}>Unit</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.product_id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  input: {
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    // padding: 5,
    borderRadius: 5,
    textAlign: "center",
    width: 10,
    marginHorizontal: 5,
  },
});

export default OrderProductsList;
