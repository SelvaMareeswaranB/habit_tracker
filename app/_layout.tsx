import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const theme = {
  ...MD3LightTheme,
  components: {
    TextInput: {
      style: { backgroundColor: "white" },
      theme: {
        colors: {
          primary: "black",          // focused label
          onSurfaceVariant: "black", // unfocused label
          surfaceVariant: "white",   // background
        },
      },
    },
  },
};

//Route Guard
function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isFetchingSession } = useAuth();

  const router = useRouter();
  const segments = useSegments();

  const onAuthScreen = segments[0] === "auth";

  useEffect(() => {
    if (isFetchingSession) return; // prevent early redirects

    if (!user && !onAuthScreen) {
      router.replace("/auth");
    } else if (user && onAuthScreen) {
      router.replace("/");
    }
  }, [user, isFetchingSession, onAuthScreen, router]);

  return <>{children}</>;
}

// ------------ ROOT LAYOUT ------------
export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>{" "}
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
