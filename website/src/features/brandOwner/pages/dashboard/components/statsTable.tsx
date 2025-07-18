import {
  Grid2,
  CardContent,
  Typography,
  Box,
  styled,
  SvgIcon,
  Skeleton,
} from "@mui/material";

import { StyledCard } from "./styledCard";
import { useDashboardData } from "../../../../../hooks/dashboardHook";
import { capitalizeProductName } from "../../../../../services/convertProduct";

const StyledSvgIcon = styled(SvgIcon)({
  fontSize: 36,
});

const StatCard = styled(Box)(({ color }) => ({
  width: 170,
  height: 160,
  background: color,
  borderRadius: 16,
  padding: 20,
  display: "flex",
  flexDirection: "column",
}));

export const StatsTable = () => {
  const { stats: StatsData, statsLoading } = useDashboardData();

  if (statsLoading) {
    return (
      <StyledCard>
        <Grid2 container spacing={3}>
          <Grid2 item>
            <CardContent>
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="text" width={120} height={20} sx={{ mb: 3 }} />

              <Box display="flex" gap={3}>
                {[1, 2, 3].map((item) => (
                  <StatCard key={item} color="#f5f5f5">
                    <Skeleton
                      variant="circular"
                      width={36}
                      height={36}
                      sx={{ mb: 2 }}
                    />
                    <Skeleton variant="text" width={80} height={32} />
                    <Skeleton variant="text" width={100} height={20} />
                  </StatCard>
                ))}
              </Box>
            </CardContent>
          </Grid2>
        </Grid2>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <Grid2 container spacing={3}>
        <Grid2 item>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              {new Date().toLocaleString("en-US", { month: "long" }) || 0} Sales
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              marginBottom={3}
            >
              Sales Summary
            </Typography>
            <Box display="flex" gap={3}>
              <StatCard color="#DCFCE7">
                <Box>
                  <StyledSvgIcon>
                    <image
                      href="/icons/ProductsSold.svg"
                      width="100%"
                      height="100%"
                    />
                  </StyledSvgIcon>
                </Box>

                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  {StatsData?.currentMonthStats?.totalProductsSold || 0}
                </Typography>
                <Typography color="text.secondary">Products Sold</Typography>
              </StatCard>
              <StatCard color="#FFE2E5">
                <Box>
                  <StyledSvgIcon>
                    <image
                      href="/icons/TotalSales.svg"
                      width="100%"
                      height="100%"
                    />
                  </StyledSvgIcon>
                </Box>

                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  {StatsData?.currentMonthStats?.totalSales || 0} EGP
                </Typography>
                <Typography color="text.secondary">Total Sales</Typography>
              </StatCard>
              <StatCard color="#DCE0FF">
                <Box>
                  <StyledSvgIcon>
                    <image
                      href="/icons/TopProduct.svg"
                      width="100%"
                      height="100%"
                    />
                  </StyledSvgIcon>
                </Box>

                <Typography color="text.primary" fontWeight="bold">
                  {capitalizeProductName(StatsData?.currentMonthStats?.topProduct
                    ?.productName) || "N/A"}
                </Typography>
                <Typography color="text.secondary">Top Product</Typography>
              </StatCard>
            </Box>
          </CardContent>
        </Grid2>
      </Grid2>
    </StyledCard>
  );
};
