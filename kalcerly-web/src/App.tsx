import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./App.css";
import { ThemeProvider } from "./lib/theme";
import { Home } from "./pages/Home";
import { KetentuanLayanan } from "./pages/KetentuanLayanan";
import { KebijakanPrivasi } from "./pages/KebijakanPrivasi";
import { PedomanKomunitas } from "./pages/PedomanKomunitas";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.substring(1);
      requestAnimationFrame(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [pathname, hash]);

  return null;
}
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ketentuan-layanan" element={<KetentuanLayanan />} />
          <Route path="/kebijakan-privasi" element={<KebijakanPrivasi />} />
          <Route path="/pedoman-komunitas" element={<PedomanKomunitas />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
