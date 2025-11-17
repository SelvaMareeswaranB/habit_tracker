import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";

//route auth guard
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isFetchingSession } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const onAuthScreen = segments[0] === "auth";

  useEffect(() => {
    if (!user && !onAuthScreen && !isFetchingSession) {
      router.replace("/auth");
    } else if (user && onAuthScreen && !isFetchingSession) {
      router.replace("/");
    }
  }, [user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="auth" options={{ title: "Auth" }} />

          <Stack.Screen name="(tabs)" />
        </Stack>
        <Toast />
      </RouteGuard>{" "}
    </AuthProvider>
  );
}
