import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appointment Board | Team Schedule & Meeting Manager",
  description: "A modern, high-performance appointment management dashboard for teams with strict conflict detection, real-time filtering, and scheduling controls.",
  authors: [{ name: "Full Stack Intern Candidate" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
