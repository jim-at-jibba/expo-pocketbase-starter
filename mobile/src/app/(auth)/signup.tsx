import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { z } from "zod";
import { getPocketBase } from "@/api/pocketbase";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { FormError } from "@/components/Form/FormError";
import { FormInputText } from "@/components/Form/FormInputText";
import { Header } from "@/components/Navigation/Header";

const schema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type Schema = z.infer<typeof schema>;

export default function Signup() {
  const [loading, setLoading] = useState(false);

  const methods = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: Schema) => {
    setLoading(true);

    try {
      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      await pb.collection("users").create({
        email: data.email.trim(),
        password: data.password,
        passwordConfirm: data.password,
        name: data.name.trim(),
      });

      await pb.collection("users").authWithPassword(data.email.trim(), data.password);
      router.replace("/(tabs)");
    } catch {
      methods.setError("root", {
        message: "Could not create account. Check your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Header title="Sign Up" showBack />
      <View style={styles.container}>
        <DefaultText text="Create a new account to get started." />

        <FormProvider {...methods}>
          <FormInputText<Schema> name="name" placeholder="Your name" returnKeyType="next" />

          <FormInputText<Schema>
            name="email"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <FormInputText<Schema>
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="newPassword"
            onSubmitEditing={methods.handleSubmit(onSubmit)}
          />

          <FormError message={methods.formState.errors.root?.message} />

          <Button
            label={loading ? "Creating..." : "Sign Up"}
            onPress={methods.handleSubmit(onSubmit)}
            disabled={loading}
          />
        </FormProvider>
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
  },
}));
