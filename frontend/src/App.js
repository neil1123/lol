import { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

// Homeowner Pages
import HomeownerLanding from "./pages/homeowner/HomeownerLanding";
import ServiceBrowse from "./pages/homeowner/ServiceBrowse";
import ProviderProfile from "./pages/homeowner/ProviderProfile";
import HomeownerQuotations from "./pages/homeowner/HomeownerQuotations";
import HomeownerAuth from "./pages/homeowner/HomeownerAuth";
import HomeownerDashboard from "./pages/homeowner/HomeownerDashboard";

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

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  // Redirect to homeowners by default
  useEffect(() => {
    window.location.href = '/homeowners';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Welcome to Doord</h1>
        <p className="text-xl text-gray-600 mb-8">Your Home Services Marketplace</p>
        <div className="space-x-4">
          <a 
            href="/homeowners" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            For Homeowners
          </a>
          <a 
            href="/homeservices" 
            className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            For Service Providers
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Homeowner Routes */}
          <Route path="/homeowners" element={<HomeownerLanding />} />
          <Route path="/homeowners/auth" element={<HomeownerAuth />} />
          <Route path="/homeowners/dashboard" element={<HomeownerDashboard />} />
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;