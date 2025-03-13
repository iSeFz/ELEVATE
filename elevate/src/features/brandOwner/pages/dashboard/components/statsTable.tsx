import { Grid2, CardContent, Typography, Box, styled, SvgIcon } from "@mui/material";

import { StyledCard } from "./styledCard";

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

export const StatsTable = () => (
  <StyledCard>
    <Grid2 container spacing={3}>
      <Grid2 item>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            February Sales
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
                460
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
                65,000 EGP
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

              <Typography variant="h6" color="text.primary" fontWeight="bold">
                Gray Quarter Zip
              </Typography>
              <Typography color="text.secondary">Top Product</Typography>
            </StatCard>
          </Box>
        </CardContent>
      </Grid2>
    </Grid2>
  </StyledCard>
);
