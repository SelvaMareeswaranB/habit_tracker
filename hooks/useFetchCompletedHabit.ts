import { COMPLETTION_TABLE, DATABASE_ID, databases } from "@/lib/appwrite";
import { useQuery } from "@tanstack/react-query";
import { Query } from "react-native-appwrite";

const fetchTodayHabits = async (userId: string) => {
  if (!userId) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = await databases.listDocuments(DATABASE_ID, COMPLETTION_TABLE, [
    Query.equal("user_id", userId),
    Query.greaterThanEqual("completed_at", today.toISOString()),
  ]);

  return result.documents.map((h) => h.habit_id);
};

export const useCompletedHabit = (
  userId: string | undefined,
 
) => {
  return useQuery({
    queryKey: ["completedHabits", userId],
    queryFn: () => fetchTodayHabits(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
