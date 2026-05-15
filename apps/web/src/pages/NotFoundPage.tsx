import { Anchor, Card, Group, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <Card withBorder radius="md">
      <Stack gap="sm">
        <Title order={1}>Page not found</Title>
        <Text c="dimmed">This resource does not exist.</Text>
        <Group gap="md">
          <Anchor component={Link} to="/dashboard">
            Back to dashboard
          </Anchor>
          <Anchor component={Link} to="/applications">
            To your applications
          </Anchor>
        </Group>
      </Stack>
    </Card>
  );
}
