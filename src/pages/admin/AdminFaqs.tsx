
import { useEffect, useState } from "react";
import { Pencil, Trash, AlertTriangle, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<FaqItem>>({
    question: '',
    answer: ''
  });
  const { toast } = useToast();
  
  // Fetch FAQs data
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
  
  useEffect(() => {
    fetchFaqs();
  }, [toast]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Get the next available ID for a new FAQ
  const getNextAvailableId = () => {
    if (faqs.length === 0) return 1;
    const maxId = Math.max(...faqs.map(faq => faq.id));
    return maxId + 1;
  };
  
  // Create new FAQ
  const handleCreateFaq = async () => {
    if (!formData.question || !formData.answer) {
      toast({
        title: "Missing fields",
        description: "Please fill in both question and answer fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the next available ID
      const nextId = getNextAvailableId();
      
      const { data, error } = await supabase
        .from('FaqMST')
        .insert([{ 
          id: nextId,
          question: formData.question,
          answer: formData.answer
        }])
        .select();
        
      if (error) {
        console.error('Error creating FAQ:', error);
        throw error;
      }
      
      if (data) {
        setFaqs([...faqs, data[0]]);
      }
      
      setIsCreating(false);
      setFormData({ question: '', answer: '' });
      
      toast({
        title: "FAQ created",
        description: "New FAQ has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast({
        title: "Error creating FAQ",
        description: "There was a problem adding the new FAQ.",
        variant: "destructive",
      });
    }
  };
  
  // Open edit dialog
  const handleEditClick = (faq: FaqItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
  };
  
  // Save edited FAQ
  const handleSaveEdit = async () => {
    if (!editingFaq) return;
    
    if (!formData.question || !formData.answer) {
      toast({
        title: "Missing fields",
        description: "Please fill in both question and answer fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('FaqMST')
        .update({
          question: formData.question,
          answer: formData.answer
        })
        .eq('id', editingFaq.id);
        
      if (error) throw error;
      
      // Update local state
      setFaqs(faqs.map(f => 
        f.id === editingFaq.id 
          ? { ...f, question: formData.question!, answer: formData.answer! } 
          : f
      ));
      
      setEditingFaq(null);
      toast({
        title: "FAQ updated",
        description: "FAQ has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: "Error updating FAQ",
        description: "There was a problem updating the FAQ.",
        variant: "destructive",
      });
    }
  };
  
  // Delete FAQ
  const handleDelete = async () => {
    if (!deletingFaq) return;
    
    try {
      const { error } = await supabase
        .from('FaqMST')
        .delete()
        .eq('id', deletingFaq.id);
        
      if (error) throw error;
      
      // Update local state
      setFaqs(faqs.filter(f => f.id !== deletingFaq.id));
      setDeletingFaq(null);
      
      toast({
        title: "FAQ deleted",
        description: "FAQ has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error deleting FAQ",
        description: "There was a problem deleting the FAQ.",
        variant: "destructive",
      });
    }
  };
  
  // Reset form when opening create dialog
  const openCreateDialog = () => {
    setFormData({ question: '', answer: '' });
    setIsCreating(true);
  };
  
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="FAQ Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Frequently Asked Questions</h2>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-1" />
              Add FAQ
            </Button>
          </div>
          
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs.map((faq) => (
                        <TableRow key={faq.id}>
                          <TableCell>{faq.id}</TableCell>
                          <TableCell className="max-w-xs truncate">{faq.question}</TableCell>
                          <TableCell className="max-w-sm truncate">{faq.answer}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(faq)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => setDeletingFaq(faq)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Create FAQ Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New FAQ</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  name="question"
                  value={formData.question || ''}
                  onChange={handleInputChange}
                  placeholder="Enter the question"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  name="answer"
                  value={formData.answer || ''}
                  onChange={handleInputChange}
                  placeholder="Enter the answer"
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateFaq}>Add FAQ</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit FAQ Dialog */}
        {editingFaq && (
          <Dialog open={Boolean(editingFaq)} onOpenChange={() => setEditingFaq(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit FAQ</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-question">Question</Label>
                  <Input
                    id="edit-question"
                    name="question"
                    value={formData.question || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-answer">Answer</Label>
                  <Textarea
                    id="edit-answer"
                    name="answer"
                    value={formData.answer || ''}
                    onChange={handleInputChange}
                    className="min-h-[120px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Delete Confirmation Dialog */}
        {deletingFaq && (
          <Dialog open={Boolean(deletingFaq)} onOpenChange={() => setDeletingFaq(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Are you sure you want to delete this FAQ? This action cannot be undone.</p>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{deletingFaq.question}</p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminFaqs;
