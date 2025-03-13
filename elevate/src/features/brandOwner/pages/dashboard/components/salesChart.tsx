import { ArrowUpward } from "@mui/icons-material";
import { CardContent, Typography, Box } from "@mui/material";

import { StyledCard } from "./styledCard";
import { BarChart } from "@mui/x-charts";

const dataset = [
  {
    sales: 35000,
    month: "January",
  },
  {
    sales: 60000,
    month: "February",
  },
  {
    sales: 45000,
    month: "March",
  },
  {
    sales: 50000,
    month: "April",
  },
  {
    sales: 55000,
    month: "May",
  },
  {
    sales: 18000,
    month: "June",
  },
  {
    sales: 53000,
    month: "July",
  },
  {
    sales: 67000,
    month: "August",
  },
  {
    sales: 70000,
    month: "September",
  },
  {
    sales: 56000,
    month: "October",
  },
  {
    sales: 5000,
    month: "November",
  },
  {
    sales: 78000,
    month: "December",
  },
];

const Chart = () => (
  <BarChart
    borderRadius={5}
    dataset={dataset}
    slotProps={{
      legend: {
        direction: "row",
        position: { vertical: "top", horizontal: "right" },
        itemMarkWidth: 15,
        itemMarkHeight: 15,
      },
    }}
    series={[
      {
        dataKey: "sales",
        label: "Sales",
        color: "#475BE8",
        valueFormatter: (value) => {
          if (!value) return "0";
          return `${value / 1000}k`;
        },
      },
    ]}
    xAxis={[
      {
        disableTicks: true,
        disableLine: true,
        scaleType: "band",
        dataKey: "month",
        categoryGapRatio: 0.4,
        valueFormatter: (month, context) =>
          context.location === "tick" ? `${month.slice(0, 3)}` : `${month}`,
      },
    ]}
    yAxis={[
      {
        disableTicks: true,
        disableLine: true,
        tickNumber: 5,
        valueFormatter: (value) => {
          if (!value) return "0";
          return `${value / 1000}k`;
        },
      },
    ]}
    grid={{ vertical: false, horizontal: false }}
    sx={{
      [".MuiChartsLegend-mark"]: {
        rx: "50%",
      },
    }}
  />
);

export const SalesChart = () => (
  <StyledCard>
    <CardContent>
      <Typography variant="h7" marginBottom={2} fontWeight="bold">
        Total Sales By Month
      </Typography>

      <Box display="flex" gap={3} marginBottom={2}>
        <Typography variant="h5" fontWeight="bold">
          65K EGP
        </Typography>
        <Box color="#4CE13F" display="flex" marginTop={0.8}>
          <ArrowUpward fontSize="small" />
          <Typography variant="body2">5% than last month</Typography>
        </Box>
      </Box>

      <Box height="225px">
        <Chart />
      </Box>
    </CardContent>
  </StyledCard>
);
