import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { notifications } from "@mantine/notifications";
import { EditApplicationPage } from "./EditApplicationPage";
import { updateApplication } from "../api/applications";
import { renderWithProviders } from "../test/test-utils";
import { buildApplicationWithRelations } from "../test/factories";
import type { ApplicationFormValues } from "../lib/schemas/applicationFormSchema";

const navigateMock = vi.fn();
const useLoaderDataMock = vi.fn();
const useParamsMock = vi.fn(() => ({ id: "app-1" }));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useLoaderData: () => useLoaderDataMock(),
    useNavigate: () => navigateMock,
    useParams: () => useParamsMock(),
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
  updateApplication: vi.fn(),
}));

const submittedValues: ApplicationFormValues = {
  companyName: "  Acme Corp  ",
  jobTitle: "  Senior Frontend Engineer ",
  city: " Berlin ",
  address: "",
  remoteType: "hybrid",
  source: " LinkedIn ",
  jobUrl: "https://example.com/updated-job",
  status: "interview",
  foundAt: "2026-05-01",
  appliedAt: "2026-05-03",
  lastContactAt: "",
  followUpAt: "2026-05-22",
  jobAdText: "",
  cvVersion: " v2 ",
  coverLetterVersion: "",
  usedCoverLetter: false,
  customizationNotes: " Tailor portfolio section ",
  notes: "",
  interestRating: 5,
  skillFitRating: 4,
  priorityRating: 4,
};

vi.mock("../components/ApplicationForm", () => ({
  ApplicationForm: ({
    initialValues,
    onSubmit,
    submitLabel,
    isSubmitting,
  }: {
    initialValues?: unknown;
    submitLabel: string;
    onSubmit: (values: ApplicationFormValues) => Promise<void>;
    isSubmitting?: boolean;
  }) => (
    <div>
      <div>{`submit-label: ${submitLabel}`}</div>
      <div>{`initial-company: ${(initialValues as { companyName?: string })?.companyName ?? ""}`}</div>
      <div>{`submitting: ${String(Boolean(isSubmitting))}`}</div>
      <button
        onClick={() => void onSubmit(submittedValues)}
        type="button">
        Trigger save
      </button>
    </div>
  ),
}));

describe("EditApplicationPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoaderDataMock.mockReturnValue({
      application: buildApplicationWithRelations({
        id: "app-1",
        companyName: "Acme Corp",
      }),
      error: null,
    });
  });

  it("renders the loader error state", () => {
    useLoaderDataMock.mockReturnValue({
      application: null,
      error: "Application not found.",
    });

    renderWithProviders(<EditApplicationPage />);

    expect(screen.getByText("Application not found.")).toBeInTheDocument();
  });

  it("passes loader data to the form and saves the normalized update payload", async () => {
    vi.mocked(updateApplication).mockResolvedValue(
      buildApplicationWithRelations({
        id: "app-1",
        status: "interview",
      }) as Awaited<ReturnType<typeof updateApplication>>,
    );

    renderWithProviders(<EditApplicationPage />);

    expect(screen.getByText("submit-label: Save changes")).toBeInTheDocument();
    expect(screen.getByText("initial-company: Acme Corp")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Trigger save" }));

    await waitFor(() => {
      expect(updateApplication).toHaveBeenCalledWith("app-1", {
        companyName: "Acme Corp",
        jobTitle: "Senior Frontend Engineer",
        city: "Berlin",
        address: undefined,
        remoteType: "hybrid",
        source: "LinkedIn",
        jobUrl: "https://example.com/updated-job",
        status: "interview",
        foundAt: "2026-05-01",
        appliedAt: "2026-05-03",
        lastContactAt: undefined,
        followUpAt: "2026-05-22",
        jobAdText: undefined,
        cvVersion: "v2",
        coverLetterVersion: undefined,
        usedCoverLetter: false,
        customizationNotes: "Tailor portfolio section",
        notes: undefined,
        interestRating: 5,
        skillFitRating: 4,
        priorityRating: 4,
      });
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Application updated.",
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith("/applications/app-1");
  });

  it("shows an error notification and does not navigate when saving fails", async () => {
    vi.mocked(updateApplication).mockRejectedValue(new Error("Update failed"));

    renderWithProviders(<EditApplicationPage />);

    await userEvent.click(screen.getByRole("button", { name: "Trigger save" }));

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({
          color: "red",
          message: "Update failed",
        }),
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
