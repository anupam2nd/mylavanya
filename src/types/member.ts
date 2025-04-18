
export interface Member {
  id: number;
  MemberFirstName: string | null;
  MemberLastName: string | null;
  MemberEmailId: string | null;
  MemberPhNo: string | null;
  MemberAdress: string | null;
  MemberPincode: string | null;
  MemberDOB: string | null;
  MemberSex: string | null;
  Active: boolean; // We'll add this as a calculated property
  uuid: string;
}

export const memberHeaders = {
  id: 'ID',
  MemberFirstName: 'First Name',
  MemberLastName: 'Last Name',
  MemberEmailId: 'Email',
  MemberPhNo: 'Phone Number',
  MemberAdress: 'Address',
  MemberPincode: 'Pincode',
  Active: 'Status'
};
