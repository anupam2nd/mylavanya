
import Navbar from "./Navbar";
import Footer from "./Footer";
import FloatingTrackButton from "../ui/FloatingTrackButton";
import AnnouncementBanner from "../sections/AnnouncementBanner";

interface MainLayoutProps {
  children: React.ReactNode;
  showAnnouncement?: boolean;
  announcementMessage?: string;
  announcementBackgroundImage?: string;
}

const MainLayout = ({ 
  children, 
  showAnnouncement = true,
  announcementMessage,
  announcementBackgroundImage
}: MainLayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {showAnnouncement && (
        <AnnouncementBanner 
          message={announcementMessage}
          backgroundImage={announcementBackgroundImage}
        />
      )}
      <main className="flex-grow">
        {children}
      </main>
      <FloatingTrackButton />
      <Footer />
    </div>
  );
};

export default MainLayout;
