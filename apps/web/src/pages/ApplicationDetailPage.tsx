import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Anchor,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { z } from "zod";

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
import { ConfirmationModal } from "../components/ConfirmationModal";
import { StatusBadge } from "../components/StatusBadge";
import { statusOptions } from "../lib/applicationMeta";
import { formatDate } from "../lib/format";
import {
  applicationStatuses,
  type ApplicationWithRelations,
} from "../types/application";

const statusFormSchema = z.object({
  status: z.enum(applicationStatuses, {
    error: "Status is required.",
  }),
  note: z.string().optional(),
});

const contactFormSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")),
  phone: z.string().optional(),
});

const communicationFormSchema = z.object({
  type: z.string().trim().min(1, "Type is required."),
  direction: z.enum(["incoming", "outgoing"], {
    error: "Direction is required.",
  }),
  summary: z.string().trim().min(1, "Summary is required."),
  body: z.string().optional(),
  date: z.string().optional(),
});

export function ApplicationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingCommunication, setIsSubmittingCommunication] = useState(false);
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
  const [isDeleteModalOpen, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
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
    { open: openCommunicationDeleteModal, close: closeCommunicationDeleteModal },
  ] = useDisclosure(false);

  const statusForm = useForm({
    resolver: zodResolver(statusFormSchema),
    defaultValues: {
      status: "interesting",
      note: "",
    },
  });

  const contactForm = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
    },
  });

  const communicationForm = useForm({
    resolver: zodResolver(communicationFormSchema),
    defaultValues: {
      type: "",
      direction: "incoming",
      summary: "",
      body: "",
      date: "",
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

  async function handleStatusSubmit(values: z.infer<typeof statusFormSchema>) {
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
          submitError instanceof Error ? submitError.message : "Status could not be updated.",
      });
    } finally {
      setIsSubmittingStatus(false);
    }
  }

  async function handleContactSubmit(values: z.infer<typeof contactFormSchema>) {
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
          submitError instanceof Error ? submitError.message : "Contact could not be saved.",
      });
    } finally {
      setIsSubmittingContact(false);
    }
  }

  async function handleCommunicationSubmit(
    values: z.infer<typeof communicationFormSchema>,
  ) {
    setIsSubmittingCommunication(true);

    try {
      await createApplicationCommunication(id, values);
      await loadApplication();
      communicationForm.reset();
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
      const updated = await deleteApplicationStatusHistoryEntry(id, statusEntryToDelete.id);
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
          deleteError instanceof Error ? deleteError.message : "Contact could not be deleted.",
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

  const initialStatusEntryId =
    application?.statusHistory[application.statusHistory.length - 1]?.id;

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

  return (
    <Stack gap="md">
      <ConfirmationModal
        opened={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete application"
        loading={isDeleting}>
        <Stack>
          <Text>
            Delete the application for{" "}
            <Text component="span" fw={700}>
              {application.companyName}
            </Text>{" "}
            as{" "}
            <Text component="span" fw={700}>
              {application.jobTitle}
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
        onClose={() => {
          closeStatusDeleteModal();
          setStatusEntryToDelete(null);
        }}
        onConfirm={handleDeleteStatusEntry}
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
        onClose={() => {
          closeContactDeleteModal();
          setContactToDelete(null);
        }}
        onConfirm={handleDeleteContact}
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
        onClose={() => {
          closeCommunicationDeleteModal();
          setCommunicationToDelete(null);
        }}
        onConfirm={handleDeleteCommunication}
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

      <Group justify="space-between" align="start">
        <div>
          <Title order={1}>{application.companyName}</Title>
          <Text c="dimmed">{application.jobTitle}</Text>
        </div>

        <Group>
          <StatusBadge status={application.status} />
          <Button
            component={Link}
            to={`/applications/${application.id}/edit`}
            variant="outline"
            color="green">
            Edit
          </Button>
          <Button
            color="red"
            variant="light"
            loading={isDeleting}
            onClick={openDeleteModal}>
            Delete
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md">
          <Stack gap="xs">
            <Title order={3}>Overview</Title>
            <Text>City: {application.city || "Not set"}</Text>
            <Text>Address: {application.address || "Not set"}</Text>
            <Text>Source: {application.source || "Not set"}</Text>
            <Text>Found: {formatDate(application.foundAt)}</Text>
            <Text>Applied: {formatDate(application.appliedAt)}</Text>
            <Text>Last contact: {formatDate(application.lastContactAt)}</Text>
            <Text>Follow-up: {formatDate(application.followUpAt)}</Text>
            {application.jobUrl ? (
              <Anchor href={application.jobUrl} target="_blank">
                Job posting
              </Anchor>
            ) : null}
          </Stack>
        </Card>

        <Card withBorder radius="md">
          <Stack gap="xs">
            <Title order={3}>Ratings</Title>
            <Text>Interest: {application.interestRating ?? "Not set"}</Text>
            <Text>Skill fit: {application.skillFitRating ?? "Not set"}</Text>
            <Text>Priority: {application.priorityRating ?? "Not set"}</Text>
            <Divider my="sm" />
            <Text>CV: {application.cvVersion || "Not set"}</Text>
            <Text>
              Cover letter:{" "}
              {application.coverLetterVersion || application.usedCoverLetter
                ? `${application.coverLetterVersion || "available"}`
                : "Not used"}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md">
        <Stack>
          <Title order={3}>Notes</Title>
          <Text>{application.customizationNotes || "No customization notes."}</Text>
          <Text>{application.notes || "No general notes."}</Text>
          {application.jobAdText ? (
            <>
              <Divider />
              <Textarea
                label="Job ad text"
                value={application.jobAdText}
                minRows={14}
                autosize
                readOnly
              />
            </>
          ) : null}
        </Stack>
      </Card>

      <Card withBorder radius="md">
        <Stack>
          <Title order={3}>Status changes</Title>
          <form onSubmit={statusForm.handleSubmit(handleStatusSubmit)}>
            <Grid align="end">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Controller
                  control={statusForm.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      label="New status"
                      data={statusOptions}
                      value={field.value}
                      onChange={value => field.onChange(value ?? application.status)}
                      error={statusForm.formState.errors.status?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Note"
                  {...statusForm.register("note")}
                  error={statusForm.formState.errors.note?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Button type="submit" fullWidth loading={isSubmittingStatus}>
                  Save
                </Button>
              </Grid.Col>
            </Grid>
          </form>

          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Note</Table.Th>
                <Table.Th w={56}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {application.statusHistory.map(entry => (
                <Table.Tr key={entry.id}>
                  <Table.Td>{formatDate(entry.changedAt)}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={entry.status} />
                  </Table.Td>
                  <Table.Td>{entry.note || "-"}</Table.Td>
                  <Table.Td>
                    {entry.id !== initialStatusEntryId ? (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete status entry"
                        onClick={() => {
                          setStatusEntryToDelete({
                            id: entry.id,
                            status: entry.status,
                          });
                          openStatusDeleteModal();
                        }}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    ) : null}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder radius="md">
          <Stack>
            <Title order={3}>Contacts</Title>
            <form onSubmit={contactForm.handleSubmit(handleContactSubmit)}>
              <Stack>
                <TextInput
                  label="Name"
                  {...contactForm.register("name")}
                  error={contactForm.formState.errors.name?.message}
                />
                <TextInput
                  label="Role"
                  {...contactForm.register("role")}
                  error={contactForm.formState.errors.role?.message}
                />
                <TextInput
                  label="Email"
                  {...contactForm.register("email")}
                  error={contactForm.formState.errors.email?.message}
                />
                <TextInput
                  label="Phone"
                  {...contactForm.register("phone")}
                  error={contactForm.formState.errors.phone?.message}
                />
                <Button type="submit" loading={isSubmittingContact}>
                  Add contact
                </Button>
              </Stack>
            </form>

            {application.contacts.length === 0 ? (
              <Text c="dimmed">No contacts added yet.</Text>
            ) : (
              <Stack gap="sm">
                {application.contacts.map(contact => (
                  <Card key={contact.id} withBorder>
                    <Group justify="space-between" align="start" wrap="nowrap">
                      <Stack gap={2}>
                        <Text fw={600}>{contact.name || "Unnamed contact"}</Text>
                        <Text size="sm">{contact.role || "No role added"}</Text>
                        <Text size="sm">{contact.email || "No email"}</Text>
                        <Text size="sm">{contact.phone || "No phone number"}</Text>
                      </Stack>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete contact"
                        onClick={() => {
                          setContactToDelete({
                            id: contact.id,
                            label: contact.name || contact.email || contact.phone || "contact",
                          });
                          openContactDeleteModal();
                        }}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>

        <Card withBorder radius="md">
          <Stack>
            <Title order={3}>Communication</Title>
            <form onSubmit={communicationForm.handleSubmit(handleCommunicationSubmit)}>
              <Stack>
                <TextInput
                  label="Type"
                  placeholder="Email, phone, LinkedIn ..."
                  {...communicationForm.register("type")}
                  error={communicationForm.formState.errors.type?.message}
                />
                <Controller
                  control={communicationForm.control}
                  name="direction"
                  render={({ field }) => (
                    <Select
                      label="Direction"
                      data={[
                        { value: "incoming", label: "Incoming" },
                        { value: "outgoing", label: "Outgoing" },
                      ]}
                      value={field.value}
                      onChange={value => field.onChange(value ?? "incoming")}
                      error={communicationForm.formState.errors.direction?.message}
                    />
                  )}
                />
                <TextInput
                  label="Date"
                  type="date"
                  {...communicationForm.register("date")}
                  error={communicationForm.formState.errors.date?.message}
                />
                <TextInput
                  label="Summary"
                  {...communicationForm.register("summary")}
                  error={communicationForm.formState.errors.summary?.message}
                />
                <Textarea label="Details" minRows={3} {...communicationForm.register("body")} />
                <Button type="submit" loading={isSubmittingCommunication}>
                  Save communication
                </Button>
              </Stack>
            </form>

            {application.communications.length === 0 ? (
              <Text c="dimmed">No communication logged yet.</Text>
            ) : (
              <Stack gap="sm">
                {application.communications.map(entry => (
                  <Card key={entry.id} withBorder>
                    <Group justify="space-between" align="start" wrap="nowrap">
                      <Stack gap={2} flex={1}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={600}>{entry.summary}</Text>
                          <Text size="sm" c="dimmed">
                            {formatDate(entry.date)}
                          </Text>
                        </Group>
                        <Text size="sm">
                          {entry.type} · {entry.direction}
                        </Text>
                        {entry.body ? <Text size="sm">{entry.body}</Text> : null}
                      </Stack>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete communication"
                        onClick={() => {
                          setCommunicationToDelete({
                            id: entry.id,
                            label: entry.summary,
                          });
                          openCommunicationDeleteModal();
                        }}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
