import { View, StyleSheet } from "react-native";
import { TextInput, SegmentedButtons, Button, Text } from "react-native-paper";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { DATABASE_ID, databases, HABITS_TABLE } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const FREQUENCIES = ["daily", "weekly", "monthly"] as const;

//yup validation schema
const schema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .max(1000, "only 1000 char allowed"),
  description: yup
    .string()
    .required("Description is required")
    .max(1000, "only 1000 char allowed"),
  frequency: yup
    .string()
    .required("Frequency required ")
    .oneOf(FREQUENCIES, "Invalid Frequencies"),
});

export default function SignInScreen() {
  type frequency = (typeof FREQUENCIES)[number];

  type habitForm = {
    title: string;
    description: string;
    frequency: frequency;
  };

  const queryClient = useQueryClient();

  //hook form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm<habitForm>({
    defaultValues: {
      title: "",
      description: "",
      frequency: "daily",
    },
    resolver: yupResolver(schema),
    reValidateMode: "onChange",
  });

  const [titleValue, descriptionValue] = watch(["title", "description"]);

  const [apiError, setApiError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const handleAddHabit = async (data: habitForm) => {
    if (!user) return;

    const result = await databases.createDocument({
      databaseId: DATABASE_ID,
      collectionId: HABITS_TABLE,
      documentId: ID.unique(),
      data: {
        title: data.title,
        description: data.description,
        frequency: data.frequency,
        streak_count: 0,
        user_id: user.$id,
        last_completed: new Date().toISOString(),
      },
    });

    return result;
  };
  const { mutateAsync } = useMutation({
    mutationFn: handleAddHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });

      router.back();
    },
    onError: (error) => {
      if (error instanceof Error) {
        setApiError(error.message);
        return;
      }

      setApiError("There was an error while creating the habit");
    },
  });
  const onSubmit = (data: habitForm) => {
    mutateAsync(data);
  };
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            label="Title"
            mode="outlined"
            style={styles.input}
            onChangeText={onChange}
          />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            label="Description"
            mode="outlined"
            style={styles.input}
            onChangeText={onChange}
          />
        )}
      />
      {errors.description && (
        <Text style={styles.error}>{errors.description.message}</Text>
      )}
      <View style={styles.frequencyContainer}>
        <Controller
          control={control}
          name="frequency"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={FREQUENCIES.map((freq) => ({
                value: freq,
                label: freq.charAt(0).toUpperCase() + freq.slice(1),
              }))}
            />
          )}
        />
      </View>
      <Button
        mode="contained"
        disabled={!titleValue || !descriptionValue}
        onPress={handleSubmit(onSubmit)}
      >
        Add Habit
      </Button>
      {apiError && <Text style={styles.error}>{apiError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 26,
  },
  // segmentedButtons: {
  //   marginBottom: 16,
  // },
  // button: {
  //   marginTop: 8,
  // },

  error: {
    color: "red",
    marginBottom: 8,
    fontSize: 12,
  },
});
