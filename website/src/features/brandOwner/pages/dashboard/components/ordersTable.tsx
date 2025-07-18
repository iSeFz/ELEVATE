import { GridColDef, DataGrid } from "@mui/x-data-grid";

import { StyledCard } from "./styledCard";

//might require edits in the future
const columns: GridColDef[] = [
  { field: "products", headerName: "Products", width: 150 },
  { field: "orderID", headerName: "Order ID", width: 100 },
  { field: "date", headerName: "Date", type: "date", width: 150 },
  {
    field: "customerName",
    headerName: "Customer Name",
    width: 200,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
  { field: "status", headerName: "Status", width: 150 },
  {
    field: "price",
    headerName: "Price",
    type: "number",
    width: 150,
    renderCell: (params) => {
      return `${params.value.toLocaleString()} LE`;
    },
  },
];

const rows = [
  {
    id: 1,
    products: "Grey Quarter Zip",
    orderID: "#11232",
    date: 0,
    firstName: "Adham",
    lastName: "Khaled",
    status: "Delivered",
    price: 800.0,
  },
];

const paginationModel = { page: 0, pageSize: 5 };

//requries styling and using styled components
export const OrdersTable = () => (
  <StyledCard>
    <DataGrid
      rowSelection={false}
      rows={rows}
      columns={columns}
      initialState={{ pagination: { paginationModel } }}
      sx={{ border: 0 }}
    />
  </StyledCard>
);
