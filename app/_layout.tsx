import { Stack } from "expo-router";

function useAuth() {
  const isAuth = false;
  return { isAuth };
}

export default function RootLayout() {
  const { isAuth } = useAuth();

  return (
    <Stack>
      {/*Auth routes allowed only when NOT logged in */}
      <Stack.Protected guard={!isAuth}>
        <Stack.Screen name="auth" options={{ title: "Auth" }} />
      </Stack.Protected>

      {/*App routes allowed only when logged in */}
      <Stack.Protected guard={isAuth}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
