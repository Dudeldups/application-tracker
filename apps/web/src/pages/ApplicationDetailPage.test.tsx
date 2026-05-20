import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../test/test-utils";
import { buildApplicationWithRelations, buildContact } from "../test/factories";
import { notifications } from "@mantine/notifications";
import { ApplicationDetailPage } from "./ApplicationDetailPage";
import {
  createApplicationCommunication,
  createApplicationContact,
  getApplication,
  updateApplicationStatus,
  deleteApplicationCommunication,
} from "../api/applications";
import type { ApplicationWithRelations } from "../types/application";

const navigateMock = vi.fn();
const useLoaderDataMock = vi.fn();
const useParamsMock = vi.fn(() => ({ id: "app-1" }));

vi.mock("react-router", async () => {
  const actual =
    await vi.importActual<typeof import("react-router")>("react-router");

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
  createApplicationCommunication: vi.fn(),
  createApplicationContact: vi.fn(),
  deleteApplication: vi.fn(),
  deleteApplicationCommunication: vi.fn(),
  deleteApplicationContact: vi.fn(),
  deleteApplicationStatusHistoryEntry: vi.fn(),
  getApplication: vi.fn(),
  updateApplicationStatus: vi.fn(),
}));

vi.mock("../components/application-detail/ApplicationDetailHeader", () => ({
  ApplicationDetailHeader: ({
    application,
    onDelete,
  }: {
    application: ApplicationWithRelations;
    isDeleting: boolean;
    onDelete: () => void;
  }) => (
    <div>
      <div>{`header-status: ${application.status}`}</div>
      <div>{`header-company: ${application.companyName}`}</div>
      <button onClick={onDelete} type="button">
        Open delete modal
      </button>
    </div>
  ),
}));

vi.mock("../components/application-detail/ApplicationDetailModals", () => ({
  ApplicationDetailModals: ({
    communicationToDelete,
    onConfirmDeleteCommunication,
  }: {
    companyName: string;
    jobTitle: string;
    isDeleteModalOpen: boolean;
    isStatusDeleteModalOpen: boolean;
    isContactDeleteModalOpen: boolean;
    isCommunicationDeleteModalOpen: boolean;
    isDeletingApplication: boolean;
    isDeletingStatusEntry: boolean;
    isDeletingContact: boolean;
    isDeletingCommunication: boolean;
    statusEntryToDelete: { id: string; status: string } | null;
    contactToDelete: { id: string; label: string } | null;
    communicationToDelete: { id: string; label: string } | null;
    onCloseDeleteModal: () => void;
    onCloseStatusDeleteModal: () => void;
    onCloseContactDeleteModal: () => void;
    onCloseCommunicationDeleteModal: () => void;
    onConfirmDelete: () => void;
    onConfirmDeleteStatusEntry: () => void;
    onConfirmDeleteContact: () => void;
    onConfirmDeleteCommunication: () => void;
  }) => (
    <div>
      {communicationToDelete ? (
        <button onClick={onConfirmDeleteCommunication} type="button">
          Confirm communication delete
        </button>
      ) : null}
    </div>
  ),
}));

vi.mock("../components/application-detail/ApplicationSummarySection", () => ({
  ApplicationSummarySection: ({
    application,
  }: {
    application: ApplicationWithRelations;
  }) => <div>{`summary-status: ${application.status}`}</div>,
}));

vi.mock("../components/application-detail/ApplicationTimelineSection", () => ({
  ApplicationTimelineSection: () => <div>timeline</div>,
}));

vi.mock("../components/application-detail/StatusChangesSection", () => ({
  StatusChangesSection: ({
    application,
    onSubmit,
  }: {
    application: ApplicationWithRelations;
    isSubmitting: boolean;
    initialStatusEntryId?: string;
    form: unknown;
    onSubmit: (values: { status: string; note?: string }) => Promise<void>;
    onDeleteEntry: (entryId: string, status: string) => void;
  }) => (
    <div>
      <div>{`status-section: ${application.status}`}</div>
      <button
        onClick={() =>
          void onSubmit({ status: "interview", note: "Scheduled" })
        }
        type="button">
        Submit status
      </button>
    </div>
  ),
}));

vi.mock("../components/application-detail/ContactsSection", () => ({
  ContactsSection: ({
    application,
    onSubmit,
  }: {
    application: ApplicationWithRelations;
    isSubmitting: boolean;
    form: unknown;
    onSubmit: (values: {
      name: string;
      role: string;
      email: string;
      phone: string;
    }) => Promise<void>;
    onDeleteContact: (contactId: string, label: string) => void;
  }) => (
    <div>
      <div>{`contacts-count: ${application.contacts.length}`}</div>
      <button
        onClick={() =>
          void onSubmit({
            name: "Jane Recruiter",
            role: "HR",
            email: "",
            phone: "",
          })
        }
        type="button">
        Submit contact
      </button>
    </div>
  ),
}));

vi.mock("../components/application-detail/CommunicationSection", () => ({
  CommunicationSection: ({
    application,
    onSubmit,
    onDeleteCommunication,
  }: {
    application: ApplicationWithRelations;
    isSubmitting: boolean;
    form: unknown;
    onSubmit: (values: {
      type: string;
      direction: string;
      summary: string;
      body?: string;
      date?: string;
    }) => Promise<void>;
    onDeleteCommunication: (communicationId: string, label: string) => void;
  }) => (
    <div>
      <div>{`communications-count: ${application.communications.length}`}</div>
      <button
        onClick={() =>
          void onSubmit({
            type: "phone",
            direction: "outgoing",
            summary: "Phone screen",
            body: "Discussed role details",
            date: "2026-05-20T09:22",
          })
        }
        type="button">
        Submit communication
      </button>
      <button
        onClick={() => onDeleteCommunication("comm-1", "Phone screen")}
        type="button">
        Request communication delete
      </button>
    </div>
  ),
}));

describe("ApplicationDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoaderDataMock.mockReturnValue({
      application: buildApplicationWithRelations(),
      error: null,
    });
  });

  it("renders the loader error state", () => {
    useLoaderDataMock.mockReturnValue({
      application: null,
      error: "Application not found.",
    });

    renderWithProviders(<ApplicationDetailPage />);

    expect(screen.getByText("Application not found.")).toBeInTheDocument();
  });

  it("updates the local page state from the status mutation response", async () => {
    const updatedApplication = buildApplicationWithRelations({
      status: "interview",
    });

    vi.mocked(updateApplicationStatus).mockResolvedValue(updatedApplication);

    renderWithProviders(<ApplicationDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: "Submit status" }),
    );

    await waitFor(() => {
      expect(updateApplicationStatus).toHaveBeenCalledWith("app-1", {
        status: "interview",
        note: "Scheduled",
      });
    });

    expect(screen.getByText("header-status: interview")).toBeInTheDocument();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Status updated.",
      }),
    );
    expect(getApplication).not.toHaveBeenCalled();
  });

  it("refreshes the application after creating a contact", async () => {
    vi.mocked(createApplicationContact).mockResolvedValue({
      ...buildContact(),
    });
    vi.mocked(getApplication).mockResolvedValue(
      buildApplicationWithRelations({
        contacts: [buildContact()],
      }),
    );

    renderWithProviders(<ApplicationDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: "Submit contact" }),
    );

    await waitFor(() => {
      expect(createApplicationContact).toHaveBeenCalledWith("app-1", {
        name: "Jane Recruiter",
        role: "HR",
        email: "",
        phone: "",
      });
      expect(getApplication).toHaveBeenCalledWith("app-1");
    });

    expect(screen.getByText("contacts-count: 1")).toBeInTheDocument();
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Contact added.",
      }),
    );
  });

  it("submits communication dates as ISO timestamps", async () => {
    vi.mocked(createApplicationCommunication).mockResolvedValue({
      id: "comm-2",
    } as Awaited<ReturnType<typeof createApplicationCommunication>>);
    vi.mocked(getApplication).mockResolvedValue(
      buildApplicationWithRelations(),
    );

    renderWithProviders(<ApplicationDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: "Submit communication" }),
    );

    await waitFor(() => {
      expect(createApplicationCommunication).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          type: "phone",
          direction: "outgoing",
          summary: "Phone screen",
          body: "Discussed role details",
          date: expect.stringMatching(/^2026-05-20T\d{2}:22:00\.000Z$/),
        }),
      );
      expect(getApplication).toHaveBeenCalledWith("app-1");
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "green",
        message: "Communication added.",
      }),
    );
  });

  it("shows an error notification when the refresh after deleting communication fails", async () => {
    vi.mocked(deleteApplicationCommunication).mockResolvedValue(undefined);
    vi.mocked(getApplication).mockRejectedValue(new Error("Refresh failed"));

    renderWithProviders(<ApplicationDetailPage />);

    await userEvent.click(
      screen.getByRole("button", { name: "Request communication delete" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Confirm communication delete" }),
    );

    await waitFor(() => {
      expect(deleteApplicationCommunication).toHaveBeenCalledWith(
        "app-1",
        "comm-1",
      );
      expect(getApplication).toHaveBeenCalledWith("app-1");
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        color: "red",
        message: "Refresh failed",
      }),
    );
    expect(screen.getByText("communications-count: 0")).toBeInTheDocument();
  });
});
