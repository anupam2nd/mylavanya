
import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import UserRoutes from "./UserRoutes";
import AdminRoutes from "./AdminRoutes";
import ArtistRoutes from "./ArtistRoutes";
import ControllerRoutes from "./ControllerRoutes";
import NotFound from "@/pages/NotFound";

const AppRouter = () => (
  <Routes>
    <PublicRoutes />
    <UserRoutes />
    <AdminRoutes />
    <ArtistRoutes />
    <ControllerRoutes />
    
    {/* 404 Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;
