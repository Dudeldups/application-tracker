import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Link } from "react-router";

import { getApplications } from "../api/applications";
import type { Application } from "../types/application";

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          {applications.map(application => (
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
                  <Text c="dark">{application.jobTitle}</Text>

                  {application.source ? (
                    <Text size="sm" c="dimmed">
                      Source: {application.source}
                    </Text>
                  ) : null}
                </div>

                <Badge>{application.status}</Badge>
              </Group>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
