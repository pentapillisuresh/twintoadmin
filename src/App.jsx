
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import AdminLayout from "./components/layout/AdminLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Locations from "./pages/Locations";
import Coupons from "./pages/Coupons";
import Settings from "./pages/Settings";

function Protected() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<Protected />}>
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/orders/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/locations"
          element={<Locations />}
        />

        <Route
          path="/coupons"
          element={<Coupons />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
