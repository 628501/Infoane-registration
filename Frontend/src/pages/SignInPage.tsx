import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/GlobalContext";
import { loginUser } from "../services/UserService";

type FormValues = {
  email: string;
  password: string;
};

const SignInPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const [existError, setExistError] = useState("");
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const { setAuth } = useAuth();

  useEffect(() => {
    if (existError) {
      setExistError("");
    }
  }, [emailValue, passwordValue]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { email, password } = data;
    try {
      const result = await loginUser(email, password);
      setAuth({ authorized: true, name: result.name, email: result.email });
      localStorage.setItem("accessToken", result.accessToken);
      setExistError("");
      reset();
      navigate("/candidate-list");
      toast.success("Sign in Successfully!");
    } catch (err: any) {
      setExistError(err.response?.data?.error || "Login failed!");
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        width: { xs: "90%", sm: "400px", md: "450px" },
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "40px",
        marginTop: "50px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
        mx: "auto",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#333" }}>
        Admin Login
      </Typography>

      <TextField
        sx={{ width: "100%" }}
        id="email"
        type="email"
        label="Email"
        variant="outlined"
        placeholder="Your email"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
            message: "Invalid email format",
          },
        })}
        error={!!errors.email || !!existError}
        helperText={errors.email?.message || existError}
      />

      <TextField
        sx={{ width: "100%" }}
        id="password"
        type={showPassword ? "text" : "password"}
        label="Password"
        variant="outlined"
        placeholder="Your password"
        {...register("password", { required: "Password is required" })}
        error={!!errors.password || !!existError}
        helperText={errors.password?.message || existError}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        sx={{ width: "100%", padding: "12px", fontSize: "16px" }}
        variant="contained"
        color="primary"
        type="submit"
      >
        Sign in
      </Button>
    </Box>
  );
};

export default SignInPage;
