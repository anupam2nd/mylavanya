
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <section className="py-10 md:py-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-center">Privacy <span className="text-primary">Policy</span></h1>
            
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground mb-6">
                  Last Updated: July 2023
                </p>
                
                <p className="mb-6">
                  At MyLavanya, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Information We Collect</h2>
                <p>
                  We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Identity Data includes first name, last name, username or similar identifier, title, date of birth, and gender.</li>
                  <li>Contact Data includes billing address, delivery address, email address, and telephone numbers.</li>
                  <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                  <li>Profile Data includes your username and password, purchases or orders made by you, your interests, preferences, feedback, and survey responses.</li>
                  <li>Usage Data includes information about how you use our website, products, and services.</li>
                </ul>
                
                <h2 className="text-2xl font-display mt-10 mb-4">How We Use Your Information</h2>
                <p>
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                  <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                  <li>Where we need to comply with a legal obligation.</li>
                </ul>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Data Security</h2>
                <p>
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions, and they are subject to a duty of confidentiality.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Your Legal Rights</h2>
                <p>
                  Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access to your personal data, request correction of your personal data, request erasure of your personal data, object to processing of your personal data, request restriction of processing your personal data, request transfer of your personal data, and right to withdraw consent.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Cookies</h2>
                <p>
                  You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Changes to This Privacy Policy</h2>
                <p>
                  We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page. We will let you know via email and/or a prominent notice on our website, prior to the change becoming effective and update the "last updated" date at the top of this privacy policy.
                </p>
                
                <h2 className="text-2xl font-display mt-10 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this privacy policy or our privacy practices, please contact us at:
                </p>
                <p className="mt-4">
                  <strong>Email:</strong> contactus@mylavanya.com<br />
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
