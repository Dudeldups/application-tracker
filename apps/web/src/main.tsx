import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createTheme, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { RouterProvider } from "react-router";

import { router } from "./router";
import "./index.css";

const theme = createTheme({
  primaryColor: "cyan",
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
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="dark">
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>
  </StrictMode>,
);
