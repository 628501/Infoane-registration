import { Box } from "@mui/material";
import { Route, Routes } from "react-router-dom"; 
import SignInPage from "./pages/SignInPage";
import Navbar from "./components/Navbar";
import CandidatesListingPage from "./pages/CandidatesListingPage";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import CheckAuth from "./components/CheckAuth";

const App = () => {
  const name = useSelector((state: RootState) => state.user.name);
  const auth = useSelector((state: RootState) => state.user.auth);
  console.log(auth);
  
  const isAuthenticated = !!name;
  return (
    <Box>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={(<CheckAuth isAuthenticated={isAuthenticated}>
            <CandidatesListingPage />
            </CheckAuth> )}
        />
        <Route
          path="/candidate-registration-page"
          element={(<CheckAuth isAuthenticated={isAuthenticated}>
            <CandidateRegistrationPage />
            </CheckAuth> )}
        />
        <Route path="/Sign-in" element={<SignInPage />} />
      </Routes>
    </Box>
  );
};

export default App;
