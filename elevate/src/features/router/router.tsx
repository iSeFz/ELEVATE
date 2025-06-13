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
import AddProductPage from "../brandOwner/pages/products/addProductPage";
import EditProductPage from "../brandOwner/pages/products/editProductPage";
import { EditAccount } from "../brandOwner/pages/settings/pages/editAccount";

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
            path: "/products/add",
            element: <AddProductPage />,
          },
          {
            path: "/products/edit/:id",
            element: <EditProductPage />,
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
                path: "account/edit",
                element: <EditAccount />,
              },
              {
                path: "subscriptions",
                element: <Subscriptions />,
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
