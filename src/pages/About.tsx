
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">About <span className="text-primary">MyLavanya</span></h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">
                  Welcome to MyLavanya, where beauty meets tradition. We are a premium beauty service provider specializing in making you look and feel your best for all your special occasions.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Story</h2>
                <p>
                  Founded in 2020, MyLavanya was born from a passion for beauty and a commitment to providing exceptional service. Our founder, with over 15 years of experience in the beauty industry, recognized the need for a personalized beauty service that caters to the unique needs of each client.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Our Mission</h2>
                <p>
                  At MyLavanya, our mission is to enhance your natural beauty and boost your confidence through our expert beauty services. We believe that everyone deserves to feel beautiful, and we are committed to making that a reality for all our clients.
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
                  Thank you for considering MyLavanya for your beauty needs. We look forward to serving you and being a part of your special moments.
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
