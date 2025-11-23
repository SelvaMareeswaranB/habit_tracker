import { useHabits } from "@/hooks/useFetchHabits";
import { useCompletedHabit } from "@/hooks/useFetchCompletedHabit";
import {
  COMPLETTION_TABLE,
  DATABASE_ID,
  databases,
  HABITS_TABLE,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function LogInScreen() {
  const { signOut, user } = useAuth();

  const userId = user?.$id;
  const { data: habits = [], isLoading, error } = useHabits(userId);
  const { data: completedHabits = [], isLoading: completedHabisLoading } =
    useCompletedHabit(userId, true);

  const swipRef = useRef<Record<string, Swipeable | null>>({});

  const renderLeftAction = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons
        size={32}
        color={"#ffff"}
        name="trash-can-outline"
      />
    </View>
  );

  const renderRightAction = (habitId: string) => (
    <View style={styles.swipeActionRight}>
      {isHabitCompleted(habitId) ? (
        <Text style={{ color: "#fff" }}>Completed !</Text>
      ) : (
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#ffff"}
        />
      )}
    </View>
  );
  //habit delete handler
  const handleHabitDelete = async (id: string) => {
    await databases.deleteDocument(DATABASE_ID, HABITS_TABLE, id);
  };

  //habit delete mutation query
  const queryClient = useQueryClient();
  const { mutateAsync: deleteAsync } = useMutation<
    void,
    unknown,
    string,
    { previousHabits?: Habit[] }
  >({
    mutationFn: handleHabitDelete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["habits"] });

      const previousHabits = queryClient.getQueryData<Habit[]>(["habits"]);

      queryClient.setQueryData<Habit[]>(["habits"], (old) =>
        old?.filter((h) => h.$id !== id)
      );
      return { previousHabits };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (_, __, context) => {
      if (!context?.previousHabits) return;

      queryClient.setQueryData(["habits"], context.previousHabits);
    },
  });

  //handler to check completed habits
  const isHabitCompleted = (habitId: string) =>
    completedHabits.includes(habitId);

  //habit completion handler
  const handleHabitCompletion = async (id: string) => {
    if (!user || isHabitCompleted(id)) return;
    const currentDate = new Date().toISOString();
    await databases.createDocument(
      DATABASE_ID,
      COMPLETTION_TABLE,
      ID.unique(),
      {
        habit_id: id,
        user_id: user.$id,
        completed_at: currentDate,
      }
    );

    const habit = habits?.find((h) => h.$id === id);
    if (!habit) return;

    //habit table updation logic
    await databases.updateDocument(DATABASE_ID, HABITS_TABLE, id, {
      streak_count: habit.streak_count + 1,
      last_completed: currentDate,
    });
  };

  //habit completion mutation query
  const { mutateAsync: habitCompletionAsync } = useMutation({
    mutationFn: handleHabitCompletion,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["habits"] }),
        queryClient.invalidateQueries({ queryKey: ["completedHabits"] }),
      ]);
    },
    onError: () => {},
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="headlineSmall"
          style={styles.title}
        >{`Today's Habit`}</Text>
        <Button onPress={signOut} icon={"logout"} mode="text">
          Sign Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Habits yet. Add your first Habit!
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Swipeable
              ref={(ref) => {
                if (ref) swipRef.current[habit.$id!] = ref;
              }}
              key={`swipe-${key}`}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftAction}
              renderRightActions={() => renderRightAction(habit.$id)}
              onSwipeableOpen={(direction) => {
                if (direction === "left") deleteAsync(habit.$id);
                else if (direction === "right") habitCompletionAsync(habit.$id);

                swipRef.current[habit.$id]?.close();
              }}
            >
              <Surface
                elevation={0}
                style={[
                  styles.card,
                  isHabitCompleted(habit.$id) && styles.cardCompleted,
                ]}
                key={`${key}-card`}
              >
                <View key={key} style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{habit?.title}</Text>
                  <Text style={styles.cardDescription}>
                    {habit?.description}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.streakBadge}>
                      <MaterialCommunityIcons
                        name="fire"
                        size={18}
                        color={"#ff9800"}
                      />
                      <Text style={styles.streakText}>
                        {habit?.streak_count} day streak
                      </Text>
                    </View>
                    <View style={styles.frequencyBadge}>
                      <Text style={styles.frequencyText}>
                        {habit?.frequency?.charAt(0)?.toUpperCase() +
                          habit?.frequency?.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            </Swipeable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 15,
    color: "#6c6c80",
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    color: "#666",
  },
  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingLeft: 16,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginTop: 2,
    marginBottom: 18,
    paddingRight: 16,
  },
  cardCompleted: {
    opacity: 0.6,
  },
});
