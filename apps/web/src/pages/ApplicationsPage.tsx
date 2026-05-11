import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
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
  { value: "companyAsc", label: "Company A-Z" },
  { value: "companyDesc", label: "Company Z-A" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

function getTimestamp(value?: string | null) {
  return value ? new Date(value).getTime() : null;
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
        <Stack>
          {sortedApplications.map(application => (
            <Card
              key={application.id}
              withBorder
              radius="md"
              component={Link}
              to={`/applications/${application.id}`}
              className="no-underline">
              <Group justify="space-between" align="start">
                <div>
                  <Title order={3}>{application.companyName}</Title>
                  <Text>{application.jobTitle}</Text>
                  <Group gap="xs" mt="xs">
                    <Badge variant="outline">
                      {remoteTypeMeta[application.remoteType]}
                    </Badge>
                    {application.followUpAt ? (
                      <Badge color="orange" variant="light">
                        Follow-up {formatDate(application.followUpAt)}
                      </Badge>
                    ) : null}
                  </Group>

                  {application.source ? (
                    <Text size="sm" c="dimmed">
                      Source: {application.source}
                    </Text>
                  ) : null}
                </div>

                <StatusBadge status={application.status} />
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
