import { useState } from "react";
import { Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";

import { createApplication } from "../api/applications";
import { ApplicationForm } from "../components/ApplicationForm";
import { getErrorMessage } from "../lib/errors";
import {
  toApplicationPayload,
  type ApplicationFormValues,
} from "../lib/schemas/applicationFormSchema";
import { usePageTitle } from "../lib/usePageTitle";

function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function NewApplicationPage() {
  usePageTitle("New Application");

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues] = useState(() => ({
    foundAt: getTodayDateValue(),
  }));

  async function handleSubmit(values: ApplicationFormValues) {
    setIsSubmitting(true);

    try {
      const payload = toApplicationPayload(values);
      const application = await createApplication({
        ...payload,
        foundAt: payload.foundAt ?? initialValues.foundAt,
      });

      notifications.show({
        color: "green",
        message: "Application created.",
      });

      navigate(`/applications/${application.id}`);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getErrorMessage(
          error,
          "Application could not be created.",
        ),
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
        key={initialValues.foundAt}
        initialValues={initialValues}
        submitLabel="Save application"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
