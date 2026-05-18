import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifications } from "@mantine/notifications";
import { NewApplicationPage } from "./NewApplicationPage";
import { createApplication } from "../api/applications";
import { renderWithProviders } from "../test/test-utils";
import type { ApplicationFormValues } from "../lib/schemas/applicationFormSchema";

const navigateMock = vi.fn();

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

const submittedValues: ApplicationFormValues = {
  companyName: "  Acme Corp  ",
  jobTitle: "  Frontend Engineer  ",
  city: " Berlin ",
  address: "",
  remoteType: "remote",
  source: " LinkedIn ",
  jobUrl: "https://example.com/job",
  status: "applied",
  foundAt: "2026-05-01",
  appliedAt: "2026-05-03",
  lastContactAt: "",
  followUpAt: "2026-05-20",
  jobAdText: "",
  cvVersion: " v1 ",
  coverLetterVersion: "",
  usedCoverLetter: true,
  customizationNotes: " Tailor intro ",
  notes: "",
  interestRating: 4,
  skillFitRating: 5,
  priorityRating: 3,
};

vi.mock("../components/ApplicationForm", () => ({
  ApplicationForm: ({
    initialValues,
    onSubmit,
    submitLabel,
    isSubmitting,
  }: {
    initialValues?: { foundAt?: string };
    submitLabel: string;
    onSubmit: (values: ApplicationFormValues) => Promise<void>;
    isSubmitting?: boolean;
  }) => (
    <div>
      <div>{`submit-label: ${submitLabel}`}</div>
      <div>{`submitting: ${String(Boolean(isSubmitting))}`}</div>
      <div>{`found-at: ${initialValues?.foundAt ?? ""}`}</div>
      <button
        onClick={() => void onSubmit(submittedValues)}
        type="button">
        Trigger submit
      </button>
    </div>
  ),
}));

describe("NewApplicationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an application with the normalized payload and navigates to the detail page", async () => {
    vi.mocked(createApplication).mockResolvedValue({
      id: "app-42",
    } as Awaited<ReturnType<typeof createApplication>>);

    renderWithProviders(<NewApplicationPage />);

    expect(screen.getByText("submit-label: Save application")).toBeInTheDocument();
    expect(screen.getByText(/^found-at: \d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Trigger submit" }));

    await waitFor(() => {
      expect(createApplication).toHaveBeenCalledWith({
        companyName: "Acme Corp",
        jobTitle: "Frontend Engineer",
        city: "Berlin",
        address: undefined,
        remoteType: "remote",
        source: "LinkedIn",
        jobUrl: "https://example.com/job",
        status: "applied",
        foundAt: "2026-05-01",
        appliedAt: "2026-05-03",
        lastContactAt: undefined,
        followUpAt: "2026-05-20",
        jobAdText: undefined,
        cvVersion: "v1",
        coverLetterVersion: undefined,
        usedCoverLetter: true,
        customizationNotes: "Tailor intro",
        notes: undefined,
        interestRating: 4,
        skillFitRating: 5,
        priorityRating: 3,
      });
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Application created.",
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/applications/app-42");
  });

  it("shows an error notification when creating the application fails", async () => {
    vi.mocked(createApplication).mockRejectedValue(new Error("Create failed"));

    renderWithProviders(<NewApplicationPage />);

    await userEvent.click(screen.getByRole("button", { name: "Trigger submit" }));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "red",
          message: "Create failed",
        }),
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
