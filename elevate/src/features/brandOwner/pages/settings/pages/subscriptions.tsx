import { Box, Typography } from "@mui/material";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../../components/StyledSmallSvgIcon";
import { StyledTextField } from "../../../../../components/StyledTextField";
import { StyledTypography } from "../../../../../components/StyledTypography";
import { useUser } from "../../../../../context/userContext";

export const Subscriptions = () => {
  const { userData } = useUser();
  
  return (
    <Box width="100%">
      <Box display="flex" justifyContent='space-between' marginBottom={4}>
        <Typography fontWeight="bold" variant="h5">
          Subscriptions Info
        </Typography>

        <Box display="flex" justifyContent="right">
          <Box display="flex" gap={2}>
            <StyledButton variant="outlined">
              <StyledSmallSvgIcon>
                <image href="/icons/Edit.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp; Change Plan
            </StyledButton>

            <BlackStyledButton variant="outlined">
              <StyledSmallSvgIcon>
                <image href="/icons/WhiteEdit.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp; Billing History
            </BlackStyledButton>
          </Box>
        </Box>
      </Box>

      <Box display="flex" justifyContent="space-between" width="60%">
        <Box width={"47%"}>
          <StyledTypography>Current Subscription</StyledTypography>
          <StyledTextField disabled value="Gold Package" fullWidth />
        </Box>

        <Box width={"47%"}>
          <StyledTypography>Expires On</StyledTypography>
          <StyledTextField disabled value="1/1/2026" fullWidth />
        </Box>
      </Box>
    </Box>
  );
};
