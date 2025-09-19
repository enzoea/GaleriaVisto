import { Stack } from "expo-router";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";
import { ThemeProvider } from "../src/presentation/providers/ThemeProvider";
import { PhotoProvider } from "../src/presentation/providers/PhotoProvider";

export default function Layout() {
  return (
    <ThemeProvider>
      <PhotoProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </PhotoProvider>
    </ThemeProvider>
  );
}
