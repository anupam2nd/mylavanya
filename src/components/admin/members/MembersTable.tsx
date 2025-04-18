
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Member } from "@/types/member";

interface MembersTableProps {
  members: Member[];
  onToggleStatus: (member: Member) => void;
}

export const MembersTable = ({ members, onToggleStatus }: MembersTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {member.MemberFirstName} {member.MemberLastName}
              </TableCell>
              <TableCell>{member.MemberEmailId}</TableCell>
              <TableCell>{member.MemberPhNo}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={member.Active} 
                    onCheckedChange={() => onToggleStatus(member)}
                  />
                  <span className={member.Active ? "text-green-600" : "text-red-600"}>
                    {member.Active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
