import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar.tsx'
import { Footer } from './components/Footer';
import MainPage from './pages/MainPage';
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import ProfileInfoPage from "./pages/ProfileInfoPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import Search from "./components/Search";
import UserProfile from "./pages/UserProfile.tsx";

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profileInfo" element={<ProfileInfoPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/profile" element={<UserProfile />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}
export default App;
