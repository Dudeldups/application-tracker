import {
  AppShell,
  Burger,
  Container,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBriefcase, IconLayoutDashboard, IconPlus } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";
import { config } from "../config";

export function AppLayout() {
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 82 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "xs", sm: "md" }}
      styles={{
        main: {
          backgroundColor: "var(--app-bg)",
        },
        header: {
          backgroundColor: "var(--app-surface)",
          borderBottom: "1px solid var(--app-border)",
        },
        navbar: {
          backgroundColor: "var(--app-surface)",
          borderInlineEnd: "1px solid var(--app-border)",
        },
      }}>
      <AppShell.Header>
        <Container
          size="xl"
          px={{ base: "xs", sm: "md" }}
          className="flex h-full items-center justify-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <img
                src="/app-icon.svg"
                alt="Application Tracker logo"
                width={30}
                height={30}
                style={{ display: "block", flexShrink: 0, marginTop: 4 }}
              />
              <Stack gap={2}>
                <Title order={3}>Application Tracker</Title>
                {config.demoMode ? (
                  <Text size="sm" c="yellow.2">
                    Demo mode: data resets periodically. Please don&apos;t input
                    real data here.
                  </Text>
                ) : null}
              </Stack>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group gap="xs" className="flex-col items-stretch">
          <NavLink
            component={Link}
            to="/dashboard"
            label="Dashboard"
            leftSection={<IconLayoutDashboard size={18} />}
            active={location.pathname === "/dashboard"}
            onClick={close}
          />
          <NavLink
            component={Link}
            to="/applications"
            label="Applications"
            leftSection={<IconBriefcase size={18} />}
            active={location.pathname === "/applications"}
            onClick={close}
          />
          <NavLink
            component={Link}
            to="/applications/new"
            label="New application"
            leftSection={<IconPlus size={18} />}
            active={location.pathname === "/applications/new"}
            onClick={close}
          />
        </Group>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl" px={{ base: "xs", sm: "md" }}>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
