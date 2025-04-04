
import React from 'react';
import { LucideProps } from 'lucide-react';

export const Rupee = (props: LucideProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h12l-6 18-6-18z" />
      <path d="M6 3l6 6" />
      <path d="M18 3l-6 6" />
    </svg>
  );
};
