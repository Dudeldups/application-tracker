import {
  ActionIcon,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { formatDateTime } from "../../lib/format";
import type { ApplicationWithRelations } from "../../types/application";
import type { CommunicationFormValues } from "../../lib/schemas/forms";

type CommunicationSectionProps = {
  application: ApplicationWithRelations;
  form: UseFormReturn<CommunicationFormValues>;
  isSubmitting: boolean;
  onSubmit: (values: CommunicationFormValues) => Promise<void>;
  onDeleteCommunication: (communicationId: string, label: string) => void;
};

export function CommunicationSection({
  application,
  form,
  isSubmitting,
  onSubmit,
  onDeleteCommunication,
}: CommunicationSectionProps) {
  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={3}>Communication</Title>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Type"
              placeholder="Email, phone, LinkedIn ..."
              {...form.register("type")}
              error={form.formState.errors.type?.message}
            />
            <Controller
              control={form.control}
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
                  error={form.formState.errors.direction?.message}
                />
              )}
            />
            <TextInput
              label="Date and time"
              type="datetime-local"
              {...form.register("date")}
              error={form.formState.errors.date?.message}
            />
            <TextInput
              label="Summary"
              {...form.register("summary")}
              error={form.formState.errors.summary?.message}
            />
            <Textarea label="Details" minRows={3} {...form.register("body")} />
            <Button type="submit" loading={isSubmitting}>
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
                        {formatDateTime(entry.date)}
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
                    onClick={() =>
                      onDeleteCommunication(entry.id, entry.summary)
                    }>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
