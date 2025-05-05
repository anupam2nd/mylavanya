
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('FaqMST')
          .select('*')
          .order('id', { ascending: true });
          
        if (error) {
          throw error;
        }
        
        setFaqs(data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        toast({
          title: "Error fetching FAQs",
          description: "There was a problem loading the FAQ data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFaqs();
  }, [toast]);
  
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="FAQ Management">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Manage Frequently Asked Questions</h2>
          
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading FAQs...</p>
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No FAQs found. Create your first FAQ.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="border-b pb-6 last:border-0">
                      <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              This is a basic view. In a future update, we'll add features to create, edit, and delete FAQs.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminFaqs;
