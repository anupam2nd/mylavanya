
export interface Artist {
  ArtistId: number;
  ArtistFirstName: string | null;
  ArtistLastName: string | null;
  ArtistEmpCode: string | null;
  ArtistPhno: number | null;
  Artistgrp: string | null;
  Source: string | null;
  ArtistRating: number | null;
  Active: boolean | null;
  emailid?: string | null;
  created_at?: string;
  password?: string;
}

export const artistHeaders = {
  ArtistId: 'ID',
  ArtistFirstName: 'First Name',
  ArtistLastName: 'Last Name',
  ArtistEmpCode: 'Employee Code',
  ArtistPhno: 'Phone Number',
  Artistgrp: 'Artist Group',
  Source: 'Source',
  ArtistRating: 'Rating',
  Active: 'Status',
  emailid: 'Email'
};

export const artistGroupOptions = [
  "Mehendi",
  "Makeup",
  "Hairstylist",
  "Photographer",
  "Decorator",
  "Other"
];
