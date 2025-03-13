import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import Layout from "../brandOwner/components/layout";
import Dashboard from "../brandOwner/pages/dashboard/dashboard";
import Profile from "../brandOwner/pages/profile/profile";
import Product from "../brandOwner/pages/products/products";

const router = createBrowserRouter([
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
        element: <Profile />,
        children: [
          {
            path: "account",
            element: <Dashboard />,
          },
          {
            path: "display",
            element: <Profile />,
          },
          {
            path: "security",
            element: <Product />,
          },
          {
            path: "data",
            element: <Dashboard />,
          },
          {
            path: "subscriptions",
            element: <Profile />,
          },
          {
            path: "notifications",
            element: <Product />,
          },
        ],
      },
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
