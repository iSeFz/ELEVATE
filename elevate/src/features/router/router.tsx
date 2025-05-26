import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router";

import Layout from "../brandOwner/components/layout";
import Dashboard from "../brandOwner/pages/dashboard/dashboard";
import Profile from "../brandOwner/pages/profile/profile";
import Product from "../brandOwner/pages/products/products";
import { Account } from "../brandOwner/pages/settings/pages/account";
import { Subscriptions } from "../brandOwner/pages/settings/pages/subscriptions";
import { Settingslayout } from "../brandOwner/pages/settings/components/settingsLayout";
import LoginPage from "../authentication/pages/login";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("refreshToken") !== null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            path: "",
            element: <Dashboard />,
          },
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "products",
            element: <Product />,
          },
          {
            path: "settings",
            element: <Settingslayout />,
            children: [
              {
                path: "account",
                element: <Account />,
              },
              {
                path: "display",
                element: <Account />,
              },
              {
                path: "security",
                element: <Account />,
              },
              {
                path: "data",
                element: <Account />,
              },
              {
                path: "subscriptions",
                element: <Subscriptions />,
              },
              {
                path: "notifications",
                element: <Account />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
