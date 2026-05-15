import { useEffect, useState } from "react";
import { Card, Group, Loader, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router";

import { getApplication, updateApplication } from "../api/applications";
import { ApplicationForm } from "../components/ApplicationForm";
import {
  toApplicationPayload,
  type ApplicationFormValues,
} from "../components/applicationFormSchema";
import { usePageTitle } from "../lib/usePageTitle";
import type { ApplicationWithRelations } from "../types/application";

export function EditApplicationPage() {
  const { id = "" } = useParams();
  const [application, setApplication] = useState<ApplicationWithRelations | null>(null);
  usePageTitle(
    application ? `Edit ${application.companyName}` : "Edit Application",
  );

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApplication(id)
      .then(setApplication)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Application could not be loaded.",
        );
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleSubmit(values: ApplicationFormValues) {
    setIsSubmitting(true);

    try {
      await updateApplication(id, toApplicationPayload(values));

      notifications.show({
        color: "green",
        message: "Application updated.",
      });

      navigate(`/applications/${id}`);
    } catch (submitError) {
      notifications.show({
        color: "red",
        message:
          submitError instanceof Error ? submitError.message : "Application could not be saved.",
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Edit application</Title>
        <Text c="dimmed">Update status, documents, and notes in one place.</Text>
      </div>

      <ApplicationForm
        initialValues={application}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
