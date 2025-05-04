"use client";

import Link from "next/link";

interface BackButtonProps {
  label: string;
  href: string;
}

export const BackButton = ({ label, href }: BackButtonProps) => {
  return (
    <div className="w-full text-center mt-4">
      <span className="text-sm text-gray-600">
        {label.split("?")[0]}?{" "}
        <Link 
          href={href}
          className="text-emerald-600 font-medium hover:underline"
        >
          {label.includes("account") ? "Sign up" : "Login"}
        </Link>
      </span>
    </div>
  );
};
