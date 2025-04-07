import { Box } from "@mui/material";
import { Route, Routes } from "react-router-dom"; 
import SignInPage from "./pages/SignInPage";
import Navbar from "./components/Navbar";
import CandidatesListingPage from "./pages/CandidatesListingPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import CheckAuth from "./components/CheckAuth";

const App = () => {
  
  return (
    <Box>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={(<CheckAuth>
            <CandidatesListingPage />
            </CheckAuth> )}
        />
        <Route
          path="/candidate-registration-page"
          element={(<CheckAuth>
            <CandidateRegistrationPage />
            </CheckAuth> )}
        />
        <Route path="/Sign-in" element={<SignInPage />} />
      </Routes>
    </Box>
  );
};

export default App;
