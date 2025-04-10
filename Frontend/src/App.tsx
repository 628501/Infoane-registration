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
          path="/candidate-list"
          element={
            <CheckAuth>
              <CandidatesListingPage />
            </CheckAuth>
          }
        />
        <Route
          path="/candidate-registration-page"
          element={
            <CheckAuth>
              <CandidateRegistrationPage />
            </CheckAuth>
          }
        />
        <Route
          path="/"
          element={
            <CheckAuth>
              <SignInPage />
            </CheckAuth>
          }
        />
      </Routes>
    </Box>
  );
};

export default App;
