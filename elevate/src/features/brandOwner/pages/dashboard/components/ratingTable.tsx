import { CardContent, Typography, Box, Rating, styled } from "@mui/material";
import { FC, memo, useState, useEffect, useRef } from "react";
import { StyledCard } from "./styledCard";
import { useDashboardData } from "../../../../../hooks/dashboardHook";

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

const ProgressBar: FC<{ percentage: number; delay: number }> = memo(
  ({ percentage, delay }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
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


export interface ReviewData {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const RatingTable = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const { reviews } = useDashboardData();

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
            {reviews &&
              Object.entries(reviews.ratingDistribution)
                .map(([stars, count], index) => {
                  const total = reviews.totalReviews 
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <Box display="flex" gap={3} key={stars} marginBottom={1}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {stars}
                      </Typography>
                      <Box flex={1} marginTop="6px">
                        <ProgressBar
                          percentage={isVisible ? percentage : 0}
                          delay={index * 100}
                        />
                      </Box>
                    </Box>
                  );
                })}
          </Box>

          <Box>
            <Typography variant="h3" fontWeight="bold">
              {reviews?.averageRating}
            </Typography>
            <Rating
              name="half-rating-read"
              value={reviews?.averageRating}
              precision={0.01}
              readOnly
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary">
              {reviews?.totalReviews} reviews
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
});

RatingTable.displayName = "RatingTable";
