import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { MemoryRouter } from "react-router";
import type { PropsWithChildren } from "react";

const theme = createTheme({
  primaryColor: "green",
  colors: {
    dark: [
      "#c9d1d9",
      "#b7c0cb",
      "#98a3b3",
      "#7b8798",
      "#616d7f",
      "#4b5668",
      "#13161c",
      "#101319",
      "#0d1015",
      "#090b10",
    ],
    green: [
      "#e8fff1",
      "#cff8de",
      "#9ff1bd",
      "#6fe99b",
      "#49e27f",
      "#33de6f",
      "#25c45d",
      "#17984a",
      "#0d6d35",
      "#044321",
    ],
  },
});

export function TestProviders({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications />
      <MemoryRouter>{children}</MemoryRouter>
    </MantineProvider>
  );
}
