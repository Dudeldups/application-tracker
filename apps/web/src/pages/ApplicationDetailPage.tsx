import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Group, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";

import {
  createApplicationCommunication,
  createApplicationContact,
  deleteApplication,
  deleteApplicationCommunication,
  deleteApplicationContact,
  deleteApplicationStatusHistoryEntry,
  getApplication,
  updateApplicationStatus,
} from "../api/applications";
import { ApplicationDetailHeader } from "../components/application-detail/ApplicationDetailHeader";
import { ApplicationDetailModals } from "../components/application-detail/ApplicationDetailModals";
import { ApplicationSummarySection } from "../components/application-detail/ApplicationSummarySection";
import { ApplicationTimelineSection } from "../components/application-detail/ApplicationTimelineSection";
import { CommunicationSection } from "../components/application-detail/CommunicationSection";
import { ContactsSection } from "../components/application-detail/ContactsSection";
import { StatusChangesSection } from "../components/application-detail/StatusChangesSection";
import {
  communicationFormSchema,
  contactFormSchema,
  statusFormSchema,
  type CommunicationFormValues,
  type ContactFormValues,
  type StatusFormValues,
} from "../lib/schemas/forms";
import { toDateTimeLocalInputValue } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";
import type { ApplicationWithRelations } from "../types/application";

export function ApplicationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] =
    useState<ApplicationWithRelations | null>(null);
  usePageTitle(application ? application.companyName : "Application Details");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingCommunication, setIsSubmittingCommunication] =
    useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingContact, setIsDeletingContact] = useState(false);
  const [isDeletingCommunication, setIsDeletingCommunication] = useState(false);
  const [isDeletingStatusEntry, setIsDeletingStatusEntry] = useState(false);
  const [statusEntryToDelete, setStatusEntryToDelete] = useState<{
    id: string;
    status: string;
  } | null>(null);
  const [contactToDelete, setContactToDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [communicationToDelete, setCommunicationToDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [
    isDeleteModalOpen,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [
    isStatusDeleteModalOpen,
    { open: openStatusDeleteModal, close: closeStatusDeleteModal },
  ] = useDisclosure(false);
  const [
    isContactDeleteModalOpen,
    { open: openContactDeleteModal, close: closeContactDeleteModal },
  ] = useDisclosure(false);
  const [
    isCommunicationDeleteModalOpen,
    {
      open: openCommunicationDeleteModal,
      close: closeCommunicationDeleteModal,
    },
  ] = useDisclosure(false);

  const statusForm = useForm<StatusFormValues>({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: "interesting",
      note: "",
    },
  });

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
    },
  });

  const communicationForm = useForm<CommunicationFormValues>({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      type: "",
      direction: "incoming",
      summary: "",
      body: "",
      date: toDateTimeLocalInputValue(),
    },
  });

  const loadApplication = useCallback(async () => {
    try {
      const loaded = await getApplication(id);
      setApplication(loaded);
      setError(null);
      statusForm.reset({
        status: loaded.status,
        note: "",
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Application could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, statusForm]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    void loadApplication();
  }, [loadApplication]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleStatusSubmit(values: StatusFormValues) {
    setIsSubmittingStatus(true);

    try {
      await updateApplicationStatus(id, values);
      await loadApplication();
      statusForm.reset({
        status: values.status,
        note: "",
      });
      notifications.show({
        color: "green",
        message: "Status updated.",
      });
    } catch (submitError) {
      notifications.show({
        color: "red",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Status could not be updated.",
      });
    } finally {
      setIsSubmittingStatus(false);
    }
  }

  async function handleContactSubmit(values: ContactFormValues) {
    setIsSubmittingContact(true);

    try {
      await createApplicationContact(id, values);
      await loadApplication();
      contactForm.reset();
      notifications.show({
        color: "green",
        message: "Contact added.",
      });
    } catch (submitError) {
      notifications.show({
        color: "red",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Contact could not be saved.",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  }

  async function handleCommunicationSubmit(values: CommunicationFormValues) {
    setIsSubmittingCommunication(true);

    try {
      await createApplicationCommunication(id, values);
      await loadApplication();
      communicationForm.reset({
        type: "",
        direction: "incoming",
        summary: "",
        body: "",
        date: toDateTimeLocalInputValue(),
      });
      notifications.show({
        color: "green",
        message: "Communication added.",
      });
    } catch (submitError) {
      notifications.show({
        color: "red",
        message:
          submitError instanceof Error
            ? submitError.message
            : "Communication could not be saved.",
      });
    } finally {
      setIsSubmittingCommunication(false);
    }
  }

  async function handleDelete() {
    if (!application) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteApplication(application.id);
      closeDeleteModal();
      notifications.show({
        color: "green",
        message: "Application deleted.",
      });
      navigate("/applications");
    } catch (deleteError) {
      notifications.show({
        color: "red",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Application could not be deleted.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeleteStatusEntry() {
    if (!statusEntryToDelete) {
      return;
    }

    setIsDeletingStatusEntry(true);

    try {
      const updated = await deleteApplicationStatusHistoryEntry(
        id,
        statusEntryToDelete.id,
      );
      setApplication(updated);
      statusForm.reset({
        status: updated.status,
        note: "",
      });
      closeStatusDeleteModal();
      setStatusEntryToDelete(null);
      notifications.show({
        color: "green",
        message: "Status entry deleted.",
      });
    } catch (deleteError) {
      notifications.show({
        color: "red",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Status entry could not be deleted.",
      });
    } finally {
      setIsDeletingStatusEntry(false);
    }
  }

  async function handleDeleteContact() {
    if (!contactToDelete) {
      return;
    }

    setIsDeletingContact(true);

    try {
      await deleteApplicationContact(id, contactToDelete.id);
      await loadApplication();
      closeContactDeleteModal();
      setContactToDelete(null);
      notifications.show({
        color: "green",
        message: "Contact deleted.",
      });
    } catch (deleteError) {
      notifications.show({
        color: "red",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Contact could not be deleted.",
      });
    } finally {
      setIsDeletingContact(false);
    }
  }

  async function handleDeleteCommunication() {
    if (!communicationToDelete) {
      return;
    }

    setIsDeletingCommunication(true);

    try {
      await deleteApplicationCommunication(id, communicationToDelete.id);
      await loadApplication();
      closeCommunicationDeleteModal();
      setCommunicationToDelete(null);
      notifications.show({
        color: "green",
        message: "Communication deleted.",
      });
    } catch (deleteError) {
      notifications.show({
        color: "red",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Communication could not be deleted.",
      });
    } finally {
      setIsDeletingCommunication(false);
    }
  }

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  if (error || !application) {
    return (
      <Card withBorder>
        <Text c="red">{error ?? "Application not found."}</Text>
      </Card>
    );
  }

  const initialStatusEntryId =
    application.statusHistory[application.statusHistory.length - 1]?.id;

  return (
    <Stack gap="md">
      <ApplicationDetailModals
        companyName={application.companyName}
        jobTitle={application.jobTitle}
        isDeleteModalOpen={isDeleteModalOpen}
        isStatusDeleteModalOpen={isStatusDeleteModalOpen}
        isContactDeleteModalOpen={isContactDeleteModalOpen}
        isCommunicationDeleteModalOpen={isCommunicationDeleteModalOpen}
        isDeletingApplication={isDeleting}
        isDeletingStatusEntry={isDeletingStatusEntry}
        isDeletingContact={isDeletingContact}
        isDeletingCommunication={isDeletingCommunication}
        statusEntryToDelete={statusEntryToDelete}
        contactToDelete={contactToDelete}
        communicationToDelete={communicationToDelete}
        onCloseDeleteModal={closeDeleteModal}
        onCloseStatusDeleteModal={() => {
          closeStatusDeleteModal();
          setStatusEntryToDelete(null);
        }}
        onCloseContactDeleteModal={() => {
          closeContactDeleteModal();
          setContactToDelete(null);
        }}
        onCloseCommunicationDeleteModal={() => {
          closeCommunicationDeleteModal();
          setCommunicationToDelete(null);
        }}
        onConfirmDelete={handleDelete}
        onConfirmDeleteStatusEntry={handleDeleteStatusEntry}
        onConfirmDeleteContact={handleDeleteContact}
        onConfirmDeleteCommunication={handleDeleteCommunication}
      />

      <ApplicationDetailHeader
        application={application}
        isDeleting={isDeleting}
        onDelete={openDeleteModal}
      />

      <ApplicationSummarySection application={application} />

      <ApplicationTimelineSection application={application} />

      <StatusChangesSection
        application={application}
        form={statusForm}
        isSubmitting={isSubmittingStatus}
        initialStatusEntryId={initialStatusEntryId}
        onSubmit={handleStatusSubmit}
        onDeleteEntry={(entryId, status) => {
          setStatusEntryToDelete({ id: entryId, status });
          openStatusDeleteModal();
        }}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <ContactsSection
          application={application}
          form={contactForm}
          isSubmitting={isSubmittingContact}
          onSubmit={handleContactSubmit}
          onDeleteContact={(contactId, label) => {
            setContactToDelete({ id: contactId, label });
            openContactDeleteModal();
          }}
        />

        <CommunicationSection
          application={application}
          form={communicationForm}
          isSubmitting={isSubmittingCommunication}
          onSubmit={handleCommunicationSubmit}
          onDeleteCommunication={(communicationId, label) => {
            setCommunicationToDelete({ id: communicationId, label });
            openCommunicationDeleteModal();
          }}
        />
      </SimpleGrid>
    </Stack>
  );
}
