
import { Route } from "react-router-dom";
import Index from "@/pages/Index";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import TrackBooking from "@/pages/TrackBooking";
import { ROUTES } from "@/config/routes";

const PublicRoutes = () => (
  <>
    <Route path={ROUTES.HOME} element={<Index />} />
    <Route path={ROUTES.SERVICES} element={<Services />} />
    <Route path={ROUTES.SERVICE_DETAIL} element={<ServiceDetail />} />
    <Route path={ROUTES.ABOUT} element={<About />} />
    <Route path={ROUTES.CONTACT} element={<Contact />} />
    <Route path={ROUTES.TERMS} element={<Terms />} />
    <Route path={ROUTES.PRIVACY} element={<Privacy />} />
    <Route path={ROUTES.TRACK} element={<TrackBooking />} />
    <Route path={ROUTES.TRACK_BOOKING} element={<TrackBooking />} />
  </>
);

export default PublicRoutes;
