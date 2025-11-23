import { COMPLETTION_TABLE, DATABASE_ID, databases } from "@/lib/appwrite";
import { useQuery } from "@tanstack/react-query";
import { Query } from "react-native-appwrite";

const fetchTodayHabits = async (userId: string, getIds: boolean) => {
  if (!userId) return [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const queries = [Query.equal("user_id", userId)];

  if (getIds) {
    queries.push(Query.greaterThanEqual("completed_at", today.toISOString()));
  }

  const result = await databases.listDocuments(
    DATABASE_ID,
    COMPLETTION_TABLE,
    queries
  );
  return getIds ? result.documents.map((h) => h.habit_id) : result.documents;
};

export const useCompletedHabit = (
  userId: string | undefined,
  getIds: boolean
) => {
  return useQuery({
    queryKey: ["completedHabits", userId,getIds],
    queryFn: () => fetchTodayHabits(userId!, getIds),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
