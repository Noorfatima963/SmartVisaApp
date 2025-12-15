// components/PrimaryButton.js
import React from "react";
import { Text, TouchableOpacity, StyleSheet, View } from "react-native";

export default function PrimaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8} // Click karne par smooth effect
      onPress={onPress}
      style={[styles.button, style]} // Custom style override allow kiya hai
    >
      <Text style={styles.text}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1A237E", // Premium Navy Blue
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30, // Fully rounded modern look
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // Shadow for elevation (Android + iOS)
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  text: {
    color: "#FFFFFF", // White text for contrast
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5, // Thoda spacing text ko clean dikhata hai
  },
});