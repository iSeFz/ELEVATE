import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Alert } from "@mui/material";
import { EmailOutlined, RefreshOutlined } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { BlackStyledButton, StyledButton } from "../../../components/StyledButton";
import { resetPassword } from "../../../api/endpoints";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface CheckEmailProps {
  email?: string;
  onResendEmail?: (email: string) => Promise<void>;
}

const CheckEmail: React.FC<CheckEmailProps> = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const url = new URL(window.location.href);
  const email = url.searchParams.get("email") || "";

  const resetPasswordMutation = useMutation({
    mutationFn: (email) => resetPassword({ email: email }),
  });

  useEffect(() => {
    let timeLeft = 30;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        setResendDisabled(false);
        setCountdown(0);
      }
    }, 1000);
  }, []);

  const handleResendEmail = async () => {
    if (resendDisabled) return;

    setIsResending(true);
    try {
      await resetPasswordMutation.mutateAsync(email);
      enqueueSnackbar("Password reset email sent successfully!", {
        variant: "success",
      });
      setResendDisabled(true);

      let timeLeft = 30;
      setCountdown(timeLeft);

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft <= 0) {
          clearInterval(timer);
          setResendDisabled(false);
          setCountdown(0);
        }
      }, 1000);
    } catch (error) {
        enqueueSnackbar(
          "Failed to send password reset email: " + error.message,
          {
            variant: "error",
          }
        );
      console.error("Error resending email:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `4px solid black`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 3,
            }}
          >
            <EmailOutlined
              sx={{
                fontSize: 40,
                color: "black",
              }}
            />
          </Box>

          <Typography
            component="h1"
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Check your email
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4, px: 2 }}
          >
            We've sent a password reset link to{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {email}
            </Typography>
          </Typography>

          <Alert severity="info" sx={{ mb: 4, width: "100%" }}>
            <Typography variant="body2">
              Please check your inbox and click the link to reset your password.
            </Typography>
          </Alert>

          <Box display={"flex"} flexDirection="column" gap={2} width="100%">
            <StyledButton
              fullWidth
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={handleResendEmail}
              disabled={isResending || resendDisabled}
            >
              {isResending
                ? "Resending..."
                : resendDisabled
                  ? `Resend email in ${countdown}s`
                  : "Didn't receive email? Resend"}
            </StyledButton>

            <BlackStyledButton
              fullWidth
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              {isResending ? "Resending..." : "Go Back"}
            </BlackStyledButton>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center" }}
          >
            Make sure to check your spam folder
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default CheckEmail;