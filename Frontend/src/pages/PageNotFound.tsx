import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/GlobalContext";
 
const PageNotFound = () => {
    const navigate = useNavigate();
    const { authorized } = useAuth();
  return (
    <Box
      sx={{
        height: "85vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Typography variant="h3" color="error" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="subtitle1">
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" onClick={()=> navigate("/candidate-list")} sx={{mt:"10px"}}>
       {
        authorized ? "Go to Home" : "Go to Login"
       } 
      </Button>
    </Box>
  );
};
 
export default PageNotFound;
 