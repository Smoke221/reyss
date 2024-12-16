import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LogOutButton from "../LogoutButton";
import { useNavigation } from "@react-navigation/native";
import PasswordChangeModal from "./PasswordChangeModal";
import PasswordChangeButton from "../PasswordChangeButton";

const ProfilePage = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons name="person-outline" size={24} color="#ffcc00" />
            <Text style={styles.menuText}>Profile</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>

        {/* Pay here */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons name="payment" size={24} color="#ffcc00" />
            <Text style={styles.menuText}>Pay here</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>

        {/* Payments History */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons name="history" size={24} color="#ffcc00" />
            <Text style={styles.menuText}>Payments History</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>

        {/* Monthly Report */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons
              name="insert-chart-outlined"
              size={24}
              color="#ffcc00"
            />
            <Text style={styles.menuText}>Monthly Report</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>

        {/* Privacy Policy */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons name="security" size={24} color="#ffcc00" />
            <Text style={styles.menuText}>Privacy Policy</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconText}>
            <MaterialIcons name="info-outline" size={24} color="#ffcc00" />
            <Text style={styles.menuText}>Terms & conditions</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#ffcc00" />
        </TouchableOpacity>
      </ScrollView>
      <PasswordChangeButton />
      <LogOutButton navigation={navigation} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Designed by</Text>
        <Text style={styles.footerText}>iSmokeTechLabs</Text>
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
  scrollContainer: {
    padding: 10,
  },
  menuItem: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    elevation: 3, // Shadow effect for Android
    shadowColor: "#000", // Shadow properties for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIconText: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 15,
    color: "#333",
  },
  footer: {
    padding: 15,
    // backgroundColor: "#ffcc00",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    color: "black",
    fontSize: 10,
  },
});

export default ProfilePage;
