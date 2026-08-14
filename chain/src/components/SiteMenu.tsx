"use client";

import { usePathname } from "next/navigation";
import StaggeredMenu from "@/components/react-bits/StaggeredMenu";

const items = [
  { label: "Home", ariaLabel: "Home", link: "/" },
  { label: "About", ariaLabel: "About", link: "/about" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com/sevenzing" },
  { label: "LinkedIn", link: "https://linkedin.com/in/lymarenkolev/" },
  { label: "Instagram", link: "https://instagram.com/llevchiks/" },
];

export function SiteMenu() {
  const pathname = usePathname();
  const onIntro = pathname === "/";

  return (
    <StaggeredMenu
      key={pathname}
      className="site-menu"
      isFixed
      position="right"
      items={items}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      accentColor="#8c70fa"
      colors={["#c4b5fd", "#8c70fa"]}
      menuButtonColor={onIntro ? "#f4f0ea" : "#1c1c1e"}
      openMenuButtonColor="#1c1c1e"
    />
  );
}
