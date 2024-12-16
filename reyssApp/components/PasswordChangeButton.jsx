import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import PasswordChangeModal from "./Profile/PasswordChangeModal";

const PasswordChangeButton = () => {
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

  // Password Change Modal handler
  const handlePasswordChange = () => {
    setPasswordModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Change Password Button */}
      <TouchableOpacity
        style={styles.passwordChangeButton}
        onPress={handlePasswordChange}
      >
        <Text style={styles.passwordChangeButtonText}>Change Password</Text>
      </TouchableOpacity>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isVisible={isPasswordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  passwordChangeButton: {
    backgroundColor: "#ffcc00",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  passwordChangeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default PasswordChangeButton;
