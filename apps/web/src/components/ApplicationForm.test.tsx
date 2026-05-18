import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApplicationForm } from "./ApplicationForm";
import { buildApplicationWithRelations } from "../test/factories";
import { renderWithProviders } from "../test/test-utils";

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

describe("ApplicationForm", () => {
  it("shows validation errors for required fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ApplicationForm submitLabel="Save application" onSubmit={onSubmit} />,
    );

    await userEvent.clear(screen.getByLabelText("Company"));
    await userEvent.clear(screen.getByLabelText("Job title"));
    await userEvent.click(
      screen.getByRole("button", { name: "Save application" }),
    );

    expect(await screen.findByText("Company is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Job title is required."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a validation error for invalid job urls", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ApplicationForm submitLabel="Save application" onSubmit={onSubmit} />,
    );

    await userEvent.type(screen.getByLabelText("Company"), "Acme Corp");
    await userEvent.type(
      screen.getByLabelText("Job title"),
      "Senior Frontend Engineer",
    );
    await userEvent.clear(screen.getByLabelText("Job URL"));
    await userEvent.type(screen.getByLabelText("Job URL"), "example.com/job");
    await userEvent.click(
      screen.getByRole("button", { name: "Save application" }),
    );

    expect(
      await screen.findByText(
        "Please enter a URL starting with http:// or https://.",
      ),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits edited select, checkbox and date values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <ApplicationForm
        submitLabel="Save application"
        onSubmit={onSubmit}
        initialValues={buildApplicationWithRelations({
          companyName: "Initial Corp",
          jobTitle: "Initial Role",
          remoteType: "remote",
          status: "applied",
          foundAt: "2026-05-01",
          appliedAt: "2026-05-03",
          followUpAt: "2026-05-20",
          usedCoverLetter: true,
          interestRating: 4,
          skillFitRating: 3,
          priorityRating: 5,
        })}
      />,
    );

    expect(screen.getByLabelText("Company")).toHaveValue("Initial Corp");
    expect(screen.getByLabelText("Job title")).toHaveValue("Initial Role");
    expect(screen.getByLabelText("Found at")).toHaveValue("2026-05-01");
    expect(screen.getByLabelText("Applied at")).toHaveValue("2026-05-03");
    expect(screen.getByLabelText("Follow-up at")).toHaveValue("2026-05-20");
    expect(screen.getByLabelText("Used cover letter")).toBeChecked();

    await userEvent.click(
      screen.getByRole("combobox", { name: "Remote type" }),
    );
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    await userEvent.click(screen.getByLabelText("Used cover letter"));
    await userEvent.clear(screen.getByLabelText("Found at"));
    await userEvent.type(screen.getByLabelText("Found at"), "2026-06-01");
    await userEvent.clear(screen.getByLabelText("Applied at"));
    await userEvent.type(screen.getByLabelText("Applied at"), "2026-06-03");
    await userEvent.clear(screen.getByLabelText("Follow-up at"));
    await userEvent.type(screen.getByLabelText("Follow-up at"), "2026-06-12");

    await userEvent.click(
      screen.getByRole("button", { name: "Save application" }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    const [submittedValues] = vi.mocked(onSubmit).mock.calls[0];

    expect(submittedValues).toEqual(
      expect.objectContaining({
        companyName: "Initial Corp",
        jobTitle: "Initial Role",
        remoteType: "hybrid",
        status: "interview",
        foundAt: "2026-06-01",
        appliedAt: "2026-06-03",
        followUpAt: "2026-06-12",
        usedCoverLetter: false,
        interestRating: 4,
        skillFitRating: 3,
        priorityRating: 5,
      }),
    );
  });

  it("fills Applied at with today's date when status changes to applied", async () => {
    renderWithProviders(
      <ApplicationForm
        submitLabel="Save application"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByLabelText("Applied at")).toHaveValue("");

    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(screen.getByLabelText("Applied at")).toHaveValue(
      getTodayDateValue(),
    );
  });

  it("does not overwrite Applied at when a date already exists", async () => {
    renderWithProviders(
      <ApplicationForm
        submitLabel="Save application"
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    await userEvent.type(screen.getByLabelText("Applied at"), "2026-05-10");
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(screen.getByLabelText("Applied at")).toHaveValue("2026-05-10");
  });
});
