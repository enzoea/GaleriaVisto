import { Stack } from "expo-router";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";
import { ThemeProvider } from "../src/presentation/providers/ThemeProvider";

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
