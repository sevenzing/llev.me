"use client";

import { ChakraProvider, defaultSystem, Theme } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ThemeProvider
        forcedTheme="light"
        attribute="class"
        disableTransitionOnChange
      >
        <Theme appearance="light">{props.children}</Theme>
      </ThemeProvider>
    </ChakraProvider>
  );
}
