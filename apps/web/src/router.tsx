import {
  Navigate,
  createBrowserRouter,
  type RouteObject,
} from "react-router";

import { AppLayout } from "./components/AppLayout";
import { ApplicationsPage } from "./pages/ApplicationsPage";
import { ApplicationDetailPage } from "./pages/ApplicationDetailPage";
import { EditApplicationPage } from "./pages/EditApplicationPage";
import {
  applicationDetailLoader,
  editApplicationLoader,
} from "./pages/applicationLoaders";
import { NewApplicationPage } from "./pages/NewApplicationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const routes: RouteObject[] = [
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
        loader: applicationDetailLoader,
        Component: ApplicationDetailPage,
      },
      {
        path: "applications/:id/edit",
        loader: editApplicationLoader,
        Component: EditApplicationPage,
      },
      {
        path: "*",
        Component: NotFoundPage,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
