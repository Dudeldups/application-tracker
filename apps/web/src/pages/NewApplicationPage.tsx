import { useState } from "react";
import { Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";

import { createApplication } from "../api/applications";
import { ApplicationForm } from "../components/ApplicationForm";
import {
  toApplicationPayload,
  type ApplicationFormValues,
} from "../components/applicationFormSchema";

export function NewApplicationPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: ApplicationFormValues) {
    setIsSubmitting(true);

    try {
      const application = await createApplication(toApplicationPayload(values));

      notifications.show({
        color: "green",
        message: "Application created.",
      });

      navigate(`/applications/${application.id}`);
    } catch (error) {
      notifications.show({
        color: "red",
        message:
          error instanceof Error ? error.message : "Application could not be created.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>New application</Title>
        <Text c="dimmed">
          Capture the key details and plan follow-ups right away.
        </Text>
      </div>

      <ApplicationForm
        submitLabel="Save application"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
