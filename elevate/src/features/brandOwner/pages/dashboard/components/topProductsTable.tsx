import { CardContent, Table, TableHead, TableRow, TableBody, styled, TableCell } from "@mui/material";

import { StyledCard } from "./styledCard";

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


export const TopProductsTable = () => (
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
          <TableRow>
            <StyledTableRowCell>Gray Quarter Zip</StyledTableRowCell>
            <StyledTableRowCell>200</StyledTableRowCell>
            <StyledTableRowCell>25K</StyledTableRowCell>
          </TableRow>
          <TableRow>
            <StyledTableRowCell>Black Quarter Zip</StyledTableRowCell>
            <StyledTableRowCell>150</StyledTableRowCell>
            <StyledTableRowCell>20K</StyledTableRowCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </StyledCard>
);