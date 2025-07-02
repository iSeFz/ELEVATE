import {
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableBody,
  styled,
  TableCell,
  Skeleton,
  Typography,
  Box,
} from "@mui/material";

import { StyledCard } from "./styledCard";
import { useDashboardData } from "../../../../../hooks/dashboardHook";

const StyledTableHeaderCell = styled(TableCell)({
  border: "none",
  fontWeight: 600,
  fontSize: 10,
  paddingTop: "4px",
  paddingBottom: "4px",
});

const StyledTableRowCell = styled(TableCell)({
  border: "none",
  fontWeight: 600,
  fontSize: 12,
  paddingTop: "8px",
  paddingBottom: "8px",
});

export const TopProductsTable = () => {
  const { stats: StatsData, statsLoading } = useDashboardData();

  if (statsLoading) {
    return (
      <StyledCard>
        <CardContent>
          <Skeleton variant="text" width={200} height={42} />
          <Table>
            <TableHead>
              <TableRow>
                <Box display="flex" justifyContent="space-between" width="100%" ml={2}>
                  <Skeleton variant="text" width={120} height={22} />
                  <Skeleton variant="text" width={120} height={22} />
                  <Skeleton variant="text" width={120} height={22} />
                </Box>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <StyledTableRowCell>
                    <Skeleton
                      variant="text"
                      width="80%"
                      height={20}
                      animation="wave"
                      sx={{ animationDelay: `${index * 0.1}s` }}
                    />
                  </StyledTableRowCell>
                  <StyledTableRowCell>
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={20}
                      animation="wave"
                      sx={{ animationDelay: `${index * 0.1}s` }}
                    />
                  </StyledTableRowCell>
                  <StyledTableRowCell>
                    <Skeleton
                      variant="text"
                      width="70%"
                      height={20}
                      animation="wave"
                      sx={{ animationDelay: `${index * 0.1}s` }}
                    />
                  </StyledTableRowCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" marginBottom={2} fontWeight="bold">
          Top Products
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Product</StyledTableHeaderCell>
              <StyledTableHeaderCell>Quantity Sold</StyledTableHeaderCell>
              <StyledTableHeaderCell>Sales</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {StatsData?.currentMonthStats?.topProductsSales?.length > 0 ? (
              StatsData.currentMonthStats.topProductsSales.map((product) => (
                <TableRow key={product.productName}>
                  <StyledTableRowCell>{product.productName}</StyledTableRowCell>
                  <StyledTableRowCell>
                    {product.quantitySold}
                  </StyledTableRowCell>
                  <StyledTableRowCell>{product.totalSales}</StyledTableRowCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableRowCell colSpan={3} align="center">
                  No data available
                </StyledTableRowCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </StyledCard>
  );
};
