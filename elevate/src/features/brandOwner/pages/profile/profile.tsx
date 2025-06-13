import { Box, Card, Typography } from "@mui/material";

import { StyledSvgIcon } from "./StyledSvgIcon";
import { StyledButton } from "../../../../components/StyledButton";
import { StyledSmallSvgIcon } from "../../../../components/StyledSmallSvgIcon";
import { StyledTextField } from "../../../../components/StyledTextField";
import { StyledTypography } from "../../../../components/StyledTypography";
import { StlyedChip } from "../../../../components/StyledChip";
import { useBrand } from "../../../../hooks/brandHook";
import { useUser } from "../../../../hooks/userHook";

interface Address {
  building: number;
  city: string;
  postalCode: number;
  street: string;
  latitiude: number;
  longitude: number;
}

const formatAddress = (address: Address): string => {
  return `${address.building} ${address.street}, ${address.city} ${address.postalCode}`;
};

const Profile = () => {
  const { brandData } = useBrand();
  const { userData } = useUser();

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
            <StyledTextField disabled value={brandData?.brandName} fullWidth />
          </Box>

          <Box>
            <StyledTypography>Brand Email</StyledTypography>
            <StyledTextField disabled value={userData?.email} fullWidth />
          </Box>

          <Box>
            <StyledTypography>Industry</StyledTypography>
            <Box
              padding={2}
              border="1px solid #000000"
              borderRadius={2}
              height={110}
            >
              <StlyedChip label={brandData?.industry} />
            </Box>
          </Box>

          <Box>
            <StyledTypography>Addresses</StyledTypography>
            <Box display="flex" flexDirection="column" gap={2}>
              {brandData?.addresses?.map((address: Address, index: number) => (
                <Box key={index} display="flex" alignItems="center" gap={1}>
                  <StyledSvgIcon>
                    <image
                      href="/icons/Location.svg"
                      width="100%"
                      height="100%"
                    />
                  </StyledSvgIcon>
                  <Typography>{formatAddress(address)}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <StyledTypography>Websites</StyledTypography>
            <Box display="flex" flexDirection="column" gap={1}>
              {brandData?.websites
                ?.filter(
                  (website: { type: string; url: string }) =>
                    website.type === "web"
                )
                .map(
                  (website: { type: string; url: string }, index: number) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <StyledSvgIcon>
                        <image
                          href="/icons/Website.svg"
                          width="100%"
                          height="100%"
                        />
                      </StyledSvgIcon>
                      <Typography>{website.url}</Typography>
                    </Box>
                  )
                )}
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
                src={brandData?.imageURL || "/images/userImage.jpg"}
                alt="Brand Logo"
                style={{ maxWidth: "400px", maxHeight: "400px" }}
                onError={(e) => {
                  e.currentTarget.src = "/images/userImage.jpg";
                }}
              />
            </Card>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Contacts
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {brandData?.phoneNumbers?.map(
                (contact: string, index: number) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <StyledSvgIcon>
                      <image
                        href="/icons/Contact.svg"
                        width="100%"
                        height="100%"
                      />
                    </StyledSvgIcon>
                    <Typography>{contact}</Typography>
                  </Box>
                )
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" marginBottom={1} fontWeight="bold">
              Socials
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {brandData?.websites
                ?.filter(
                  (website: { type: string; url: string }) =>
                    website.type !== "web"
                )
                .map(
                  (website: { type: string; url: string }, index: number) => (
                    <Box key={index} display="flex" alignItems="center" gap={1}>
                      <StyledSvgIcon>
                        {website.type == "instagram" && (
                          <image
                            href="/icons/Instagram.svg"
                            width="100%"
                            height="100%"
                          />
                        )}
                        {website.type == "x" && (
                          <image
                            href="/icons/x.svg"
                            width="100%"
                            height="100%"
                          />
                        )}
                        {website.type == "facebook" && (
                          <image
                            href="/icons/Facebook.svg"
                            width="100%"
                            height="100%"
                          />
                        )}
                      </StyledSvgIcon>
                      <Typography>{website.url}</Typography>
                    </Box>
                  )
                )}
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
          value={brandData?.storyDescription || "No story provided."}
        />
      </Box>
    </Box>
  );
};

export default Profile;
