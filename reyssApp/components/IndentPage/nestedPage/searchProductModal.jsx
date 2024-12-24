import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "../../../urls";
import { checkTokenAndRedirect } from "../../../services/auth";
import { useNavigation } from "@react-navigation/native";

const SearchProductModal = ({ isVisible, onClose, onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [products, setProducts] = useState([]); // Products to be shown (based on search)
  const [categories, setCategories] = useState([]); // Store unique categories
  const [selectedCategory, setSelectedCategory] = useState(""); // Store selected category
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    // Fetch all products when modal is visible
    if (isVisible) {
      fetchProducts();
    }
  }, [isVisible]);

  useEffect(() => {
    // Filter products when search query or category changes
    filterProducts();
  }, [searchQuery, selectedCategory, allProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const userAuthToken = await checkTokenAndRedirect(navigation)

      const response = await axios.get(`http://${ipAddress}:8090/products`, {
        headers: {
          Authorization: `Bearer ${userAuthToken}`,
          "Content-Type": "application/json",
        },
      });

      setAllProducts(response.data); // Store all products
      setProducts(response.data); // Initially display all products

      // Extract unique categories from the products
      const productCategories = [
        ...new Set(response.data.map((product) => product.category)),
      ];
      setCategories(productCategories);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = allProducts;

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) =>
        product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Apply search query filter
    if (searchQuery.length > 2) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setProducts(filtered);
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productItem}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>
          Price: ₹{item.discountPrice} | {item.category}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAddProduct(item)}
      >
        <Ionicons name="add" size={18} color="white" />
      </TouchableOpacity>
    </View>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton,
      ]}
      onPress={() => {
        if (searchQuery) {
          setSearchQuery("");
        }
        //remove the condition if you need the search params even if the category is selected.
        setSelectedCategory(selectedCategory === category ? "" : category);
      }}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.selectedCategoryButtonText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.categoryFilterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  !selectedCategory && styles.selectedCategoryButton,
                ]}
                onPress={() => setSelectedCategory("")}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    !selectedCategory && styles.selectedCategoryButtonText,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => renderCategoryButton(category))}
            </ScrollView>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {loading && <Text>Loading...</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchQuery.length > 2
                  ? "No products found"
                  : "Type at least 3 characters to search"}
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "75%",
    padding: 20,
  },
  categoryFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  categoryButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginRight: 5,
    marginBottom: 5,
  },
  selectedCategoryButton: {
    backgroundColor: "#ffcc00",
  },
  categoryButtonText: {
    fontSize: 12,
    color: "#333",
  },
  selectedCategoryButtonText: {
    color: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  closeButton: {
    padding: 10,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  productDetails: {
    color: "#666",
    marginTop: 5,
  },
  addButton: {
    backgroundColor: "#ffcc00",
    borderRadius: 20,
    padding: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});

export default SearchProductModal;
