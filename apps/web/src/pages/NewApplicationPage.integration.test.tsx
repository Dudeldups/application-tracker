import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifications } from "@mantine/notifications";
import { NewApplicationPage } from "./NewApplicationPage";
import { createApplication } from "../api/applications";
import { renderWithProviders } from "../test/test-utils";

const navigateMock = vi.fn();

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../lib/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("@mantine/notifications", async () => {
  const actual = await vi.importActual<typeof import("@mantine/notifications")>(
    "@mantine/notifications",
  );

  return {
    ...actual,
    notifications: {
      ...actual.notifications,
      show: vi.fn(),
    },
  };
});

vi.mock("../api/applications", () => ({
  createApplication: vi.fn(),
}));

describe("NewApplicationPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits today's Found at date when opening the new application form", async () => {
    vi.mocked(createApplication).mockResolvedValue({
      id: "app-99",
    } as Awaited<ReturnType<typeof createApplication>>);

    renderWithProviders(<NewApplicationPage />);

    expect(screen.getByLabelText("Found at")).toHaveValue(getTodayDateValue());

    await userEvent.type(screen.getByLabelText("Company"), "Acme Corp");
    await userEvent.type(
      screen.getByLabelText("Job title"),
      "Frontend Engineer",
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Save application" }),
    );

    await waitFor(() => {
      expect(createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Acme Corp",
          jobTitle: "Frontend Engineer",
          foundAt: getTodayDateValue(),
        }),
      );
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Application created.",
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/applications/app-99");
  });
});
