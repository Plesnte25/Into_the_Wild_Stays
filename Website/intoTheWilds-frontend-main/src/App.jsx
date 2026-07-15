import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AppProvider } from "./context/AppContext";
import FloatingWhatsappIcon from "./components/FloatingWhatsappIcon";
import ScrollToTop from "./components/ScrollToTop";

// Note: GoogleOAuthProvider is already provided once, at the root, in
// main.jsx (driven by VITE_GOOGLE_CLIENT_ID). Do not add another
// GoogleOAuthProvider here — a nested provider would silently shadow the
// env-driven one for every component under App.
function App() {
  return (
    <AppProvider>
      <ScrollToTop />
      <Navbar />
      <div>
        <Outlet />
      </div>
      <Footer />
      <FloatingWhatsappIcon />
    </AppProvider>
  );
}

export default App;
