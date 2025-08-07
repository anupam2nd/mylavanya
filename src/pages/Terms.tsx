import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">Terms of <span className="text-primary">Service</span></h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">
                  Last Updated: July 2023
                </p>
                
                <p className="mb-6">
                  Please read these terms of service carefully before using the Lavanya website or booking our services. By accessing or using our service, you agree to be bound by these terms.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">2. Service Description</h2>
                <p>
                  Lavanya provides beauty services for special events including but not limited to weddings, parties, and other occasions. Our services are subject to availability and may vary based on location, time, and specific requirements.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">3. Booking and Cancellation</h2>
                <p>
                  All bookings are subject to availability and confirmation. We recommend booking at least 2 weeks in advance for regular services and 4-6 weeks for bridal services.
                </p>
                <p className="mt-4">
                  Cancellation Policy:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Cancellations made 48 hours or more before the scheduled appointment will receive a full refund of any deposit paid.</li>
                  <li>Cancellations made between 24-48 hours before the scheduled appointment will receive a 50% refund of any deposit paid.</li>
                  <li>Cancellations made less than 24 hours before the scheduled appointment will not be eligible for a refund.</li>
                </ul>
                
                <h2 className="text-2xl font-display mt-10 mb-4">4. Payment Terms</h2>
                <p>
                  A 25% deposit is required to secure the booking. The remaining balance is due on the day of service. We accept payments via credit/debit cards, UPI, and bank transfers. All prices are inclusive of applicable taxes.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">5. Intellectual Property</h2>
                <p>
                  The content, organization, graphics, design, compilation, and other matters related to the Lavanya website are protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, use, or publication by you of any such matters or any part of the website is strictly prohibited without our express prior written permission.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">6. User Conduct</h2>
                <p>
                  You agree to use our services for lawful purposes only and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">7. Limitation of Liability</h2>
                <p>
                  Lavanya shall not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use of, or the inability to use, our services or any information provided on our website.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">8. Governing Law</h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of India. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Kolkata, India.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">9. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. We will inform you of any changes by posting the new Terms of Service on this page. Changes will be effective when posted.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">10. Promotional Messages and Communications</h2>
                <p>
                  By using our service, you agree to receive promotional messages and communications from us. These messages may include offers, updates, and information about our products and services.
                </p>
                <p className="mt-4">
                  You authorize us to send these communications to you via:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>SMS:</strong> Standard text messages.</li>
                  <li><strong>RCS:</strong> Rich Communication Services messages.</li>
                  <li><strong>WABA:</strong> WhatsApp Business API messages.</li>
                  <li><strong>Voice Calls:</strong> Automated or live calls.</li>
                </ul>
                <p className="mt-4">
                  These messages will be sent to the phone numbers you've provided to us. You can opt out of receiving these promotional communications at any time by following the unsubscribe instructions provided in the messages themselves.
                </p>

                <h2 className="text-2xl font-display mt-10 mb-4">11. Contact Information</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> contactus@lavanya.com<br />
                  <strong>Phone:</strong> +91 9230967221<br />
                  <strong>Address:</strong> DN 30 SALT LAKE CITY SEC V, KOLKATA 700091
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
