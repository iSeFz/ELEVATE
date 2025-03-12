import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "../brandOwner/layout";
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
      },
    ],
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
