
export interface ChildDetail {
  name: string;
  age: string;
}

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

// Define a type that maps to the Json type from Supabase
export type JsonCompatible<T> = T extends string | number | boolean | null ? T :
  T extends Array<infer U> ? Array<JsonCompatible<U>> :
  T extends object ? { [K in keyof T]: JsonCompatible<T[K]> } :
  never;
