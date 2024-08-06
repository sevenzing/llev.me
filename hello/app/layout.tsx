import type { Metadata } from "next";
import "./globals.css";
import '@fontsource/major-mono-display';
import '@fontsource-variable/inter';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { EmojiFavicon } from "./favicon";
import { Suspense } from 'react'
import { Analytics } from "@vercel/analytics/react"

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
          <Suspense>
            {children}
            <Analytics />
          </Suspense>
        </ChakraProvider>
      </body>
    </html>
  );
}
