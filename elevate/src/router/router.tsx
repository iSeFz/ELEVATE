import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import Layout from "../features/layout";
import Dashboard from "../features/pages/dashboard/dashboard";

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
          path: "orders",
          element: <h1>Orders Page</h1>,
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