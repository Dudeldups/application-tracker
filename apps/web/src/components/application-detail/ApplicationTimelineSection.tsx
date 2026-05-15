import { Badge, Card, Group, Stack, Text, Title } from "@mantine/core";

import { statusMeta } from "../../lib/applicationMeta";
import {
  formatCalendarDate,
  formatDateTime,
  getCalendarDateTimestamp,
} from "../../lib/format";
import type { ApplicationWithRelations } from "../../types/application";

type TimelineItem = {
  id: string;
  date: string;
  label: string;
  description: string;
  badge: string;
  color: string;
  sortPriority: number;
  hasExplicitTime: boolean;
};

function getSortTimestamp(
  value: string,
  sortPriority: number,
  hasExplicitTime: boolean,
) {
  const parsedDate = new Date(value);

  if (hasExplicitTime) {
    if (Number.isNaN(parsedDate.getTime())) {
      return Number.MAX_SAFE_INTEGER;
    }

    return parsedDate.getTime();
  }

  const syntheticHour = Math.min(sortPriority, 23);
  return (
    getCalendarDateTimestamp(value, syntheticHour) ?? Number.MAX_SAFE_INTEGER
  );
}

function hasMeaningfulStoredTime(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  return !(
    parsedDate.getUTCHours() === 0 &&
    parsedDate.getUTCMinutes() === 0 &&
    parsedDate.getUTCSeconds() === 0 &&
    parsedDate.getUTCMilliseconds() === 0
  );
}

function formatTimelineDate(value: string, hasExplicitTime: boolean) {
  if (!hasExplicitTime) {
    return formatCalendarDate(value);
  }

  return formatDateTime(value);
}

function createTimelineItems(application: ApplicationWithRelations) {
  const items: TimelineItem[] = [
    {
      id: `created-${application.id}`,
      date: application.createdAt,
      label: "Application created",
      description: `${application.companyName} - ${application.jobTitle}`,
      badge: "System",
      color: "gray",
      sortPriority: 0,
      hasExplicitTime: true,
    },
  ];

  if (application.foundAt) {
    items.push({
      id: `found-${application.id}`,
      date: application.foundAt,
      label: "Job found",
      description: application.source?.trim()
        ? `Source: ${application.source.trim()}`
        : "Source not specified",
      badge: "Milestone",
      color: "blue",
      sortPriority: 1,
      hasExplicitTime: false,
    });
  }

  if (application.appliedAt) {
    items.push({
      id: `applied-${application.id}`,
      date: application.appliedAt,
      label: "Application sent",
      description: `${application.companyName} - ${application.jobTitle}`,
      badge: "Milestone",
      color: "cyan",
      sortPriority: 2,
      hasExplicitTime: false,
    });
  }

  if (application.lastContactAt) {
    items.push({
      id: `last-contact-${application.id}`,
      date: application.lastContactAt,
      label: "Last contact",
      description: "A contact date is stored for this application.",
      badge: "Contact",
      color: "teal",
      sortPriority: 5,
      hasExplicitTime: false,
    });
  }

  if (application.followUpAt) {
    items.push({
      id: `follow-up-${application.id}`,
      date: application.followUpAt,
      label: "Follow-up planned",
      description: "A follow-up date is scheduled.",
      badge: "Follow-up",
      color: "orange",
      sortPriority: 6,
      hasExplicitTime: false,
    });
  }

  application.statusHistory.forEach(entry => {
    items.push({
      id: `status-${entry.id}`,
      date: entry.changedAt,
      label: "Status changed",
      description: entry.note?.trim()
        ? `${statusMeta[entry.status].label}: ${entry.note.trim()}`
        : statusMeta[entry.status].label,
      badge: "Status",
      color: statusMeta[entry.status].color,
      sortPriority: 3,
      hasExplicitTime: true,
    });
  });

  application.communications.forEach(entry => {
    items.push({
      id: `communication-${entry.id}`,
      date: entry.date,
      label: `${entry.direction === "incoming" ? "Incoming" : "Outgoing"} communication`,
      description: `${entry.type || "Communication"}: ${entry.summary}`,
      badge: "Communication",
      color: entry.direction === "incoming" ? "teal" : "grape",
      sortPriority: 4,
      hasExplicitTime: hasMeaningfulStoredTime(entry.date),
    });
  });

  return items.sort((left, right) => {
    const dateDifference =
      getSortTimestamp(left.date, left.sortPriority, left.hasExplicitTime) -
      getSortTimestamp(right.date, right.sortPriority, right.hasExplicitTime);

    if (dateDifference !== 0) {
      return dateDifference;
    }

    if (left.sortPriority !== right.sortPriority) {
      return left.sortPriority - right.sortPriority;
    }

    return left.label.localeCompare(right.label);
  });
}

export function ApplicationTimelineSection({
  application,
}: {
  application: ApplicationWithRelations;
}) {
  const items = createTimelineItems(application);

  return (
    <Card withBorder radius="md">
      <Stack>
        <div>
          <Title order={3}>Timeline</Title>
          <Text size="sm" c="dimmed">
            Read-only history of this application in ascending order.
          </Text>
        </div>

        <Stack gap="sm">
          {items.map((item, index) => (
            <Group key={item.id} align="start" gap="md" wrap="nowrap">
              <Stack gap={0} align="center" w={116} miw={116}>
                <Badge color={item.color} variant="light">
                  {item.badge}
                </Badge>
                {index < items.length - 1 ? (
                  <Text c="dimmed" size="lg" lh={1}>
                    |
                  </Text>
                ) : null}
              </Stack>

              <Card withBorder radius="md" p="sm" flex={1}>
                <Stack gap={4}>
                  <Group justify="space-between" align="start">
                    <Text fw={600}>{item.label}</Text>
                    <Text size="sm" c="dimmed">
                      {formatTimelineDate(item.date, item.hasExplicitTime)}
                    </Text>
                  </Group>
                  <Text size="sm">{item.description}</Text>
                </Stack>
              </Card>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
