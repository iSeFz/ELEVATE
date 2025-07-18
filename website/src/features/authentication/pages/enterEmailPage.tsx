import {
  Box,
  Button,
  InputAdornment,
  Typography,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthTextInput from "../components/AuthTextInput";
import { useSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, resetPassword } from "../../../api/endpoints";
import { useNavigate } from "react-router";
import AuthLayout from "../components/Layout";
import { BlackStyledButton, StyledButton } from "../../../components/StyledButton";

interface EmailFormInputs {
  email: string;
}

const schema = yup.object({
  email: yup
    .string()
    .email("Email format is incorrect")
    .required("Email is required"),
});

const EnterEmailPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (email) => resetPassword({ email: email }),
    onSuccess: () => {
      enqueueSnackbar("Password reset email sent successfully!", {
        variant: "success",
      });
    },
    onError: (error) => {
      enqueueSnackbar("Failed to send password reset email: " + error.message, {
        variant: "error",
      });
    },
  });

  const onSubmit = (data: EmailFormInputs) => {
    resetPasswordMutation.mutate(data.email);
    navigate("../email-check?email=" + data.email);
  };

  return (
    <AuthLayout>
      <Typography variant="h6" fontWeight="bold" mb={2} color="#A51930">
        Reset Password
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box gap={2} display={"flex"} flexDirection="column">
          <Controller
            name="email"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <AuthTextInput
                {...field}
                fullWidth
                margin="normal"
                placeholder="example@email.com"
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <BlackStyledButton variant="contained" fullWidth type="submit">
            Reset Password
          </BlackStyledButton>

          <StyledButton variant="contained" fullWidth onClick={() => navigate(-1)}>
            Go Back
          </StyledButton>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default EnterEmailPage;
