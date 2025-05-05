
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  children: ReactNode;
}

const NavLink = ({ to, icon: Icon, children }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className="flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100"
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{children}</span>
    </Link>
  );
};

export default NavLink;
