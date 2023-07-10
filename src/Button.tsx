import * as React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  children: string;
  onClick: () => void;
  width?: number;
}

export function Button({ children, onClick, width = 1 }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, { flex: width }]}
      onPress={onClick}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dddddd"
  },
  text: {
    fontSize: 22
  }
});
