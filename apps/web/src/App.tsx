import { useEffect, useState } from "react";
import {
  AppShell,
  Badge,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";

import { getApplications } from "./api/applications";
import type { Application } from "./types/application";

export default function App() {
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
            : "Unbekannter Fehler beim Laden.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AppShell header={{ height: 64 }} padding="md">
      <AppShell.Header>
        <Container size="lg" className="flex h-full items-center">
          <Title order={3}>Bewerbungstracker</Title>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Title order={1}>Bewerbungen</Title>
                <Text c="dimmed">
                  Übersicht deiner gespeicherten Bewerbungen.
                </Text>
              </div>
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
                <Text>Noch keine Bewerbungen gespeichert.</Text>
              </Card>
            ) : (
              <Stack>
                {applications.map(application => (
                  <Card key={application.id} withBorder radius="md">
                    <Group justify="space-between" align="start">
                      <div>
                        <Title order={3}>{application.companyName}</Title>
                        <Text>{application.jobTitle}</Text>
                        {application.source ? (
                          <Text size="sm" c="dimmed">
                            Quelle: {application.source}
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
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
