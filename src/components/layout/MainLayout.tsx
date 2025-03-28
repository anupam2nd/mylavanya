
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingTrackButton from "../ui/FloatingTrackButton";
import AnnouncementBanner from "../sections/AnnouncementBanner";

interface MainLayoutProps {
  children: React.ReactNode;
  showAnnouncement?: boolean;
}

const MainLayout = ({ children, showAnnouncement = true }: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showAnnouncement && <AnnouncementBanner />}
      <main className="flex-grow">
        {children}
      </main>
      <FloatingTrackButton />
      <Footer />
    </div>
  );
};

export default MainLayout;
