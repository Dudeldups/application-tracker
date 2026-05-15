import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { render, screen, waitFor } from "@testing-library/react";
import { Outlet, RouterProvider, createMemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getApplication } from "./api/applications";
import { ApiRequestError } from "./lib/errors";
import { routes } from "./router";

vi.mock("./components/AppLayout", () => ({
  AppLayout: () => <Outlet />,
}));

vi.mock("./pages/DashboardPage", () => ({
  DashboardPage: () => <div>Dashboard page</div>,
}));

vi.mock("./pages/ApplicationsPage", () => ({
  ApplicationsPage: () => <div>Applications page</div>,
}));

vi.mock("./pages/NewApplicationPage", () => ({
  NewApplicationPage: () => <div>New application page</div>,
}));

vi.mock("./pages/NotFoundPage", () => ({
  NotFoundPage: () => <div>Not found page</div>,
}));

vi.mock("./lib/usePageTitle", () => ({
  usePageTitle: vi.fn(),
}));

vi.mock("./api/applications", () => ({
  getApplication: vi.fn(),
}));

function renderRouter(initialEntry: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry],
  });

  render(
    <MantineProvider forceColorScheme="dark">
      <Notifications />
      <RouterProvider router={router} />
    </MantineProvider>,
  );

  return router;
}

describe("router smoke tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects the root route to the dashboard", async () => {
    const router = renderRouter("/");

    expect(await screen.findByText("Dashboard page")).toBeInTheDocument();

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/dashboard");
    });
  });

  it("renders the detail route loader not-found state", async () => {
    vi.mocked(getApplication).mockRejectedValue(
      new ApiRequestError("Missing application", 404),
    );

    renderRouter("/applications/missing");

    expect(await screen.findByText("Application not found.")).toBeInTheDocument();
  });

  it("renders the edit route loader network error state", async () => {
    vi.mocked(getApplication).mockRejectedValue(new TypeError("Failed to fetch"));

    renderRouter("/applications/missing/edit");

    expect(
      await screen.findByText("The application service could not be reached."),
    ).toBeInTheDocument();
  });
});
