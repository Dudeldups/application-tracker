import { useEffect, useState } from "react";
import {
  Anchor,
  Card,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router";

import { getApplications } from "../api/applications";
import { statusMeta } from "../lib/applicationMeta";
import { formatDate } from "../lib/format";
import type { ApplicationStatus, ApplicationWithRelations } from "../types/application";

const finishedStatuses: ApplicationStatus[] = [
  "withdrawn",
  "no_response",
  "rejected",
];

const responseStatuses = new Set<ApplicationStatus>([
  "confirmation_received",
  "interview",
  "technical_task",
  "offer",
  "rejected",
  "withdrawn",
]);

const pipelineStatuses = new Set<ApplicationStatus>([
  "interview",
  "technical_task",
  "offer",
]);

const interviewStatuses = new Set<ApplicationStatus>([
  "interview",
  "technical_task",
  "offer",
]);

function isPastDate(value?: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const today = new Date();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return date.getTime() < today.getTime();
}

function isInCurrentMonth(value?: string | null) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function hasResponse(application: ApplicationWithRelations) {
  return (
    responseStatuses.has(application.status) ||
    Boolean(application.lastContactAt) ||
    application.communications.length > 0
  );
}

function hasReachedInterview(application: ApplicationWithRelations) {
  return (
    interviewStatuses.has(application.status) ||
    application.statusHistory.some(entry => interviewStatuses.has(entry.status))
  );
}

function getFirstResponseDate(application: ApplicationWithRelations) {
  const responseDates = [
    ...application.statusHistory
      .filter(entry => responseStatuses.has(entry.status))
      .map(entry => entry.changedAt),
    ...application.communications
      .filter(entry => entry.direction === "incoming")
      .map(entry => entry.date),
    application.lastContactAt,
  ]
    .filter(Boolean)
    .map(value => new Date(value!))
    .filter(date => !Number.isNaN(date.getTime()))
    .sort((left, right) => left.getTime() - right.getTime());

  return responseDates[0] ?? null;
}

function getDayDifference(start: Date, end: Date) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return (end.getTime() - start.getTime()) / millisecondsPerDay;
}

export function DashboardPage() {
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unknown error while loading dashboard.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const totalApplications = applications.length;
  const openApplications = applications.filter(
    application => !finishedStatuses.includes(application.status),
  );
  const overdueFollowUps = openApplications.filter(application =>
    isPastDate(application.followUpAt),
  );
  const activePipeline = applications.filter(application =>
    pipelineStatuses.has(application.status),
  );
  const responses = applications.filter(hasResponse);
  const interviewApplications = applications.filter(hasReachedInterview);
  const appliedThisMonth = applications.filter(application =>
    isInCurrentMonth(application.appliedAt),
  );
  const responseTimesInDays = applications
    .map(application => {
      if (!application.appliedAt) {
        return null;
      }

      const appliedAt = new Date(application.appliedAt);
      const firstResponseDate = getFirstResponseDate(application);

      if (!firstResponseDate || Number.isNaN(appliedAt.getTime())) {
        return null;
      }

      const difference = getDayDifference(appliedAt, firstResponseDate);
      return difference >= 0 ? difference : null;
    })
    .filter((value): value is number => value != null);

  const statusDistribution = Object.entries(statusMeta)
    .map(([status, meta]) => ({
      status,
      label: meta.label,
      color: meta.color,
      count: applications.filter(application => application.status === status).length,
    }))
    .filter(entry => entry.count > 0)
    .sort((left, right) => right.count - left.count);

  const sourceDistribution = Array.from(
    applications.reduce((sources, application) => {
      const source = application.source?.trim() || "Unknown";
      sources.set(source, (sources.get(source) ?? 0) + 1);
      return sources;
    }, new Map<string, number>()),
  )
    .map(([source, count]) => ({ source, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 6);

  const followUps = [...openApplications]
    .filter(application => application.followUpAt)
    .sort((left, right) =>
      new Date(left.followUpAt ?? "").getTime() - new Date(right.followUpAt ?? "").getTime(),
    )
    .slice(0, 6);

  const responseRate =
    totalApplications === 0 ? 0 : Math.round((responses.length / totalApplications) * 100);
  const interviewRate =
    totalApplications === 0
      ? 0
      : Math.round((interviewApplications.length / totalApplications) * 100);
  const averageFirstResponseDays =
    responseTimesInDays.length === 0
      ? null
      : Math.round(
          (responseTimesInDays.reduce((sum, value) => sum + value, 0) /
            responseTimesInDays.length) *
            10,
        ) / 10;

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>Dashboard</Title>
        <Text c="dimmed">
          A quick overview of your pipeline, response rate and next follow-ups.
        </Text>
      </div>

      {isLoading ? (
        <Group justify="center" p="xl">
          <Loader />
        </Group>
      ) : error ? (
        <Card withBorder>
          <Text c="red">{error}</Text>
        </Card>
      ) : applications.length === 0 ? (
        <Card withBorder>
          <Text>No applications saved yet.</Text>
        </Card>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                All applications
              </Text>
              <Title order={2}>{totalApplications}</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Open applications
              </Text>
              <Title order={2}>{openApplications.length}</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Active pipeline
              </Text>
              <Title order={2}>{activePipeline.length}</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Overdue follow-ups
              </Text>
              <Title order={2}>{overdueFollowUps.length}</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Response rate
              </Text>
              <Title order={2}>{responseRate}%</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Interview rate
              </Text>
              <Title order={2}>{interviewRate}%</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Applied this month
              </Text>
              <Title order={2}>{appliedThisMonth.length}</Title>
            </Card>
            <Card withBorder radius="md">
              <Text size="sm" c="dimmed">
                Avg. first response
              </Text>
              <Title order={2}>
                {averageFirstResponseDays == null ? "-" : `${averageFirstResponseDays} days`}
              </Title>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <Card withBorder radius="md">
              <Stack gap="md">
                <div>
                  <Title order={3}>Status distribution</Title>
                  <Text size="sm" c="dimmed">
                    Shows how your applications are currently spread across the pipeline.
                  </Text>
                </div>

                <Stack gap="sm">
                  {statusDistribution.map(entry => {
                    const percentage = Math.round((entry.count / totalApplications) * 100);

                    return (
                      <div key={entry.status}>
                        <Group justify="space-between" mb={6}>
                          <Text size="sm" fw={500}>
                            {entry.label}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {entry.count} ({percentage}%)
                          </Text>
                        </Group>
                        <Progress value={percentage} color={entry.color} radius="xl" />
                      </div>
                    );
                  })}
                </Stack>
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap="md">
                <div>
                  <Title order={3}>Top sources</Title>
                  <Text size="sm" c="dimmed">
                    Helps you see which channels generate the most applications.
                  </Text>
                </div>

                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Source</Table.Th>
                      <Table.Th>Applications</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {sourceDistribution.map(entry => (
                      <Table.Tr key={entry.source}>
                        <Table.Td>{entry.source}</Table.Td>
                        <Table.Td>{entry.count}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Stack>
            </Card>
          </SimpleGrid>

          <Card withBorder radius="md">
            <Stack gap="md">
              <div>
                <Title order={3}>Upcoming follow-ups</Title>
                <Text size="sm" c="dimmed">
                  The next open applications that need attention.
                </Text>
              </div>

              {followUps.length === 0 ? (
                <Text c="dimmed">No follow-ups planned right now.</Text>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Company</Table.Th>
                      <Table.Th>Position</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Follow-up</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {followUps.map(application => (
                      <Table.Tr key={application.id}>
                        <Table.Td>
                          <Anchor component={Link} to={`/applications/${application.id}`}>
                            {application.companyName}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>{application.jobTitle}</Table.Td>
                        <Table.Td>{statusMeta[application.status].label}</Table.Td>
                        <Table.Td c={isPastDate(application.followUpAt) ? "red.4" : undefined}>
                          {formatDate(application.followUpAt)}
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Stack>
          </Card>
        </>
      )}
    </Stack>
  );
}
