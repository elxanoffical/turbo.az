// app/layout.tsx
import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "AutoLux.az – Lüks Avtomobil Elanları",
  description: "Azərbaycanın ən prestijli avtomobil platforması",
};

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
