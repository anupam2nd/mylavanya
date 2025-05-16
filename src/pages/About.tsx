import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
interface FaqItem {
  id: number;
  question: string;
  answer: string;
}
export default function About() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.from('FaqMST').select('id, question, answer').eq('active', true) // Only fetch active FAQs
        .order('id', {
          ascending: true
        });
        if (error) {
          throw error;
        }
        setFaqs(data || []);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);
  return <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">About <span className="text-primary">Lavanya</span></h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">Welcome to Lavanya, a blend of beauty &amp; grace. We are a premium beauty &amp; makeup service provider specializing in making you look and feel your best for all your special occasions. </p>
                
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
              
              {loading ? <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-opacity-50"></div>
                </div> : error ? <p className="text-center text-red-500">{error}</p> : faqs.length === 0 ? <p className="text-center text-muted-foreground py-8">No FAQs available at the moment.</p> : <Accordion type="single" collapsible className="w-full">
                  {faqs.map(faq => <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                      <AccordionTrigger className="text-lg font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>)}
                </Accordion>}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>;
}