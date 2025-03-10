import { FC, useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  CardContent,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Grid2,
  Rating
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { StatCard, StyledCard, StyledTableRowCell, StyledTableHeaderCell, StyledFlexBox, ProgressContainer, ProgressFill, StyledSvgIcon} from './dashboardStyles';

const StatsTable = () => (
  <StyledCard>
    <Grid2 container spacing={3}>
      <Grid2 item>
          <CardContent>
            <Typography variant="h6" fontWeight="bold">
              February Sales
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" marginBottom={3}>
              Sales Summary
            </Typography>
            <StyledFlexBox>
              <StatCard color="#DCFCE7">
                <Box>
                  <StyledSvgIcon>
                    <image href="ProductsSold.svg" width="100%" height="100%" />
                  </StyledSvgIcon>
                </Box>
                
                <Typography variant="h6" color="text.primary" fontWeight="bold">460</Typography>
                <Typography color="text.secondary">Products Sold</Typography>
              </StatCard>
              <StatCard color="#FFE2E5">
                <Box>
                  <StyledSvgIcon>
                    <image href="TotalSales.svg" width="100%" height="100%" />
                  </StyledSvgIcon>
                </Box>

                <Typography variant="h6" color="text.primary" fontWeight="bold">65,000 EGP</Typography>
                <Typography color="text.secondary">Total Sales</Typography>
              </StatCard>
              <StatCard color="#DCE0FF">
                <Box>
                  <StyledSvgIcon>
                    <image href="TopProduct.svg" width="100%" height="100%" />
                  </StyledSvgIcon>
                </Box>

                <Typography variant="h6" color="text.primary" fontWeight="bold">Gray Quarter Zip</Typography>
                <Typography color="text.secondary">Top Product</Typography>
              </StatCard>
            </StyledFlexBox>
          </CardContent>
      </Grid2>
    </Grid2>
  </StyledCard>
);

const TopProductsTable = () => (
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


const ProgressBar: FC<{ percentage: number }> = ({ percentage }) => {
    const [progress, setProgress] = useState(0);
  
    useEffect(() => {
      setProgress(percentage);
    }, [percentage]);
  
    return (
      <ProgressContainer>
        <ProgressFill progress={progress}/>
      </ProgressContainer>
    );
  };

const RatingTable = () => (
    <StyledCard>
      <CardContent>
        <Typography variant="h6" marginBottom={2} fontWeight="bold">
          Customer Reviews
        </Typography>

        <StyledFlexBox>
          <Box width='100%'>
            {[1, 2, 3, 4, 5].map((num) => (
              <StyledFlexBox key={num} marginBottom={1}>
              <Typography variant="subtitle2" color="text.secondary"> {num} </Typography>
              <Box flex={1} marginTop='6px'>
                <ProgressBar percentage={num*10}/>
              </Box>
              </StyledFlexBox>
            ))}
          </Box>

          <Box>
            <Typography variant="h3" fontWeight="bold">
              2.34
            </Typography>
            <Rating name="half-rating-read" defaultValue={2.34} precision={0.001} readOnly />
            <Typography variant="subtitle2" color="text.secondary">
              600 reviews
            </Typography>
          </Box>
        </StyledFlexBox>
      </CardContent>
    </StyledCard>
);

const dataset = [
    {
      sales: 35000,
      month: 'January',
    },
    {
      sales: 60000,
      month: 'February',
    },
    {
      sales: 45000,
      month: 'March',
    },
    {
      sales: 50000,
      month: 'April',
    },
    {
      sales: 55000,
      month: 'May',
    },
    {
      sales: 18000,
      month: 'June',
    },
    {
      sales: 53000,
      month: 'July',
    },
    {
      sales: 67000,
      month: 'August',
    },
    {
      sales: 70000,
      month: 'September',
    },
    {
      sales: 56000,
      month: 'October',
    },
    {
      sales: 5000,
      month: 'November',
    },
    {
      sales: 78000,
      month: 'December',
    },
];

const Chart = () => (
  <BarChart
    borderRadius={5}
    dataset={dataset}
    slotProps={{
      legend: {
        direction: 'row',
        position: { vertical: 'top', horizontal: 'right' },
        itemMarkWidth: 15,
        itemMarkHeight: 15,
      },
    }}
    series={[{ 
      dataKey: 'sales',
      label: 'Sales',
      color: '#475BE8',
      valueFormatter: (value) => {
        if (!value) return '0';
        return(`${value/1000}k`);
      }
    }]}
    xAxis={[{
      disableTicks:true,
      disableLine:true,
      scaleType: 'band',
      dataKey: 'month',
      categoryGapRatio: 0.4,
      valueFormatter: (month, context) =>
        context.location === 'tick'
        ? `${month.slice(0, 3)}`
        : `${month}`,
    }]}
    yAxis={[{
      disableTicks:true,
      disableLine:true,
      tickNumber: 5,
      valueFormatter: (value) => {
        if (!value) return '0';
        return(`${value/1000}k`);
      }
    }]}
    grid={{ vertical: false, horizontal: false }}
    sx={{
      ['.MuiChartsLegend-mark']:{
         rx: '50%',
      }
    }}
  />
);

//requires further styling, using more styled components
const SalesChart = () => (
  <StyledCard>
    <CardContent>
      <Typography variant="h7" marginBottom={2} fontWeight="bold">
        Total Sales By Month
      </Typography>
      
      <StyledFlexBox marginBottom={2}>
        <Typography variant="h5" fontWeight="bold">
          65K EGP
        </Typography>
        <Box color="#4CE13F" display='flex' marginTop={0.8}>
          <ArrowUpwardIcon fontSize="small"/>
          <Typography variant="body2">
            5% than last month
          </Typography>
        </Box>
      </StyledFlexBox>

      <Box height='225px'>
        <Chart/>
      </Box>
      </CardContent>
    </StyledCard>
);

//might require edits in the future
const columns: GridColDef[] = [
    { field: 'products', headerName: 'Products', width: 150 },
    { field: 'orderID', headerName: 'Order ID', width: 100 },
    { field: 'date', headerName: 'Date', type:'date', width: 150 },
    {
        field: 'customerName',
        headerName: 'Customer Name',
        width: 200,
        valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
      },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'price', headerName: 'Price', type:"number", width: 150,
        renderCell: (params) => {
            return `${params.value.toLocaleString()} LE`;
        },
    },
    
];

const rows = [
    {id:1, products: "Grey Quarter Zip", orderID:"#11232", date:0, firstName:"Adham", lastName:"Khaled", status:"Delivered", price:800.00},
];

const paginationModel = { page: 0, pageSize: 5 };

//requries styling and using styled components
const OrdersTable = () => (
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

const Dashboard = () => {
  return (
    <Box padding={2}>
      <StyledFlexBox>
        <StatsTable/>
        <TopProductsTable/>
      </StyledFlexBox>

      <StyledFlexBox>
        <RatingTable/>
        <SalesChart/>
      </StyledFlexBox>
      
      <OrdersTable/>
    </Box>
  );
};


export default Dashboard;