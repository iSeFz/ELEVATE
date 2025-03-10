import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "../features/layout";
import Dashboard from "../features/pages/dashboard/dashboard";
import Profile from "../features/pages/profile/profile";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout/>,
      children: [
        {
          path: "",
          element: <Dashboard/>,
        },
        {
          path: "profile",
          element: <Profile/>,
        },
      ],
    },
]);

const Router: React.FC = () => {
    return(
        <RouterProvider router={router} />
    );
};


export default Router;