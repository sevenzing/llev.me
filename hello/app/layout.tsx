import type { Metadata } from "next";
import "./globals.css";
import '@fontsource/major-mono-display';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { EmojiFavicon } from "./favicon";


export const metadata: Metadata = {
  title: "Hello, it's Lev",
  description: "Developer with taste",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <EmojiFavicon text="👋"></EmojiFavicon>
      </head>
      <body>
        <ChakraProvider>
        <ColorModeScript initialColorMode="dark" />
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
