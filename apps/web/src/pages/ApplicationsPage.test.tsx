import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../test/test-utils";
import { buildApplication } from "../test/factories";
import { ApplicationsPage } from "./ApplicationsPage";
import { getApplicationsList } from "../api/applications";

vi.mock("../api/applications", () => ({
  getApplicationsList: vi.fn(),
}));

vi.mock("../lib/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

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
        status: "interesting",
        followUpAt: "2026-05-20",
      }),
      buildApplication({
        id: "app-2",
        companyName: "Acme Corp",
        priorityRating: 5,
        status: "offer",
        followUpAt: "2026-05-22",
      }),
      buildApplication({
        id: "app-3",
        companyName: "Beta GmbH",
        priorityRating: 3,
        status: "applied",
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

    expect(getCompanyOrder()).toEqual(["Acme Corp", "Beta GmbH", "Zulu Tech"]);

    await userEvent.click(screen.getByRole("button", { name: /company/i }));

    expect(getCompanyOrder()).toEqual(["Acme Corp", "Beta GmbH", "Zulu Tech"]);

    await userEvent.click(screen.getByRole("button", { name: /priority/i }));

    expect(getCompanyOrder()).toEqual(["Acme Corp", "Beta GmbH", "Zulu Tech"]);
  });

  it("sorts by status progression when the status header is clicked", async () => {
    vi.mocked(getApplicationsList).mockResolvedValue([
      buildApplication({
        id: "app-1",
        companyName: "Interesting Co",
        status: "interesting",
      }),
      buildApplication({
        id: "app-2",
        companyName: "Offer Inc",
        status: "offer",
      }),
      buildApplication({
        id: "app-3",
        companyName: "Interview GmbH",
        status: "interview",
      }),
    ]);

    renderWithProviders(<ApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Offer Inc")).toBeInTheDocument();
    });

    const getCompanyOrder = () =>
      within(screen.getAllByRole("table")[0])
        .getAllByRole("link")
        .map(link => link.textContent);

    expect(getCompanyOrder()).toEqual([
      "Offer Inc",
      "Interview GmbH",
      "Interesting Co",
    ]);

    await userEvent.click(screen.getByRole("button", { name: /status/i }));

    expect(getCompanyOrder()).toEqual([
      "Interesting Co",
      "Interview GmbH",
      "Offer Inc",
    ]);
  });
});
