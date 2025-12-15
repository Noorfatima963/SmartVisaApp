// components/ProgressDots.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressDots({ step, total }) {
  // Logic: step usually 1 se start hota hai, lekin array index 0 se.
  // Hum maan ke chal rahe hain 'step' 1-based index hai (e.g. Step 1 of 5)
  
  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: total }).map((_, index) => {
          const isActive = index + 1 === step; // Check agar yeh current step hai
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: 'center', // Center vertically
  },
  dot: {
    height: 8, // Thoda sleek height
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24, // Active wala lamba hoga (Modern style)
    backgroundColor: "#1A237E", // Premium Navy Blue
  },
  inactiveDot: {
    width: 8, // Inactive wala circle rahega
    backgroundColor: "#C5CAE9", // Light Navy shade (Grayish Blue)
  },
});