// app/layout.tsx
import Footer from "@/components/Footer";
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "AutoLux.az – Lüks Avtomobil Elanları",
  description: "Azərbaycanın ən prestijli avtomobil platforması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
