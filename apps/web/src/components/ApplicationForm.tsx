import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  Select,
  Slider,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { Controller, useForm } from "react-hook-form";

import { remoteTypeOptions, statusOptions } from "../lib/applicationMeta";
import { type ApplicationWithRelations } from "../types/application";
import {
  applicationFormSchema,
  buildApplicationFormValues,
  type ApplicationFormValues,
} from "./applicationFormSchema";

type ApplicationFormProps = {
  initialValues?: Partial<ApplicationWithRelations>;
  submitLabel: string;
  onSubmit: (values: ApplicationFormValues) => Promise<void>;
  isSubmitting?: boolean;
};

const ratingMarks = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
];

export function ApplicationForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
}: ApplicationFormProps) {
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: buildApplicationFormValues(initialValues),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="lg">
        <Card withBorder radius="md">
          <Stack>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Company"
                  {...form.register("companyName")}
                  error={form.formState.errors.companyName?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Job title"
                  {...form.register("jobTitle")}
                  error={form.formState.errors.jobTitle?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Location"
                  {...form.register("location")}
                  error={form.formState.errors.location?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  control={form.control}
                  name="remoteType"
                  render={({ field }) => (
                    <Select
                      label="Remote type"
                      data={remoteTypeOptions}
                      value={field.value}
                      onChange={value => field.onChange(value ?? "unknown")}
                      error={form.formState.errors.remoteType?.message}
                    />
                  )}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Source"
                  {...form.register("source")}
                  error={form.formState.errors.source?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Job URL"
                  {...form.register("jobUrl")}
                  error={form.formState.errors.jobUrl?.message}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      label="Status"
                      data={statusOptions}
                      value={field.value}
                      onChange={value => field.onChange(value ?? "interesting")}
                      error={form.formState.errors.status?.message}
                    />
                  )}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>

        <Card withBorder radius="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Found at"
                type="date"
                {...form.register("foundAt")}
                error={form.formState.errors.foundAt?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Applied at"
                type="date"
                {...form.register("appliedAt")}
                error={form.formState.errors.appliedAt?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Last contact"
                type="date"
                {...form.register("lastContactAt")}
                error={form.formState.errors.lastContactAt?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Follow-up at"
                type="date"
                {...form.register("followUpAt")}
                error={form.formState.errors.followUpAt?.message}
              />
            </Grid.Col>
          </Grid>
        </Card>

        <Card withBorder radius="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="CV version"
                {...form.register("cvVersion")}
                error={form.formState.errors.cvVersion?.message}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Cover letter version"
                {...form.register("coverLetterVersion")}
                error={form.formState.errors.coverLetterVersion?.message}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Controller
                control={form.control}
                name="usedCoverLetter"
                render={({ field }) => (
                  <Checkbox
                    label="Used cover letter"
                    checked={field.value}
                    onChange={event => field.onChange(event.currentTarget.checked)}
                  />
                )}
              />
            </Grid.Col>
          </Grid>
        </Card>

        <Card withBorder radius="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Controller
                control={form.control}
                name="interestRating"
                render={({ field }) => (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={500}>Interest</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {field.value ?? "Not set"}
                        </Text>
                        <Button
                          type="button"
                          size="compact-xs"
                          variant="subtle"
                          onClick={() => field.onChange(undefined)}>
                          Clear
                        </Button>
                      </Group>
                    </Group>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      marks={ratingMarks}
                      value={field.value ?? 3}
                      onChange={field.onChange}
                      label={value => `${value}`}
                    />
                    {form.formState.errors.interestRating?.message ? (
                      <Text size="sm" c="red">
                        {form.formState.errors.interestRating.message}
                      </Text>
                    ) : null}
                  </Stack>
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Controller
                control={form.control}
                name="skillFitRating"
                render={({ field }) => (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={500}>Skill fit</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {field.value ?? "Not set"}
                        </Text>
                        <Button
                          type="button"
                          size="compact-xs"
                          variant="subtle"
                          onClick={() => field.onChange(undefined)}>
                          Clear
                        </Button>
                      </Group>
                    </Group>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      marks={ratingMarks}
                      value={field.value ?? 3}
                      onChange={field.onChange}
                      label={value => `${value}`}
                    />
                    {form.formState.errors.skillFitRating?.message ? (
                      <Text size="sm" c="red">
                        {form.formState.errors.skillFitRating.message}
                      </Text>
                    ) : null}
                  </Stack>
                )}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Controller
                control={form.control}
                name="priorityRating"
                render={({ field }) => (
                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text fw={500}>Priority</Text>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          {field.value ?? "Not set"}
                        </Text>
                        <Button
                          type="button"
                          size="compact-xs"
                          variant="subtle"
                          onClick={() => field.onChange(undefined)}>
                          Clear
                        </Button>
                      </Group>
                    </Group>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      marks={ratingMarks}
                      value={field.value ?? 3}
                      onChange={field.onChange}
                      label={value => `${value}`}
                    />
                    {form.formState.errors.priorityRating?.message ? (
                      <Text size="sm" c="red">
                        {form.formState.errors.priorityRating.message}
                      </Text>
                    ) : null}
                  </Stack>
                )}
              />
            </Grid.Col>
          </Grid>
        </Card>

        <Card withBorder radius="md">
          <Stack>
            <Textarea label="Job ad text" minRows={4} {...form.register("jobAdText")} />
            <Textarea label="Focus notes" minRows={3} {...form.register("focusNotes")} />
            <Textarea
              label="Customization notes"
              minRows={3}
              {...form.register("customizationNotes")}
            />
            <Textarea label="General notes" minRows={4} {...form.register("notes")} />
          </Stack>
        </Card>

        <Group justify="flex-end">
          <Button type="submit" loading={isSubmitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
