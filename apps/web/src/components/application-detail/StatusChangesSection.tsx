import { Button, Card, Grid, Select, Stack, Table, TextInput, Title } from "@mantine/core";
import { Controller, type UseFormReturn } from "react-hook-form";

import { StatusBadge } from "../StatusBadge";
import { statusOptions } from "../../lib/applicationMeta";
import { formatDate } from "../../lib/format";
import type { ApplicationWithRelations } from "../../types/application";
import type { StatusFormValues } from "./forms";

type StatusChangesSectionProps = {
  application: ApplicationWithRelations;
  form: UseFormReturn<StatusFormValues>;
  isSubmitting: boolean;
  initialStatusEntryId?: string;
  onSubmit: (values: StatusFormValues) => Promise<void>;
  onDeleteEntry: (entryId: string, status: string) => void;
};

export function StatusChangesSection({
  application,
  form,
  isSubmitting,
  initialStatusEntryId,
  onSubmit,
  onDeleteEntry,
}: StatusChangesSectionProps) {
  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={3}>Status changes</Title>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Grid align="end">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select
                    label="New status"
                    data={statusOptions}
                    value={field.value}
                    onChange={value => field.onChange(value ?? application.status)}
                    error={form.formState.errors.status?.message}
                  />
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Note"
                {...form.register("note")}
                error={form.formState.errors.note?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 2 }}>
              <Button type="submit" fullWidth loading={isSubmitting}>
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
                    <Button
                      variant="subtle"
                      color="red"
                      px={0}
                      onClick={() => onDeleteEntry(entry.id, entry.status)}>
                      Delete
                    </Button>
                  ) : null}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Card>
  );
}
