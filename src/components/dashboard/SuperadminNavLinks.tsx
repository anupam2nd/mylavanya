
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, Users, CalendarCheck, Package2, LayoutGrid, ListTodo } from "lucide-react";

interface SuperadminNavLinksProps {
  className?: string;
}

const SuperadminNavLinks: React.FC<SuperadminNavLinksProps> = ({ className = "" }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors`
        }
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        Dashboard
      </NavLink>
      
      <NavLink
        to="/admin/bookings"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors`
        }
      >
        <CalendarCheck className="mr-2 h-4 w-4" />
        Bookings
      </NavLink>
      
      <NavLink
        to="/admin/services"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors`
        }
      >
        <Package2 className="mr-2 h-4 w-4" />
        Services
      </NavLink>
      
      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors`
        }
      >
        <Users className="mr-2 h-4 w-4" />
        Users
      </NavLink>
      
      <NavLink
        to="/admin/status"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors`
        }
      >
        <ListTodo className="mr-2 h-4 w-4" />
        Status
      </NavLink>

      <NavLink
        to="/admin/table-browser"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground hover:bg-muted"
          } rounded-md transition-colors bg-primary/5`
        }
      >
        <Database className="mr-2 h-4 w-4" />
        Table Browser
      </NavLink>
    </div>
  );
};

export default SuperadminNavLinks;
