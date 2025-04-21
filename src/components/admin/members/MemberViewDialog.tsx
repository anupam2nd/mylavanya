
import { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Member } from "@/types/member";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Mail, MapPin, Phone, User } from "lucide-react";

interface MemberViewDialogProps {
  memberId: number;
  onClose: () => void;
  fetchMemberById: (id: number) => Promise<Member | null>;
}

const MemberViewDialog = ({ 
  memberId, 
  onClose, 
  fetchMemberById 
}: MemberViewDialogProps) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        const data = await fetchMemberById(memberId);
        setMember(data);
      } catch (error) {
        console.error("Error loading member:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMember();
  }, [memberId, fetchMemberById]);
  
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Not available";
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !member ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground">Member not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  {member.MemberFirstName} {member.MemberLastName}
                </h3>
                <Badge variant={member.Active ? "success" : "destructive"}>
                  {member.Active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{member.MemberEmailId || "No email"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.MemberPhNo || "No phone number"}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {member.MemberAdress 
                    ? `${member.MemberAdress}${member.MemberPincode ? `, ${member.MemberPincode}` : ''}`
                    : "No address provided"}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>DOB: {formatDate(member.MemberDOB)}</span>
              </div>
              
              {member.MemberSex && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Gender: {member.MemberSex}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberViewDialog;
