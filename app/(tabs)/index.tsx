import { useHabits } from "@/hooks/useFetchHabits";
import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, StyleSheet, ScrollView } from "react-native";
import { Button, Surface, Text } from "react-native-paper";

export default function LogInScreen() {
  const { signOut, user } = useAuth();

  const userId = user?.$id;
  const { data: habits, isLoading, error } = useHabits(userId);

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
      <ScrollView>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Habits yet. Add your first Habit!
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => (
            <Surface elevation={0} style={styles.card} key={`${key}-card`}>
              <View key={key} style={styles.cardContent}>
                <Text style={styles.cardTitle}>{habit?.title}</Text>
                <Text style={styles.cardDescription}>{habit?.description}</Text>
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
});
