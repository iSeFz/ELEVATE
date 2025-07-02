import { ArrowUpward } from "@mui/icons-material";
import { CardContent, Typography, Box, Skeleton } from "@mui/material";

import { StyledCard } from "./styledCard";
import { BarChart } from "@mui/x-charts";
import { useDashboardData } from "../../../../../hooks/dashboardHook";

const Chart = ({ dataset }) => {
  if (!dataset || dataset.length === 0) {
    return null;
  }

  return (
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
          dataKey: "totalSales",
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
          dataKey: "monthName",
          categoryGapRatio: 0.4,
          valueFormatter: (monthName, context) =>
            context.location === "tick"
              ? `${monthName.slice(0, 3)}`
              : `${monthName}`,
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
};

export const SalesChart = () => {
  const { stats: StatsData, statsLoading } = useDashboardData();

  if (statsLoading) {
    return (
      <StyledCard>
        <CardContent>
          <Skeleton variant="text" width={180} height={28} sx={{ mb: 2 }} />

          {/* <Box display="flex" gap={3} marginBottom={2}>
            <Skeleton variant="text" width={100} height={40} />

            <Box display="flex" gap={1} alignItems="center">
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          </Box> */}

          <Box height="225px">
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" marginBottom={2} fontWeight="bold">
          Total Sales By Month
        </Typography>

        {/* <Box display="flex" gap={3} marginBottom={2}>
          <Typography variant="h5" fontWeight="bold">
            {StatsData.currentMonthStats.totalSales / 1000}K EGP
          </Typography>
          <Box color="#4CE13F" display="flex" marginTop={0.8}>
            <ArrowUpward fontSize="small" />
            <Typography variant="body2">5% than last month</Typography>
          </Box>
        </Box> */}

        <Box height="225px">
          <Chart dataset={StatsData?.monthsSales?.data} />
        </Box>
      </CardContent>
    </StyledCard>
  );
};
