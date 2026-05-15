import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../test/test-utils";
import {
  buildApplicationWithRelations,
  buildCommunication,
  buildStatusHistoryEntry,
} from "../test/factories";
import { DashboardPage } from "./DashboardPage";
import { getApplicationsWithDetails } from "../api/applications";

vi.mock("../api/applications", () => ({
  getApplicationsWithDetails: vi.fn(),
}));

vi.mock("../lib/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when loading dashboard data fails", async () => {
    vi.mocked(getApplicationsWithDetails).mockRejectedValue(
      new Error("Dashboard API offline"),
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard API offline")).toBeInTheDocument();
    });
  });

  it("renders the empty state when no applications exist", async () => {
    vi.mocked(getApplicationsWithDetails).mockResolvedValue([]);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("No applications saved yet.")).toBeInTheDocument();
    });
  });

  it("calculates response and interview metrics from incoming signals", async () => {
    vi.mocked(getApplicationsWithDetails).mockResolvedValue([
      buildApplicationWithRelations({
        id: "app-1",
        companyName: "Acme Corp",
        status: "applied",
        appliedAt: "2026-05-01",
        followUpAt: "2026-05-20",
        lastContactAt: null,
        source: "LinkedIn",
      }),
      buildApplicationWithRelations({
        id: "app-2",
        companyName: "Beta GmbH",
        status: "applied",
        appliedAt: "2026-05-02",
        followUpAt: "2026-05-01",
        lastContactAt: null,
        source: "Referral",
        communications: [
          buildCommunication({
            id: "comm-1",
            applicationId: "app-2",
          }),
        ],
      }),
      buildApplicationWithRelations({
        id: "app-3",
        companyName: "Gamma Labs",
        status: "interview",
        appliedAt: "2026-05-03",
        followUpAt: "2026-05-22",
        lastContactAt: null,
        source: "LinkedIn",
        statusHistory: [
          buildStatusHistoryEntry({
            id: "status-1",
            applicationId: "app-3",
            status: "interview",
            changedAt: "2026-05-05T09:00:00.000Z",
          }),
        ],
      }),
      buildApplicationWithRelations({
        id: "app-4",
        companyName: "Delta AG",
        status: "rejected",
        appliedAt: "2026-04-10",
        followUpAt: null,
        lastContactAt: null,
        source: "Referral",
      }),
    ]);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    });

    expect(
      screen.getByText("All applications", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("4");
    expect(
      screen.getByText("Open applications", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("3");
    expect(
      screen.getByText("Overdue follow-ups", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("1");
    expect(
      screen.getByText("Response rate", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("75%");
    expect(
      screen.getByText("Interview rate", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("25%");
    expect(
      screen.getByText("Applied this month", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("3");
    expect(
      screen.getByText("Avg. first response", { selector: "p" }).nextElementSibling,
    ).toHaveTextContent("2 days");
  });

  it("renders top sources and follow-ups in the expected order", async () => {
    vi.mocked(getApplicationsWithDetails).mockResolvedValue([
      buildApplicationWithRelations({
        id: "app-1",
        companyName: "Acme Corp",
        status: "applied",
        followUpAt: "2026-05-20",
        source: "LinkedIn",
      }),
      buildApplicationWithRelations({
        id: "app-2",
        companyName: "Beta GmbH",
        status: "interview",
        followUpAt: "2026-05-10",
        source: "Referral",
      }),
      buildApplicationWithRelations({
        id: "app-3",
        companyName: "Gamma Labs",
        status: "applied",
        followUpAt: "2026-05-15",
        source: "LinkedIn",
      }),
    ]);

    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Top sources")).toBeInTheDocument();
    });

    const tables = screen.getAllByRole("table");
    const sourcesTable = tables[0];
    const followUpsTable = tables[1];

    const sourceRows = within(sourcesTable).getAllByRole("row").slice(1);
    expect(sourceRows).toHaveLength(2);
    expect(within(sourceRows[0]).getByText("LinkedIn")).toBeInTheDocument();
    expect(within(sourceRows[0]).getByText("2")).toBeInTheDocument();
    expect(within(sourceRows[1]).getByText("Referral")).toBeInTheDocument();

    const followUpRows = within(followUpsTable).getAllByRole("row").slice(1);
    expect(within(followUpRows[0]).getByText("Beta GmbH")).toBeInTheDocument();
    expect(within(followUpRows[1]).getByText("Gamma Labs")).toBeInTheDocument();
    expect(within(followUpRows[2]).getByText("Acme Corp")).toBeInTheDocument();
  });
});
