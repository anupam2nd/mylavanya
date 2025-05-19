import { useEffect, useState } from "react";
import { Pencil, Trash, AlertTriangle, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface MemberItem {
  id: number;
  MemberFirstName: string;
  MemberLastName: string;
  MemberEmailId: string;
  MemberPhNo: string;
  MemberStatus: boolean;
  MemberAdress: string;
  MemberPincode: string;
}

const AdminMembers = () => {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<MemberItem>>({
    MemberFirstName: '',
    MemberLastName: '',
    MemberEmailId: '',
    MemberPhNo: '',
    MemberAdress: '',
    MemberPincode: '',
    MemberStatus: true
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Fetch members data
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('MemberMST')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Error fetching members",
        description: "There was a problem loading the member data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [toast]);
  
  // Get the next available ID for a new member
  const getNextAvailableId = () => {
    if (members.length === 0) return 1;
    const maxId = Math.max(...members.map(member => member.id));
    return maxId + 1;
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData({
      MemberFirstName: '',
      MemberLastName: '',
      MemberEmailId: '',
      MemberPhNo: '',
      MemberAdress: '',
      MemberPincode: '',
      MemberStatus: true
    });
    setIsCreating(true);
  };
  
  // Create new member
  const handleCreateMember = async () => {
    if (!formData.MemberFirstName || !formData.MemberLastName || !formData.MemberEmailId) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields (First Name, Last Name, Email).",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get the next available ID
      const nextId = getNextAvailableId();
      
      const { data, error } = await supabase
        .from('MemberMST')
        .insert([{
          id: nextId,
          MemberFirstName: formData.MemberFirstName,
          MemberLastName: formData.MemberLastName, 
          MemberEmailId: formData.MemberEmailId,
          MemberPhNo: formData.MemberPhNo || '',
          MemberAdress: formData.MemberAdress || '',
          MemberPincode: formData.MemberPincode || '',
          MemberStatus: formData.MemberStatus
        }])
        .select();
      
      if (error) throw error;
      
      if (data) {
        setMembers([...members, data[0]]);
      }
      
      setIsCreating(false);
      toast({
        title: "Member created",
        description: "New member has been added successfully."
      });
    } catch (error) {
      console.error('Error creating member:', error);
      toast({
        title: "Error creating member",
        description: "There was a problem adding the new member.",
        variant: "destructive",
      });
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (member: MemberItem) => {
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update({ MemberStatus: !member.MemberStatus })
        .eq('id', member.id);
        
      if (error) throw error;
      
      // Update local state
      setMembers(members.map(m => 
        m.id === member.id ? { ...m, MemberStatus: !m.MemberStatus } : m
      ));
      
      toast({
        title: "Status updated",
        description: `Member ${member.MemberFirstName} ${member.MemberLastName} is now ${!member.MemberStatus ? 'active' : 'inactive'}.`,
      });
    } catch (error) {
      console.error('Error updating member status:', error);
      toast({
        title: "Error updating status",
        description: "There was a problem updating the member status.",
        variant: "destructive",
      });
    }
  };
  
  // Open edit dialog
  const handleEditClick = (member: MemberItem) => {
    setEditingMember(member);
    setFormData({
      MemberFirstName: member.MemberFirstName,
      MemberLastName: member.MemberLastName,
      MemberEmailId: member.MemberEmailId,
      MemberPhNo: member.MemberPhNo,
      MemberAdress: member.MemberAdress,
      MemberPincode: member.MemberPincode,
      MemberStatus: member.MemberStatus
    });
  };
  
  // Save edited member
  const handleSaveEdit = async () => {
    if (!editingMember) return;
    
    try {
      const { error } = await supabase
        .from('MemberMST')
        .update(formData)
        .eq('id', editingMember.id);
        
      if (error) throw error;
      
      // Update local state
      setMembers(members.map(m => 
        m.id === editingMember.id ? { ...m, ...formData } : m
      ));
      
      setEditingMember(null);
      toast({
        title: "Member updated",
        description: "Member information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "Error updating member",
        description: "There was a problem updating the member information.",
        variant: "destructive",
      });
    }
  };
  
  // Delete member
  const handleDelete = async () => {
    if (!deletingMember) return;
    
    try {
      const { error } = await supabase
        .from('MemberMST')
        .delete()
        .eq('id', deletingMember.id);
        
      if (error) throw error;
      
      // Update local state
      setMembers(members.filter(m => m.id !== deletingMember.id));
      setDeletingMember(null);
      
      toast({
        title: "Member deleted",
        description: "Member has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting member:', error);
      toast({
        title: "Error deleting member",
        description: "There was a problem deleting the member.",
        variant: "destructive",
      });
    }
  };
  
  // Render mobile member card
  const renderMemberCard = (member: MemberItem) => (
    <div key={member.id} className="bg-card rounded-lg border p-4 mb-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">ID: {member.id}</span>
          <div className="flex items-center space-x-2">
            <Switch
              checked={member.MemberStatus}
              onCheckedChange={() => handleStatusToggle(member)}
              size="sm"
            />
            <span className={`text-xs ${member.MemberStatus ? "text-green-600" : "text-red-600"}`}>
              {member.MemberStatus ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        
        <h3 className="font-semibold text-base">
          {member.MemberFirstName} {member.MemberLastName}
        </h3>
        
        <div className="text-sm text-muted-foreground">
          <p>{member.MemberEmailId}</p>
          <p>Phone: {member.MemberPhNo || "N/A"}</p>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleEditClick(member)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeletingMember(member)}
            className="flex-1"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <DashboardLayout title="Member Management">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Members</h2>
            <Button onClick={openCreateDialog} size={isMobile ? "sm" : "default"}>
              <Plus className="h-4 w-4 mr-1" />
              Add Member
            </Button>
          </div>
          
          <Card>
            <CardContent className={isMobile ? "p-3" : "p-6"}>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No members found.</p>
                </div>
              ) : isMobile ? (
                // Mobile view with cards
                <div className="space-y-4">
                  {members.map(renderMemberCard)}
                </div>
              ) : (
                // Desktop view with table
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden sm:table-cell">Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.id}</TableCell>
                          <TableCell className="font-medium">
                            <div>
                              {member.MemberFirstName} {member.MemberLastName}
                            </div>
                            <div className="md:hidden text-xs text-muted-foreground truncate max-w-[180px]">
                              {member.MemberEmailId}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{member.MemberEmailId}</TableCell>
                          <TableCell className="hidden sm:table-cell">{member.MemberPhNo}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={member.MemberStatus}
                                onCheckedChange={() => handleStatusToggle(member)}
                              />
                              <span className={member.MemberStatus ? "text-green-600" : "text-red-600"}>
                                {member.MemberStatus ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditClick(member)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => setDeletingMember(member)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Delete</span>
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
        
        {/* Create Member Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="MemberFirstName">First Name *</Label>
                  <Input
                    id="MemberFirstName"
                    name="MemberFirstName"
                    value={formData.MemberFirstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="MemberLastName">Last Name *</Label>
                  <Input
                    id="MemberLastName"
                    name="MemberLastName"
                    value={formData.MemberLastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="MemberEmailId">Email *</Label>
                <Input
                  id="MemberEmailId"
                  name="MemberEmailId"
                  type="email"
                  value={formData.MemberEmailId || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="MemberPhNo">Phone Number</Label>
                <Input
                  id="MemberPhNo"
                  name="MemberPhNo"
                  value={formData.MemberPhNo || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="MemberAdress">Address</Label>
                <Input
                  id="MemberAdress"
                  name="MemberAdress"
                  value={formData.MemberAdress || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="MemberPincode">Pincode</Label>
                <Input
                  id="MemberPincode"
                  name="MemberPincode"
                  value={formData.MemberPincode || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="MemberStatus" 
                  checked={formData.MemberStatus}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, MemberStatus: !!checked }))}
                />
                <Label htmlFor="MemberStatus">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateMember}>Create Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Member Dialog */}
        {editingMember && (
          <Dialog open={Boolean(editingMember)} onOpenChange={() => setEditingMember(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="MemberFirstName">First Name</Label>
                    <Input
                      id="MemberFirstName"
                      name="MemberFirstName"
                      value={formData.MemberFirstName || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="MemberLastName">Last Name</Label>
                    <Input
                      id="MemberLastName"
                      name="MemberLastName"
                      value={formData.MemberLastName || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="MemberEmailId">Email</Label>
                  <Input
                    id="MemberEmailId"
                    name="MemberEmailId"
                    type="email"
                    value={formData.MemberEmailId || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="MemberPhNo">Phone Number</Label>
                  <Input
                    id="MemberPhNo"
                    name="MemberPhNo"
                    value={formData.MemberPhNo || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="MemberAdress">Address</Label>
                  <Input
                    id="MemberAdress"
                    name="MemberAdress"
                    value={formData.MemberAdress || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="MemberPincode">Pincode</Label>
                  <Input
                    id="MemberPincode"
                    name="MemberPincode"
                    value={formData.MemberPincode || ''}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="MemberStatus" 
                    checked={formData.MemberStatus}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, MemberStatus: !!checked }))}
                  />
                  <Label htmlFor="MemberStatus">Active</Label>
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
        {deletingMember && (
          <Dialog open={Boolean(deletingMember)} onOpenChange={() => setDeletingMember(null)}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
                  Confirm Deletion
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p>Are you sure you want to delete member <span className="font-semibold">
                  {deletingMember.MemberFirstName} {deletingMember.MemberLastName}
                </span>? This action cannot be undone.</p>
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

export default AdminMembers;
