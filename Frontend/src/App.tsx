import { Box } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Navbar from "./components/Navbar";
import CandidatesListingPage from "./pages/CandidatesListingPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";

const App = () => {  
  return (
    <Box>
      <Navbar />
      <Routes>
        <Route path="/candidate-list" element={<CandidatesListingPage />} />
        <Route path="/candidate-registration-page" element={<CandidateRegistrationPage />} />
        <Route path="/" element={<SignInPage />} />
      </Routes>
    </Box>
  );
};

export default App;
