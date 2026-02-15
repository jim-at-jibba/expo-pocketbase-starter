import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import { Header } from "../../components/Navigation/Header";

export default function AuthHome() {
  return (
    <View style={styles.outerContainer}>
      <Header title="Welcome" showBack={false} />
      <View style={styles.container}>
        <DefaultText text="Connect to your PocketBase server to get started." />

        <Button label="Sign Up" onPress={() => router.push("/(auth)/signup")} />
        <Button label="Log In" onPress={() => router.push("/(auth)/login")} variant="secondary" />
        <Button
          label="Set Server URL"
          onPress={() => router.push("/(auth)/server-url")}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
}));
