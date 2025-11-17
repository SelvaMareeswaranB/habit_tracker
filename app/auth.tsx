import { useState } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";

//yup validation schema
const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]+/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]+/, "Password must contain at least one uppercase letter")
    .matches(/\d+/, "Password must contain at least one number")
    .matches(
      /[@$!%*#?&]+/,
      "Password must contain at least one special character"
    ),
});

type LoginForm = {
  email: string;
  password: string;
};

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

const {
  control,
  handleSubmit,
  formState: { errors, submitCount },
} = useForm<LoginForm>({
  resolver: yupResolver(schema),
  mode: "onSubmit",
  reValidateMode: "onChange",
});
   
  const onSubmit = async (data: LoginForm) => {
    console.log("Form Data:", data);
  };
  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };
    console.log("Form Data:",errors);
  const handleAuth = async () => {};
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
              label={"Email"}
              mode="outlined"
              style={styles.input}
              onChangeText={onChange}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              label={"password"}
              mode="outlined"
              style={styles.input}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        {errors.password && (
          <Text style={styles.error}>{errors.password.message}</Text>
        )}
        <Button
          mode="contained"
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>

        <Button
          mode="text"
          onPress={handleSwitchMode}
          style={styles.switchButton}
        >
          {isSignUp
            ? "Already have an account"
            : "Dont have an account ? Sign Up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    margin: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 16,
  },
  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 12,
  },
});
