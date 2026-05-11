import { AppShell, Container, Group, NavLink, Title } from "@mantine/core";
import { IconBriefcase, IconPlus } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";

export function AppLayout() {
  const location = useLocation();

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{ width: 260, breakpoint: "sm" }}
      padding="md">
      <AppShell.Header>
        <Container size="xl" className="flex h-full items-center">
          <Title order={3}>Application Tracker</Title>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group gap="xs" className="flex-col items-stretch">
          <NavLink
            component={Link}
            to="/applications"
            label="Applications"
            leftSection={<IconBriefcase size={18} />}
            active={location.pathname === "/applications"}
          />
          <NavLink
            component={Link}
            to="/applications/new"
            label="New application"
            leftSection={<IconPlus size={18} />}
            active={location.pathname === "/applications/new"}
          />
        </Group>
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
