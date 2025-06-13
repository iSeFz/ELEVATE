import { Box, Typography, Card } from "@mui/material";
import {
  BlackStyledButton,
  StyledButton,
} from "../../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../../components/StyledSmallSvgIcon";
import { StyledTypography } from "../../../../../components/StyledTypography";
import { StyledTextField } from "../../../../../components/StyledTextField";
import { useUser } from "../../../../../hooks/userHook";
import { useNavigate } from "react-router";

export const Account = () => {
  const { userData } = useUser();
  const navigate = useNavigate();

  return (
    <Box width="100%">
      <Box display="flex" justifyContent="space-between" marginBottom={4}>
        <Typography fontWeight="bold" variant="h5">
          Account Info
        </Typography>

        <Box display="flex" justifyContent="right">
          <Box display="flex" gap={2}>
            <StyledButton variant="outlined" onClick={() => navigate("/settings/account/edit")}>
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
              <StyledTextField disabled value={userData?.firstName} fullWidth />
            </Box>

            <Box width={"47%"}>
              <StyledTypography>Last Name</StyledTypography>
              <StyledTextField disabled value={userData?.lastName} fullWidth />
            </Box>
          </Box>

          <Box>
            <StyledTypography>Username</StyledTypography>
            <StyledTextField disabled value={userData?.username} fullWidth />
          </Box>

          <Box>
            <StyledTypography>Email</StyledTypography>
            <StyledTextField disabled value={userData?.email} fullWidth />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
            Profile Picture
          </Typography>
          <Card padding={2}>
            <img
              src={userData?.imageURL || "/images/userImage.jpg"}
              alt="Profile Picture"
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "400px",
                maxHeight: "400px",
                objectFit: "cover", // This ensures the image maintains aspect ratio
              }}
              onError={(e) => {
                e.currentTarget.src = "/images/userImage.jpg";
              }}
            />
          </Card>
        </Box>
      </Box>
    </Box>
  );
};
