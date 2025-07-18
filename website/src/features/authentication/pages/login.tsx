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
import { loginRequest } from "../../../api/endpoints";
import { Link, useNavigate } from "react-router";
import AuthLayout from "../components/Layout";
import { BlackStyledButton } from "../../../components/StyledButton";

interface LoginFormInputs {
  email: string;
  password: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  user: {
    role: string;
  };
}

const schema = yup.object({
  email: yup
    .string()
    .email("Email format is incorrect")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: Tokens) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", data.user.role);

      try {
        navigate("/");
        enqueueSnackbar("Login successful!", { variant: "success" });
      } catch (error) {
        console.error("Error decoding token:", error);
        enqueueSnackbar("An error occurred. Please try again.", {
          variant: "error",
        });
      }
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || "Invalid username or password",
        {
          variant: "error",
        }
      );
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <AuthLayout>
      <Typography variant="h6" fontWeight="bold" mb={2} color="#A51930">
        Sign in
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Button
          variant="text"
          size="small"
          sx={{
            display: "block",
            ml: "auto",
            mt: 1,
            mb: 2,
            color: "#A51930",
            fontSize: "0.75rem",
            textTransform: "none",
            p: 0,
            minWidth: "auto"
          }}
          onClick={() => navigate("/reset-password")}
        >
          Forgot password?
        </Button>
        <BlackStyledButton variant="contained" fullWidth type="submit">
          Login
        </BlackStyledButton>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
