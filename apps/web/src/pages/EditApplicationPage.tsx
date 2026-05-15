import { useState } from "react";
import { Card, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLoaderData, useNavigate, useParams } from "react-router";

import { updateApplication } from "../api/applications";
import { ApplicationForm } from "../components/ApplicationForm";
import {
  toApplicationPayload,
  type ApplicationFormValues,
} from "../lib/schemas/applicationFormSchema";
import { usePageTitle } from "../lib/usePageTitle";
import type { ApplicationPageLoaderData } from "./applicationLoaders";

export function EditApplicationPage() {
  const { id = "" } = useParams();
  const { application, error } =
    useLoaderData() as ApplicationPageLoaderData;
  usePageTitle(
    application ? `Edit ${application.companyName}` : "Edit Application",
  );

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          submitError instanceof Error
            ? submitError.message
            : "Application could not be saved.",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Text c="dimmed">
          Update status, documents, and notes in one place.
        </Text>
      </div>

      <ApplicationForm
        key={application.id}
        initialValues={application}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
