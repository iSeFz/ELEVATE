import {
  InputAdornment,
  Typography,
  IconButton,
  Box,
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
import { confirmResetPassword } from "../../../api/endpoints";
import { useNavigate } from "react-router";
import AuthLayout from "../components/Layout";
import { BlackStyledButton } from "../../../components/StyledButton";
import { useParams } from "react-router";

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

const schema = yup.object({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required")
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const ConfirmPassword: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: confirmResetPassword,
    onSuccess: () => {
      localStorage.clear();
      try {
        navigate("/");
        enqueueSnackbar("Password reset successful!", { variant: "success" });
      } catch (error) {
        console.error("Error:", error);
        enqueueSnackbar("An error occurred. Please try again.", {
          variant: "error",
        });
      }
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Invalid password, please try again.",
        {
          variant: "error",
        }
      );
    },
  });

  const onSubmit = (data: ResetPasswordFormInputs) => {
    const oobCode = new URLSearchParams(location.search).get("oobCode");
    mutation.mutate({ newPassword: data.password, oobCode: oobCode || "" });
  };

  return (
    <AuthLayout>
      <Typography variant="h6" fontWeight="bold" mb={2} color="#A51930">
        Reset Password
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <AuthTextInput
              {...field}
              fullWidth
              margin="normal"
              placeholder="Password"
              size="small"
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              helperText={errors.password?.message}
              FormHelperTextProps={{
                style: { backgroundColor: "transparent" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      sx={{ color: "#A51930" }}
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Box display={"flex"} flexDirection="column" gap={2}>
          <Controller
            name="confirmPassword"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <AuthTextInput
                {...field}
                fullWidth
                margin="normal"
                placeholder="Confirm Password"
                size="small"
                type={showConfirmPassword ? "text" : "password"}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
                FormHelperTextProps={{
                  style: { backgroundColor: "transparent" },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setConfirmPassword((prev) => !prev)}
                        edge="end"
                        sx={{ color: "#A51930" }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <BlackStyledButton variant="contained" fullWidth type="submit">
            Reset Password
          </BlackStyledButton>
        </Box>
      </form>
    </AuthLayout>
  );
};

export default ConfirmPassword;
