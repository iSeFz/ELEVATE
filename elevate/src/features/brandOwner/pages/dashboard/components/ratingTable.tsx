import { CardContent, Typography, Box, Rating, styled } from "@mui/material";
import { FC, useState, useEffect } from "react";

import { StyledCard } from "./styledCard";

const ProgressContainer = styled(Box)({
  width: "100%",
  height: 10,
  backgroundColor: "#DBDEE1",
  borderRadius: 2,
  position: "relative",
});

interface ProgressFillProps {
  progress: number;
}

const ProgressFill = styled(Box)<ProgressFillProps>(({ progress }) => ({
  width: `${progress}%`,
  height: "100%",
  backgroundColor: "#FBBC05",
  borderRadius: 2,
  transition: "width 1s ease-in-out",
}));

const ProgressBar: FC<{ percentage: number }> = ({ percentage }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  return (
    <ProgressContainer>
      <ProgressFill progress={progress} />
    </ProgressContainer>
  );
};

export const RatingTable = () => (
  <StyledCard>
    <CardContent>
      <Typography variant="h6" marginBottom={2} fontWeight="bold">
        Customer Reviews
      </Typography>

      <Box display="flex" gap={3}>
        <Box width="100%">
          {[1, 2, 3, 4, 5].map((num) => (
            <Box display="flex" gap={3} key={num} marginBottom={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {" "}
                {num}{" "}
              </Typography>
              <Box flex={1} marginTop="6px">
                <ProgressBar percentage={num * 10} />
              </Box>
            </Box>
          ))}
        </Box>

        <Box>
          <Typography variant="h3" fontWeight="bold">
            2.34
          </Typography>
          <Rating
            name="half-rating-read"
            defaultValue={2.34}
            precision={0.001}
            readOnly
          />
          <Typography variant="subtitle2" color="text.secondary">
            600 reviews
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </StyledCard>
);
