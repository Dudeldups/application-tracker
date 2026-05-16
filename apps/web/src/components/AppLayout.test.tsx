import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

vi.mock("../config", () => ({
  config: {
    apiUrl: "",
    demoMode: true,
  },
}));

import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("shows the demo warning beneath the application title", () => {
    render(
      <MantineProvider forceColorScheme="dark">
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AppLayout />
        </MemoryRouter>
      </MantineProvider>,
    );

    expect(screen.getByText("Application Tracker")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Demo mode: data resets periodically. Please don't input real data here.",
      ),
    ).toBeInTheDocument();
  });
});
