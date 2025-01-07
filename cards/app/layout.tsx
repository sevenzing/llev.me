import type { Metadata } from "next";
import "@fontsource/roboto";
import { EmojiFavicon } from "./favicon";
import Provider from "./provider";
import Header from "@/components/ui/header";
import "./global.css";

export const metadata: Metadata = {
  title: "Gift from Lev",
  description: "Claim your gift and be happy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <EmojiFavicon text="🎁"></EmojiFavicon>
      </head>
      <body className="main">
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
