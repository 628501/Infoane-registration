import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Route, Routes, useLocation } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import Navbar from "./components/Navbar";
import CandidatesListingPage from "./pages/CandidatesListingPage";
import CandidateRegistrationPage from "./pages/CandidateRegistrationPage";
import CheckAuth from "./components/CheckAuth";
import CircularProgressBar from "./components/CircularProgressBar";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    if (
      location.pathname === "/" ||
      location.pathname === "/candidate-registration-page"
    ) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Box>
      <Navbar />
      {!isLoading ? (
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
      ) : (
        <CircularProgressBar />
      )}
    </Box>
  );
};

export default App;
