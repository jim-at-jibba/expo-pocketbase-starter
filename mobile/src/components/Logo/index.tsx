import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 24 }: LogoProps) {
  return (
    <View style={styles.logoContainer}>
      <Text style={[styles.logoText, { fontSize: size }]}>PocketBase</Text>
      <Text style={[styles.logoTextBlue, { fontSize: size }]}>Starter</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: theme.colors.typography,
  },
  logoTextBlue: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
}));
