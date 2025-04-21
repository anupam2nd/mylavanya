
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
  MemberStatus: boolean | null;
  Active: boolean; // We'll use this as a computed property from MemberStatus
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
  MemberDOB: 'Date of Birth',
  MemberSex: 'Gender',
  Active: 'Status'
};
