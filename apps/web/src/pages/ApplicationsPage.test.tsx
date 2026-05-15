import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../test/test-utils";
import { ApplicationsPage } from "./ApplicationsPage";
import { getApplicationsList } from "../api/applications";
import type { Application } from "../types/application";

vi.mock("../api/applications", () => ({
  getApplicationsList: vi.fn(),
}));

vi.mock("../lib/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

function buildApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "app-1",
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
    companyName: "Acme Corp",
    jobTitle: "Frontend Engineer",
    city: "Berlin",
    address: "Main Street 1",
    remoteType: "remote",
    source: "LinkedIn",
    jobUrl: "https://example.com/job",
    status: "applied",
    foundAt: "2026-05-01",
    appliedAt: "2026-05-03",
    lastContactAt: "2026-05-05",
    followUpAt: "2026-05-20",
    jobAdText: "Job ad",
    cvVersion: "v1",
    coverLetterVersion: "v1",
    usedCoverLetter: true,
    customizationNotes: "Tailor intro",
    notes: "General notes",
    interestRating: 4,
    skillFitRating: 4,
    priorityRating: 5,
    ...overrides,
  };
}

describe("ApplicationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when loading applications fails", async () => {
    vi.mocked(getApplicationsList).mockRejectedValue(new Error("API offline"));

    renderWithProviders(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("API offline")).toBeInTheDocument();
    });
  });

  it("renders the empty state when no applications exist", async () => {
    vi.mocked(getApplicationsList).mockResolvedValue([]);

    renderWithProviders(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("No applications saved yet.")).toBeInTheDocument();
    });
  });

  it("applies the default open filter, search, and updates the stats", async () => {
    vi.mocked(getApplicationsList).mockResolvedValue([
      buildApplication({
        id: "app-1",
        companyName: "Acme Corp",
        status: "applied",
        followUpAt: "2026-05-10",
      }),
      buildApplication({
        id: "app-2",
        companyName: "Beta GmbH",
        status: "rejected",
        city: "Munich",
        followUpAt: "2026-05-05",
      }),
      buildApplication({
        id: "app-3",
        companyName: "Gamma Labs",
        status: "interview",
        city: "Hamburg",
        followUpAt: "2026-05-01",
      }),
    ]);

    renderWithProviders(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    expect(screen.queryByText("Beta GmbH")).not.toBeInTheDocument();
    expect(
      screen.getByText("Open applications", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("2");
    expect(
      screen.getByText("All applications", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("3");

    const searchInput = screen.getByLabelText("Search");
    await userEvent.type(searchInput, "gamma");

    await waitFor(() => {
      expect(screen.getByText("Gamma Labs")).toBeInTheDocument();
      expect(screen.queryByText("Acme Corp")).not.toBeInTheDocument();
      expect(screen.queryByText("Beta GmbH")).not.toBeInTheDocument();
    });

    expect(
      screen.getByText("Currently displayed", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("1");
    expect(
      screen.getByText("Overdue follow-ups", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("1");
  });

  it("sorts the table when a sortable header is clicked", async () => {
    vi.mocked(getApplicationsList).mockResolvedValue([
      buildApplication({
        id: "app-1",
        companyName: "Zulu Tech",
        priorityRating: 1,
        followUpAt: "2026-05-20",
      }),
      buildApplication({
        id: "app-2",
        companyName: "Acme Corp",
        priorityRating: 5,
        followUpAt: "2026-05-22",
      }),
      buildApplication({
        id: "app-3",
        companyName: "Beta GmbH",
        priorityRating: 3,
        followUpAt: "2026-05-21",
      }),
    ]);

    renderWithProviders(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Zulu Tech")).toBeInTheDocument();
    });

    const getCompanyOrder = () =>
      within(screen.getAllByRole("table")[0])
        .getAllByRole("link")
        .map(link => link.textContent);

    expect(getCompanyOrder()).toEqual(["Zulu Tech", "Beta GmbH", "Acme Corp"]);

    await userEvent.click(screen.getByRole("button", { name: /company/i }));

    expect(getCompanyOrder()).toEqual(["Acme Corp", "Beta GmbH", "Zulu Tech"]);

    await userEvent.click(screen.getByRole("button", { name: /priority/i }));

    expect(getCompanyOrder()).toEqual(["Acme Corp", "Beta GmbH", "Zulu Tech"]);
  });
});
