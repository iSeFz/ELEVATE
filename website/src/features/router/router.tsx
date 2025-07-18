import React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router";

import Layout from "../brandOwner/components/layout";
import Dashboard from "../brandOwner/pages/dashboard/dashboard";
import Product from "../brandOwner/pages/products/products";
import { Account } from "../brandOwner/pages/settings/pages/account";
import { Subscriptions } from "../brandOwner/pages/settings/pages/subscriptions";
import { Settingslayout } from "../brandOwner/pages/settings/components/settingsLayout";
import LoginPage from "../authentication/pages/login";
import AddProductPage from "../brandOwner/pages/products/addProductPage";
import EditProductPage from "../brandOwner/pages/products/editProductPage";
import { EditAccount } from "../brandOwner/pages/settings/pages/editAccount";
import Profile from "../brandOwner/pages/profile/profile";
import CheckEmail from "../authentication/pages/checkEmailPage";
import EnterEmailPage from "../authentication/pages/enterEmailPage";
import ConfirmPassword from "../authentication/pages/confirmPassword";
import { OrdersLayout } from "../brandOwner/pages/orders/components/ordersLayout";
import Orders from "../brandOwner/pages/orders/pages/orders";
import Refunds from "../brandOwner/pages/orders/pages/refunds";

// Define user roles
type UserRole = "brandOwner" | "brandManager";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("refreshToken") !== null;
  const userRole = localStorage.getItem("userRole") as UserRole;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/orders/orders" replace />;
  }

  return <Outlet />;
};

const BrandOwnerRoute = () => {
  return <ProtectedRoute allowedRoles={["brandOwner"]} />;
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
            element: <BrandOwnerRoute />,
            children: [
              {
                path: "",
                element: <Dashboard />,
              },
            ],
          },
          {
            path: "profile",
            element: <BrandOwnerRoute />,
            children: [
              {
                path: "",
                element: <Profile isEditMode={false} />,
              },
              {
                path: "edit",
                element: <Profile isEditMode={true} />,
              },
            ],
          },
          {
            path: "products",
            children: [
              {
                path: "",
                element: <Product />,
              },
              {
                path: "add",
                element: <AddProductPage />,
              },
              {
                path: "edit/:id",
                element: <EditProductPage />,
              },
            ],
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
          {
            path: "orders",
            element: <OrdersLayout />,
            children: [
              {
                path: "orders",
                element: <Orders />,
              },
              {
                path: "refunds",
                element: <Refunds />,
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
  {
    path: "reset-password",
    element: <EnterEmailPage />,
  },
  {
    path: "email-check",
    element: <CheckEmail />,
  },
  {
    path: "confirm-password",
    element: <ConfirmPassword />,
  },
]);

const Router: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Router;
