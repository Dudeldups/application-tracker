import { AppShell, Burger, Container, Group, NavLink, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBriefcase, IconPlus } from "@tabler/icons-react";
import { Link, Outlet, useLocation } from "react-router";

export function AppLayout() {
  const location = useLocation();
  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
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
        <Container size="xl" className="flex h-full items-center justify-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Title order={3}>Application Tracker</Title>
          </Group>
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
        <Container size="xl">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
