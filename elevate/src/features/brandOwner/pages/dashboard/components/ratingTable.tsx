import { CardContent, Typography, Box, Rating, styled } from "@mui/material";
import { FC, memo, useState, useEffect, useRef } from "react";
import { StyledCard } from "./styledCard";

// Styled components outside component to prevent recreation
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

// Memoized ProgressBar
const ProgressBar: FC<{ percentage: number; delay: number }> = memo(
  ({ percentage, delay }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      // Add delay for staggered animation effect
      const timer = setTimeout(() => {
        setProgress(percentage);
      }, delay);

      return () => clearTimeout(timer);
    }, [percentage, delay]);

    return (
      <ProgressContainer>
        <ProgressFill progress={progress} />
      </ProgressContainer>
    );
  }
);

// Pre-define rating data
const RATING_DATA = [
  { stars: 5, percentage: 50 },
  { stars: 4, percentage: 40 },
  { stars: 3, percentage: 30 },
  { stars: 2, percentage: 20 },
  { stars: 1, percentage: 10 },
];

export const RatingTable = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Trigger animation when component is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (componentRef.current) {
      observer.observe(componentRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <StyledCard ref={componentRef}>
      <CardContent>
        <Typography variant="h6" marginBottom={2} fontWeight="bold">
          Customer Reviews
        </Typography>

        <Box display="flex" gap={3}>
          <Box width="100%">
            {RATING_DATA.map(({ stars, percentage }, index) => (
              <Box display="flex" gap={3} key={stars} marginBottom={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {stars}
                </Typography>
                <Box flex={1} marginTop="6px">
                  <ProgressBar
                    percentage={isVisible ? percentage : 0}
                    delay={index * 100} // Staggered animation
                  />
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
              value={2.34}
              precision={0.01}
              readOnly
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              600 reviews
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
});

RatingTable.displayName = "RatingTable";
