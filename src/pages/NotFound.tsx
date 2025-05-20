
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the 404 error
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if the path contains a mistyped "service/" (singular) instead of "services/" (plural)
    if (location.pathname.includes('/service/')) {
      // Extract the ID from the URL if it exists
      const pathParts = location.pathname.split('/');
      const serviceId = pathParts[pathParts.length - 1];
      
      // If we have a valid service ID, redirect to the correct path
      if (serviceId && !isNaN(Number(serviceId))) {
        const correctPath = location.pathname.replace('/service/', '/services/');
        console.log(`Redirecting from incorrect path ${location.pathname} to ${correctPath}`);
        navigate(correctPath, { replace: true });
      } else {
        // If no valid ID, redirect to the services listing
        console.log(`Redirecting from incorrect path ${location.pathname} to /services`);
        navigate('/services', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
