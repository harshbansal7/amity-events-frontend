import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ExternalRegistration from "./components/Auth/ExternalRegistration";
import EventList from "./components/Events/EventList";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import MyEvents from "./components/Events/MyEvents";
import ForgotPassword from "./components/Auth/ForgotPassword";
import AdminPanel from "./components/Admin/AdminPanel";
import Events from "./components/Admin/Events";
import Participants from "./components/Admin/Participants";
import Reports from "./components/Admin/Reports";
import Attendance from "./components/Admin/Attendance";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/external-register"
                element={<ExternalRegistration />}
              />
              <Route path="/" element={<Navigate to="/events" replace />} />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Events />} />
                <Route path="events" element={<Events />} />
                <Route path="participants" element={<Participants />} />
                <Route path="reports" element={<Reports />} />
                <Route path="attendance" element={<Attendance />} />
              </Route>
              <Route
                path="/events/:eventId"
                element={
                  <ProtectedRoute>
                    <EventList />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/events" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
