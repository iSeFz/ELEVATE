import { CardContent, Table, TableHead, TableRow, TableBody, styled, TableCell } from "@mui/material";

import { StyledCard } from "./styledCard";
import { useQuery } from "@tanstack/react-query";
import { getBrandStats } from "../../../../../api/endpoints";

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
  const {
    data: StatsData,
    isLoading,
    error,
  } = useQuery({ queryKey: ["stats"], queryFn: getBrandStats });


  return (
    <StyledCard>
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableHeaderCell>Top Products</StyledTableHeaderCell>
              <StyledTableHeaderCell>Quantity Sold</StyledTableHeaderCell>
              <StyledTableHeaderCell>Sales</StyledTableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {StatsData?.topProductsSales.map((product) => (
              <TableRow key={product.productName}>
                <StyledTableRowCell>{product.productName}</StyledTableRowCell>
                <StyledTableRowCell>{product.quantitySold}</StyledTableRowCell>
                <StyledTableRowCell>{product.totalSales}</StyledTableRowCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </StyledCard>
  );
};