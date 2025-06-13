import {
  Box,
} from "@mui/material";

import { StatsTable } from "./components/statsTable";
import { TopProductsTable } from "./components/topProductsTable";
import { RatingTable } from "./components/ratingTable";
import { SalesChart } from "./components/salesChart";
import { OrdersTable } from "./components/ordersTable";

const Dashboard = () => {
  return (
    <Box padding={2}>
      <Box display="flex" gap={3}>
        <StatsTable />
        <TopProductsTable />
      </Box>

      <Box display="flex" gap={3}>
        <RatingTable />
        <SalesChart />
      </Box>

      <OrdersTable />
    </Box>
  );
};

export default Dashboard;
