import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import Icon from "react-native-vector-icons/MaterialIcons";

const OrderProductsList = ({
  products,
  isEditable,
  onQuantityChange,
}) => {
  const [modifiedOrder, setModifiedOrder] = useState(null);

  // Load the modified order from AsyncStorage if editable
  useEffect(() => {
    const loadModifiedOrder = async () => {
      try {
        if (isEditable) {
          const storedOrder = await AsyncStorage.getItem("modifiedOrder");
          if (storedOrder) {
            setModifiedOrder(JSON.parse(storedOrder).products);
          }
        } else {
          setModifiedOrder(null);
        }
      } catch (error) {
        console.error("Error loading modifiedOrder from AsyncStorage:", error);
      }
    };

    loadModifiedOrder();
  }, [isEditable]);

  const handleRemoveProduct = async (productToRemove) => {
    try {
      const updatedProducts = modifiedOrder.filter(
        (product) => product.product_id !== productToRemove.product_id
      );
      console.log(`🪵 → updatedProducts:`, updatedProducts)

      const updatedOrder = {
        ...modifiedOrder,
        products: updatedProducts,
      };

      // Update state
      setModifiedOrder(updatedOrder);

      // Save to AsyncStorage
      await AsyncStorage.setItem("modifiedOrder", JSON.stringify(updatedOrder));
    } catch (error) {
      console.error("Error removing product:", error);
      Alert.alert("Error", "Could not remove product");
    }
  };

  // Use either modifiedOrder (if editable) or the passed products
  const currentProducts =
    isEditable && modifiedOrder ? modifiedOrder : products;

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

      {isEditable && (
        <TouchableOpacity
          onPress={() => handleRemoveProduct(item)}
          style={styles.removeButton}
        >
          <Icon name="delete" size={20} color="red" />
        </TouchableOpacity>
      )}
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
        data={currentProducts}
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
    borderRadius: 5,
    textAlign: "center",
    width: 10,
    marginHorizontal: 5,
  },
});

export default OrderProductsList;
