import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import ToastProvider from "@/components/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Schedulr",
  description: "Schedule meetings effortlessly.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} bg-[#f8fafc] h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full font-sans text-gray-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
