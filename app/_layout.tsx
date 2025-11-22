import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { PaperProvider, MD3LightTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const theme = {
  ...MD3LightTheme,
  components: {
    TextInput: {
      style: { backgroundColor: "white" },
      theme: {
        colors: {
          primary: "black",
          onSurfaceVariant: "black",
          surfaceVariant: "white",
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
  const queryClient = new QueryClient();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {" "}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <PaperProvider theme={theme}>
              <RouteGuard>
                <Stack>
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </RouteGuard>{" "}
            </PaperProvider>
          </SafeAreaProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
