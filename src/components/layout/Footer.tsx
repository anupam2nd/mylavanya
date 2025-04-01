import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { ButtonCustom } from "@/components/ui/button-custom";
export default function Footer() {
  const currentYear = new Date().getFullYear();
  return <footer className="bg-accent/30 pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-serif font-bold"><span className="text-primary">Lavanya</span></span>
            </Link>
            <p className="text-muted-foreground">Premium beauty & makeup services for your special events. We make you glow on your big day.</p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Quick Links</h4>
            <ul className="space-y-2">
              {[{
              name: "Home",
              href: "/"
            }, {
              name: "Services",
              href: "/services"
            }, {
              name: "About Us",
              href: "/about"
            }, {
              name: "FAQ",
              href: "/about#faq"
            }, {
              name: "Booking",
              href: "/booking"
            }].map(link => <li key={link.name}>
                  <Link to={link.href} className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                    <ChevronRight size={16} className="mr-1" />
                    {link.name}
                  </Link>
                </li>)}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start text-muted-foreground">
                <MapPin size={18} className="mr-3 text-primary shrink-0 mt-1" />
                <span className="text-base font-medium">DN 30  SEC V SALT LAKE CITY KOLKATA 700091</span>
              </li>
              <li>
                <a href="tel:+1234567890" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <Phone size={18} className="mr-3 text-primary" />
                  <span>+91 9230967221</span>
                </a>
              </li>
              <li>
                <a href="mailto:contactus@lavanya.com" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                  <Mail size={18} className="mr-3 text-primary" />
                  <span>contactus@mylavanya.com</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Newsletter</h4>
            <p className="text-muted-foreground">Subscribe to receive updates on special offers and events.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input type="email" placeholder="Your email" className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              <ButtonCustom type="submit" size="sm">Subscribe</ButtonCustom>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} <span className="text-primary">Lavanya</span>. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>;
}