import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
export default function Contact() {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentChecked) {
      toast({
        title: "Consent Required",
        description: "Please check the consent box to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible."
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
      setConsentChecked(false);
      setIsSubmitting(false);
    }, 1000);
  };
  return <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">Contact <span className="text-primary">Us</span></h1>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                {/* Contact Information */}
                <div className="space-y-8">
                  <h2 className="text-2xl font-display font-semibold mb-6">Get in Touch</h2>
                  <p className="text-muted-foreground mb-8">
                    Have questions or want to book an appointment? Reach out to us using any of the methods below, or fill out the contact form.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin size={22} className="text-primary mr-4 mt-1" />
                      <div>
                        <h3 className="font-medium">Our Location</h3>
                        <p className="text-muted-foreground">DN 30 SALT LAKE CITY SEC V <br />KOLKATA 700091</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone size={22} className="text-primary mr-4 mt-1" />
                      <div>
                        <h3 className="font-medium">Phone Number</h3>
                        <p className="text-muted-foreground">+91 9230967221</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail size={22} className="text-primary mr-4 mt-1" />
                      <div>
                        <h3 className="font-medium">Email Address</h3>
                        <p className="text-muted-foreground">contactus@mylavanya.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <h3 className="font-medium mb-3">Business Hours</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>9:00 AM - 7:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Saturday:</span>
                        <span>10:00 AM - 6:00 PM</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Sunday:</span>
                        <span>Closed</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* Contact Form */}
                <div className="bg-accent/30 p-8 rounded-lg">
                  <h2 className="text-2xl font-display font-semibold mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-md border border-input px-4 py-2 bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-md border border-input px-4 py-2 bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-md border border-input px-4 py-2 bg-background" />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">Your Message</label>
                      <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} className="w-full rounded-md border border-input px-4 py-2 bg-background"></textarea>
                    </div>
                    
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox 
                        id="consent" 
                        checked={consentChecked}
                        onCheckedChange={(checked) => setConsentChecked(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                        I have read and agree to the{" "}
                        <Link 
                          to="/terms" 
                          className="text-primary hover:underline font-medium"
                          target="_blank"
                        >
                          Terms & Conditions
                        </Link>
                        {" "}and{" "}
                        <Link 
                          to="/privacy" 
                          className="text-primary hover:underline font-medium"
                          target="_blank"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </label>
                    </div>
                    
                    <ButtonCustom 
                      type="submit" 
                      variant="primary-gradient" 
                      className="w-full" 
                      disabled={isSubmitting || !consentChecked}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </ButtonCustom>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>;
}