
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">About <span className="text-primary">Lavanya</span></h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">
                  Welcome to Lavanya, where beauty meets tradition. We are a premium beauty service provider specializing in making you look and feel your best for all your special occasions.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Story</h2>
                <p>
                  Founded in 2020, Lavanya was born from a passion for beauty and a commitment to providing exceptional service. Our founder, with over 15 years of experience in the beauty industry, recognized the need for a personalized beauty service that caters to the unique needs of each client.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Mission</h2>
                <p>
                  At Lavanya, our mission is to enhance your natural beauty and boost your confidence through our expert beauty services. We believe that everyone deserves to feel beautiful, and we are committed to making that a reality for all our clients.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Team</h2>
                <p>
                  Our team consists of highly skilled and certified beauty professionals who are passionate about their craft. Each member of our team undergoes rigorous training to ensure that they are up-to-date with the latest beauty trends and techniques.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Approach</h2>
                <p>
                  We believe in a personalized approach to beauty. We take the time to understand your needs and preferences to create a look that is uniquely yours. Whether you're preparing for your wedding day, a special event, or just want to treat yourself, we're here to make you look and feel your best.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Commitment</h2>
                <p>
                  We are committed to using high-quality, cruelty-free products that are safe for you and the environment. We also prioritize hygiene and cleanliness in all our services to ensure the safety and wellbeing of our clients.
                </p>
                
                <p className="mt-10">
                  Thank you for considering Lavanya for your beauty needs. We look forward to serving you and being a part of your special moments.
                </p>
              </div>
            </div>
          </section>
          
          {/* FAQ Section */}
          <section id="faq" className="py-10 md:py-16 bg-accent/10 rounded-xl">
            <div className="max-w-3xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">Frequently Asked <span className="text-primary">Questions</span></h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    What services do you offer?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We offer a wide range of beauty services including bridal makeup, party makeup, hairstyling, mehendi, and various other beauty treatments. Check our Services page for a complete list.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium">
                    How far in advance should I book my appointment?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We recommend booking at least 2 weeks in advance for regular services and 4-6 weeks for bridal services to ensure availability, especially during peak wedding seasons.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium">
                    Do you provide at-home services?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, we provide at-home beauty services within Kolkata. Additional travel charges may apply depending on your location.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium">
                    What products do you use for your services?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We use high-quality, professional-grade products from renowned brands that are suitable for all skin types. All our products are cruelty-free and have been tested for safety.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium">
                    Do you offer trial sessions for bridal makeup?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, we highly recommend trial sessions for bridal makeup to ensure you're completely satisfied with the look on your special day. Trial sessions are charged separately.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-lg font-medium">
                    What is your cancellation policy?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Cancellations made 48 hours or more before the scheduled appointment will receive a full refund. Cancellations within 24-48 hours will receive a 50% refund, and those made less than 24 hours in advance are not eligible for a refund.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-lg font-medium">
                    Do I need to pay a deposit to book a service?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, a 25% deposit is required to secure your booking. The remaining balance is due on the day of service.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-lg font-medium">
                    How can I make a payment?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We accept payments via credit/debit cards, UPI, and bank transfers. All prices are inclusive of applicable taxes.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
