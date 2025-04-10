import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Avatar,
  MenuItem,
  Button,
} from "@mui/material";
import logo from "../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { clearUser, logout } from "../slices/userSlice";
import { useLocation, useNavigate } from "react-router-dom";

const stringToColor = (string: string) => {
  if (!string) return "#757575";
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).slice(-2);
  }
  return color;
};

function Navbar() {
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const avatarInitial = user.name ? user.name.charAt(0).toUpperCase() : "";
  const avatarColor = user.name ? stringToColor(user.name) : "";
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleLogout = () => {
    dispatch(logout(user.email!));
    dispatch(clearUser());
  };

  const handleCloseMenu = () => {
    setAnchorElUser(null);
  };

  const handleUserLogout = () => {
    handleCloseMenu();
    handleLogout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingX: "1.3rem",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <img src={logo} height="40px" alt="Logo" />
        </Box>
        <Box sx={{ flexGrow: 0 }}>
          {user.isLoggedIn && user.isAuthenticated ? (
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar sx={{ backgroundColor: avatarColor }}>
                {avatarInitial}
              </Avatar>
            </IconButton>
          ) : location.pathname === "/" ||
            location.pathname === "/candidate-registration-page" ? (
            ""
          ) : (
            <Button variant="contained" color="warning" onClick={handleLogin}>
              Login
            </Button>
          )}
          <Menu
            sx={{ mt: "45px" }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleUserLogout}>
              <Typography sx={{ textAlign: "center" }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
