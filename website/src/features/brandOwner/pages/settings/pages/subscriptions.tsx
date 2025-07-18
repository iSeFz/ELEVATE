import { Box, Typography } from "@mui/material";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../../components/StyledSmallSvgIcon";
import { StyledTextField } from "../../../../../components/StyledTextField";
import { StyledTypography } from "../../../../../components/StyledTypography";
import { useBrand } from "../../../../../hooks/brandHook";

const convertToDate = (timestamp: {
  _seconds: number,
  _nanoseconds: number
}) => {
  if (!timestamp || typeof timestamp._seconds !== "number" || typeof timestamp._nanoseconds !== "number") {
    return "Invalid date";
  }

  const date = new Date(
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
  );

  const parts = date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  return `${parts[1]}/${parts[0]}/${parts[2]}`;
}

export const Subscriptions = () => {
  const {brandData} = useBrand();

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" marginBottom={4}>
        <Typography fontWeight="bold" variant="h5">
          Subscriptions Info
        </Typography>

        {/* <Box display="flex" justifyContent="right">
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
        </Box> */}
      </Box>

      <Box display="flex" justifyContent="space-between" width="60%">
        <Box width={"47%"}>
          <StyledTypography>Current Subscription</StyledTypography>
          <StyledTextField
            disabled
            value={brandData?.subscription.plan}
            fullWidth
          />
        </Box>

        <Box width={"47%"}>
          <StyledTypography>Expires On</StyledTypography>
          <StyledTextField
            disabled
            value={convertToDate(brandData?.subscription.endDate)}
            fullWidth
          />
        </Box>
      </Box>
    </Box>
  );
};
