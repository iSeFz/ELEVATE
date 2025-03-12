import { Box, Card, Typography } from "@mui/material";

import {
  StlyedChip,
  StyledSvgIcon,
  StyledTextField,
  StyledTypography,
} from "./profileStyles";
import { StyledButton } from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";

//might need some clean up perhaps seperate into multiple components (do that when doing the edit part)
const Profile = () => {
  return (
    <Box padding={2} marginLeft={2}>
      <Box display="flex" justifyContent="right" marginRight={8}>
        <Box display="flex">
          <StyledButton variant="outlined">
            <StyledSmallSvgIcon>
              <image href="/icons/Edit.svg" width="100%" height="100%" />
            </StyledSmallSvgIcon>
            &nbsp; Edit
          </StyledButton>
        </Box>
      </Box>

      <Box display="flex" gap={8}>
        <Box display="flex" flexDirection="column" gap={3} width={500}>
          <Box>
            <StyledTypography>Brand Name</StyledTypography>
            <StyledTextField disabled value="CLOUD" />
          </Box>

          <Box>
            <StyledTypography>Brand Email</StyledTypography>
            <StyledTextField disabled value="cloudclothing@gmail.com" />
          </Box>

          <Box>
            <StyledTypography>Industry</StyledTypography>
            <Box
              padding={2}
              border="1px solid #000000"
              borderRadius={2}
              height={110}
            >
              <StlyedChip label="Clothing" />
            </Box>
          </Box>

          <Box>
            <StyledTypography>Addresses</StyledTypography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <StyledSvgIcon>
                  <image
                    href="/icons/Location.svg"
                    width="100%"
                    height="100%"
                  />
                </StyledSvgIcon>
                <Typography>City Centre Almaza, Cairo</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <StyledSvgIcon>
                  <image
                    href="/icons/Location.svg"
                    width="100%"
                    height="100%"
                  />
                </StyledSvgIcon>
                <Typography>Golf City Mall, Cairo</Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Websites
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <StyledSvgIcon>
                <image href="/icons/Website.svg" width="100%" height="100%" />
              </StyledSvgIcon>
              <Typography>cloud-clothing.co</Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Box>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Brand Logo
            </Typography>
            <Card padding={2} maxWidth={300}>
              <img
                src="/images/BrandLogo.png"
                alt="Brand Logo"
                style={{ width: "100%", height: "auto" }}
              />
            </Card>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Contacts
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StyledSvgIcon>
                  <image href="/icons/Contact.svg" width="100%" height="100%" />
                </StyledSvgIcon>
                <Typography>01012345678</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StyledSvgIcon>
                  <image href="/icons/Contact.svg" width="100%" height="100%" />
                </StyledSvgIcon>
                <Typography>01087654321</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Socials
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StyledSvgIcon>
                <image href="/icons/Instagram.svg" width="100%" height="100%" />
              </StyledSvgIcon>
              <Typography>@cloudclothing_co</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box width="95%" marginTop={2}>
        <StyledTypography
          variant="subtitle1"
          marginBottom={1}
          fontWeight="bold"
        >
          Brand Story
        </StyledTypography>
        <StyledTextField
          fullWidth
          multiline
          rows={4}
          disabled
          value="We value the importance of affordability, and that's why we are focusing on creating timeless, high quality basics and wardrobe essentials that will help you embrace your personal style without compromising on quality and fit."
        />
      </Box>
    </Box>
  );
};

export default Profile;
