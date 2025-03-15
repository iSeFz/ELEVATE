import { Box, Typography, Card } from "@mui/material";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../../components/StyledSmallSvgIcon";
import { StyledTypography } from "../../../../../components/StyledTypography";
import { StyledTextField } from "../../../../../components/StyledTextField";

export const Account = () => {
  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" marginBottom={4}>
        <Typography fontWeight="bold" variant="h5">
          Account Info
        </Typography>

        <Box display="flex" justifyContent="right">
          <Box display="flex" gap={2}>
            <StyledButton variant="outlined">
              <StyledSmallSvgIcon>
                <image href="/icons/Edit.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp; Edit
            </StyledButton>

            <BlackStyledButton variant="outlined">
              <StyledSmallSvgIcon>
                <image href="/icons/WhiteEdit.svg" width="100%" height="100%" />
              </StyledSmallSvgIcon>
              &nbsp; Change Password
            </BlackStyledButton>
          </Box>
        </Box>
      </Box>

      <Box display="flex" gap={8} marginTop={3} width="100%">
        <Box display="flex" flexDirection="column" gap={3} width="60%">
          <Box display="flex" justifyContent="space-between">
            <Box width={"47%"}>
              <StyledTypography>First Name</StyledTypography>
              <StyledTextField disabled value="Shawky" fullWidth />
            </Box>

            <Box width={"47%"}>
              <StyledTypography>Last Name</StyledTypography>
              <StyledTextField disabled value="Ibrahim" fullWidth />
            </Box>
          </Box>

          <Box>
            <StyledTypography>Username</StyledTypography>
            <StyledTextField disabled value="shawkyebrahim.cloud" fullWidth />
          </Box>

          <Box>
            <StyledTypography>Email</StyledTypography>
            <StyledTextField
              disabled
              value="shawkyebrahim.cloud@gmail.com"
              fullWidth
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
            Profile Picture
          </Typography>
          <Card padding={2} maxWidth={300}>
            <img
              src="/images/ProfilePicture.png"
              alt="Profile Picture"
              style={{ width: "100%", height: "auto" }}
            />
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
