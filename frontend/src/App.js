import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Homeowner Pages
import HomeownerLanding from "./pages/homeowner/HomeownerLanding";
import ServiceBrowse from "./pages/homeowner/ServiceBrowse";
import ProviderProfile from "./pages/homeowner/ProviderProfile";
import HomeownerQuotations from "./pages/homeowner/HomeownerQuotations";
import HomeownerAuth from "./pages/homeowner/HomeownerAuth";
import HomeownerDashboard from "./pages/homeowner/HomeownerDashboard";
import HomeownerExplore from "./pages/homeowner/HomeownerExplore";

// Service Provider Pages
import ServiceProviderLanding from "./pages/provider/ServiceProviderLanding";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderQuotations from "./pages/provider/ProviderQuotations";
import ProviderOrders from "./pages/provider/ProviderOrders";
import ProviderMessaging from "./pages/provider/ProviderMessaging";
import ProviderCalendar from "./pages/provider/ProviderCalendar";
import ProviderCustomers from "./pages/provider/ProviderCustomers";
import ProviderSettings from "./pages/provider/ProviderSettings";
import ProviderAuth from "./pages/provider/ProviderAuth";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/homeowners" replace />} />
          
          {/* Homeowner Routes */}
          <Route path="/homeowners" element={<HomeownerLanding />} />
          <Route path="/homeowners/auth" element={<HomeownerAuth />} />
          <Route path="/homeowners/dashboard" element={<HomeownerDashboard />} />
          <Route path="/homeowners/explore" element={<HomeownerExplore />} />
          <Route path="/homeowners/browse" element={<ServiceBrowse />} />
          <Route path="/homeowners/provider/:id" element={<ProviderProfile />} />
          <Route path="/homeowners/quotations" element={<HomeownerQuotations />} />
          
          {/* Service Provider Routes */}
          <Route path="/homeservices" element={<ServiceProviderLanding />} />
          <Route path="/homeservices/auth" element={<ProviderAuth />} />
          <Route path="/homeservices/dashboard" element={<ProviderDashboard />} />
          <Route path="/homeservices/orders" element={<ProviderOrders />} />
          <Route path="/homeservices/messages" element={<ProviderMessaging />} />
          <Route path="/homeservices/quotations" element={<ProviderQuotations />} />
          <Route path="/homeservices/calendar" element={<ProviderCalendar />} />
          <Route path="/homeservices/customers" element={<ProviderCustomers />} />
          <Route path="/homeservices/settings" element={<ProviderSettings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;