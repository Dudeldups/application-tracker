import { Navigate, createBrowserRouter } from "react-router";

import { AppLayout } from "./components/AppLayout";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { NewApplicationPage } from "./pages/NewApplicationPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { EditApplicationPage } from "./pages/EditApplicationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        Component: DashboardPage,
      },
      {
        path: "applications",
        Component: ApplicationsPage,
      },
      {
        path: "applications/new",
        Component: NewApplicationPage,
      },
      {
        path: "applications/:id",
        Component: ApplicationDetailPage,
      },
      {
        path: "applications/:id/edit",
        Component: EditApplicationPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
]);
