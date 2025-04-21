
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Member } from "@/types/member";

interface MemberViewDialogProps {
  memberId: number;
  onClose: () => void;
  fetchMemberById: (id: number) => Promise<Member | null>;
}

const MemberViewDialog = ({ memberId, onClose, fetchMemberById }: MemberViewDialogProps) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        const data = await fetchMemberById(memberId);
        setMember(data);
      } catch (error) {
        console.error("Error fetching member details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [memberId, fetchMemberById]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !member ? (
          <div className="py-6 text-center text-muted-foreground">
            Member not found or an error occurred.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {member.MemberFirstName} {member.MemberLastName}
                </h3>
                <p className="text-sm text-muted-foreground">ID: {member.id}</p>
              </div>
              <Badge variant={member.Active ? "success" : "destructive"}>
                {member.Active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{member.MemberEmailId || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p>{member.MemberPhNo || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{member.MemberAdress || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pincode</p>
                <p>{member.MemberPincode || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>
                  {member.MemberDOB 
                    ? format(new Date(member.MemberDOB), "PPP") 
                    : "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p>{member.MemberSex ? member.MemberSex.charAt(0).toUpperCase() + member.MemberSex.slice(1) : "Not provided"}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">System Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>UUID: {member.uuid}</p>
                <p>Status: {member.MemberStatus ? "Active" : "Inactive"}</p>
              </div>
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
