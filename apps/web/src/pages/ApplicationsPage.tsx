import { useEffect, useState } from "react";
import {
  Anchor,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import { getApplications } from "../api/applications";
import { remoteTypeMeta } from "../lib/applicationMeta";
import { formatDate } from "../lib/format";
import { StatusBadge } from "../components/StatusBadge";
import type { ApplicationWithRelations } from "../types/application";

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "followUpSoonest", label: "Follow-up soonest" },
  { value: "interestHigh", label: "Interest highest" },
  { value: "skillFitHigh", label: "Skill fit highest" },
  { value: "priorityHigh", label: "Priority highest" },
  { value: "companyAsc", label: "Company A-Z" },
  { value: "companyDesc", label: "Company Z-A" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function getTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() : null;
}

function compareRating(
  left?: number | null,
  right?: number | null,
  leftCreatedAt?: string,
  rightCreatedAt?: string,
) {
  if (left == null && right == null) {
    return new Date(rightCreatedAt ?? 0).getTime() - new Date(leftCreatedAt ?? 0).getTime();
  }

  if (left == null) {
    return 1;
  }

  if (right == null) {
    return -1;
  }

  if (left === right) {
    return new Date(rightCreatedAt ?? 0).getTime() - new Date(leftCreatedAt ?? 0).getTime();
  }

  return right - left;
}

function sortApplications(
  applications: ApplicationWithRelations[],
  sortBy: SortOption,
) {
  const sorted = [...applications];

  sorted.sort((left, right) => {
    switch (sortBy) {
      case "oldest":
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      case "followUpSoonest": {
        const leftFollowUp = getTimestamp(left.followUpAt);
        const rightFollowUp = getTimestamp(right.followUpAt);

        if (leftFollowUp == null && rightFollowUp == null) {
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        }

        if (leftFollowUp == null) {
          return 1;
        }

        if (rightFollowUp == null) {
          return -1;
        }

        return leftFollowUp - rightFollowUp;
      }
      case "companyAsc":
        return left.companyName.localeCompare(right.companyName);
      case "companyDesc":
        return right.companyName.localeCompare(left.companyName);
      case "interestHigh":
        return compareRating(
          left.interestRating,
          right.interestRating,
          left.createdAt,
          right.createdAt,
        );
      case "skillFitHigh":
        return compareRating(
          left.skillFitRating,
          right.skillFitRating,
          left.createdAt,
          right.createdAt,
        );
      case "priorityHigh":
        return compareRating(
          left.priorityRating,
          right.priorityRating,
          left.createdAt,
          right.createdAt,
        );
      case "newest":
      default:
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }
  });

  return sorted;
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  useEffect(() => {
    getApplications()
      .then(setApplications)
      .catch((error: unknown) => {
        setError(
          error instanceof Error
            ? error.message
            : "Unknown error while loading applications.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const sortedApplications = sortApplications(applications, sortBy);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={1}>Applications</Title>
          <Text c="dimmed">Track your job applications and follow-ups.</Text>
        </div>

        <Button
          component={Link}
          to="/applications/new"
          leftSection={<IconPlus size={18} />}>
          New application
        </Button>
      </Group>

      <Group justify="flex-end">
        <Select
          label="Sort by"
          data={sortOptions}
          value={sortBy}
          onChange={value => setSortBy((value as SortOption | null) ?? "newest")}
          w={220}
        />
      </Group>

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
        <Card withBorder radius="md" p={0}>
          <Table highlightOnHover striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Company</Table.Th>
                <Table.Th>Position</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Remote type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Priority</Table.Th>
                <Table.Th>Applied</Table.Th>
                <Table.Th>Source</Table.Th>
                <Table.Th>Follow-up</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedApplications.map(application => (
                <Table.Tr key={application.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/applications/${application.id}`}>
                      {application.companyName}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{application.jobTitle}</Table.Td>
                  <Table.Td>
                    {application.location || "No location"}
                  </Table.Td>
                  <Table.Td>{remoteTypeMeta[application.remoteType]}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={application.status} />
                  </Table.Td>
                  <Table.Td>{application.priorityRating}</Table.Td>
                  <Table.Td>{formatDate(application.appliedAt)}</Table.Td>
                  <Table.Td>{application.source || "—"}</Table.Td>
                  <Table.Td>{formatDate(application.followUpAt)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}
    </Stack>
  );
}
