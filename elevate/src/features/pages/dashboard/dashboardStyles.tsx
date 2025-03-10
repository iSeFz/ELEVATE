import { styled, Card, Box, TableCell, SvgIcon} from "@mui/material";

export const StyledCard = styled(Card)(({ theme }) => ({
    flex: 1,
    borderRadius: 20,
    boxShadow: '0px 4px 20px rgba(237, 237, 237, 0.5)',
    marginBottom: theme.spacing(3)
}));
  
export const StatCard = styled(Box)(({ color }) => ({
    width: 170,
    height: 160,
    background: color,
    borderRadius: 16,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
}));

export const StyledTableHeaderCell = styled(TableCell)({
  border: 'none',
  fontWeight: 600,
  fontSize: 10,
  paddingTop: '4px',
  paddingBottom: '4px',
});

export const StyledTableRowCell = styled(TableCell)({
  border: 'none',
  fontWeight: 600,
  fontSize: 12,
  paddingTop: '8px',
  paddingBottom: '8px',
});

export const StyledFlexBox = styled(Box)({
    display: 'flex', 
    gap: '24px',
});

export const ProgressContainer = styled(Box)({
  width: '100%',
  height: 10,
  backgroundColor: '#DBDEE1',
  borderRadius: 2,
  position: 'relative'
});

interface ProgressFillProps {
  progress: number;
}

export const ProgressFill = styled(Box)<ProgressFillProps>(({ progress }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: '#FBBC05',
  borderRadius: 2,
  transition: 'width 1s ease-in-out'
}));

export const StyledSvgIcon = styled(SvgIcon)({
  fontSize: 36
})