import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./core/components/ProtectedRoute";

import { Provider } from "react-redux";
import Login from "./core/pages/auth/Login";
import Dashboard from "./core/pages/Dashboard";
import Unauthorized from "./core/pages/Unauthorized";
import { store } from "./core/store/store";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* protected user route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* protected admin route */}
          {/* <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          }
        /> */}
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
