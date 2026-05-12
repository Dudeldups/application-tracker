import { Stack, Text } from "@mantine/core";

import { ConfirmationModal } from "../ConfirmationModal";

type DeleteTarget = {
  id: string;
  label: string;
};

type StatusDeleteTarget = {
  id: string;
  status: string;
};

type ApplicationDetailModalsProps = {
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
  statusEntryToDelete: StatusDeleteTarget | null;
  contactToDelete: DeleteTarget | null;
  communicationToDelete: DeleteTarget | null;
  onCloseDeleteModal: () => void;
  onCloseStatusDeleteModal: () => void;
  onCloseContactDeleteModal: () => void;
  onCloseCommunicationDeleteModal: () => void;
  onConfirmDelete: () => void;
  onConfirmDeleteStatusEntry: () => void;
  onConfirmDeleteContact: () => void;
  onConfirmDeleteCommunication: () => void;
};

export function ApplicationDetailModals({
  companyName,
  jobTitle,
  isDeleteModalOpen,
  isStatusDeleteModalOpen,
  isContactDeleteModalOpen,
  isCommunicationDeleteModalOpen,
  isDeletingApplication,
  isDeletingStatusEntry,
  isDeletingContact,
  isDeletingCommunication,
  statusEntryToDelete,
  contactToDelete,
  communicationToDelete,
  onCloseDeleteModal,
  onCloseStatusDeleteModal,
  onCloseContactDeleteModal,
  onCloseCommunicationDeleteModal,
  onConfirmDelete,
  onConfirmDeleteStatusEntry,
  onConfirmDeleteContact,
  onConfirmDeleteCommunication,
}: ApplicationDetailModalsProps) {
  return (
    <>
      <ConfirmationModal
        opened={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
        title="Delete application"
        loading={isDeletingApplication}>
        <Stack>
          <Text>
            Delete the application for{" "}
            <Text component="span" fw={700}>
              {companyName}
            </Text>{" "}
            as{" "}
            <Text component="span" fw={700}>
              {jobTitle}
            </Text>
            ?
          </Text>
          <Text c="dimmed" size="sm">
            This action cannot be undone.
          </Text>
        </Stack>
      </ConfirmationModal>

      <ConfirmationModal
        opened={isStatusDeleteModalOpen}
        onClose={onCloseStatusDeleteModal}
        onConfirm={onConfirmDeleteStatusEntry}
        title="Delete status change"
        loading={isDeletingStatusEntry}>
        <Stack>
          <Text>
            Delete this status change
            {statusEntryToDelete ? (
              <>
                {" "}
                for{" "}
                <Text component="span" fw={700}>
                  {statusEntryToDelete.status}
                </Text>
              </>
            ) : null}
            ?
          </Text>
          <Text c="dimmed" size="sm">
            The application status will fall back to the latest remaining entry if needed.
          </Text>
        </Stack>
      </ConfirmationModal>

      <ConfirmationModal
        opened={isContactDeleteModalOpen}
        onClose={onCloseContactDeleteModal}
        onConfirm={onConfirmDeleteContact}
        title="Delete contact"
        loading={isDeletingContact}>
        <Stack>
          <Text>
            Delete this contact
            {contactToDelete ? (
              <>
                {" "}
                <Text component="span" fw={700}>
                  {contactToDelete.label}
                </Text>
              </>
            ) : null}
            ?
          </Text>
          <Text c="dimmed" size="sm">
            This action cannot be undone.
          </Text>
        </Stack>
      </ConfirmationModal>

      <ConfirmationModal
        opened={isCommunicationDeleteModalOpen}
        onClose={onCloseCommunicationDeleteModal}
        onConfirm={onConfirmDeleteCommunication}
        title="Delete communication"
        loading={isDeletingCommunication}>
        <Stack>
          <Text>
            Delete this communication entry
            {communicationToDelete ? (
              <>
                {" "}
                <Text component="span" fw={700}>
                  {communicationToDelete.label}
                </Text>
              </>
            ) : null}
            ?
          </Text>
          <Text c="dimmed" size="sm">
            This action cannot be undone.
          </Text>
        </Stack>
      </ConfirmationModal>
    </>
  );
}
