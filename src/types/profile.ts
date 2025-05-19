
export interface ProfileFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  // Additional fields for member profile
  maritalStatus?: boolean;
  spouseName?: string;
  hasChildren?: boolean;
  numberOfChildren?: number;
  childrenDetails?: ChildDetail[];
}

export interface ChildDetail {
  name: string;
  age: string;
}
