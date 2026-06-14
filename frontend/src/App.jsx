import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import AddProduct from "@/pages/AddProduct";
import CustomerDashboard from "@/pages/CustomerDashboard";
import Dashboard from "@/pages/Dashboard";
import EditProduct from "@/pages/EditProduct";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import LoginCompany from "@/pages/LoginCompany";
import LoginCustomer from "@/pages/LoginCustomer";
import ProductPage from "@/pages/ProductPage";
import Register from "@/pages/Register";
import RegisterCompany from "@/pages/RegisterCompany";
import RegisterCustomer from "@/pages/RegisterCustomer";

function App() {
  const location = useLocation();
  const authPage = location.pathname.startsWith("/login") || location.pathname.startsWith("/register");

  return (
    <div className="app-shell">
      <Navbar />
      <main className={authPage ? "py-10" : "py-8 sm:py-10"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/company" element={<LoginCompany />} />
          <Route path="/login/customer" element={<LoginCustomer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:productId/edit"
            element={
              <ProtectedRoute allowedRoles={["company"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:productId"
            element={
              <ProtectedRoute>
                <ProductPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
