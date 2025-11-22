import { useQuery } from "@tanstack/react-query";
import { databases, DATABASE_ID, HABITS_TABLE } from "@/lib/appwrite";

import { Query } from "react-native-appwrite";

const fetchHabits = async (userId: string) => {
  if (!userId) return [];

  const result = await databases.listDocuments(DATABASE_ID, HABITS_TABLE, [
    Query.equal("user_id", userId),
  ]);

  return result.documents;
};

export const useHabits = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["habits", userId],
    queryFn: () => fetchHabits(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
