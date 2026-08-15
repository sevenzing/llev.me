"use client";

import { usePathname } from "next/navigation";
import StaggeredMenu from "@/components/react-bits/StaggeredMenu";

const items = [
  { label: "Home", ariaLabel: "Home", link: "/" },
  { label: "About", ariaLabel: "About", link: "/about" },
  { label: "Stack", ariaLabel: "Stack", link: "/stack" },
];

const socialItems = [
  { label: "GitHub", link: "https://github.com/sevenzing" },
  { label: "LinkedIn", link: "https://linkedin.com/in/lymarenkolev/" },
  { label: "Telegram", link: "https://t.me/llevchiks" },
];

const menuClassName = [
  "[&_.staggered-menu-header]:justify-end [&_.staggered-menu-header]:px-7 [&_.staggered-menu-header]:py-6",
  "[&_.sm-toggle-textWrap]:sr-only",
  "[&_.sm-icon]:h-6 [&_.sm-icon]:w-8 [&_.sm-icon]:basis-8 [&_.sm-icon-line]:h-[3px]",
  "[&_.sm-panel-item]:font-mono [&_.sm-panel-item]:text-[clamp(2rem,6vw,3.4rem)] [&_.sm-panel-item]:tracking-normal",
  "[&_.sm-socials-title]:font-mono [&_.sm-socials-link]:font-mono",
  "max-[800px]:[&_.sm-panel-item]:pr-[1.6rem]",
  "max-[800px]:[&_.sm-panel-list[data-numbering]_.sm-panel-item]:after:right-0",
  "max-[800px]:[&_.sm-panel-list[data-numbering]_.sm-panel-item]:after:top-[0.12em]",
].join(" ");

export function SiteMenu() {
  const pathname = usePathname();

  return (
    <StaggeredMenu
      key={pathname}
      className={menuClassName}
      isFixed
      position="right"
      items={items}
      socialItems={socialItems}
      displaySocials
      displayItemNumbering
      accentColor="#8c70fa"
      colors={["#c4b5fd", "#8c70fa"]}
      menuButtonColor="#f4f0ea"
      openMenuButtonColor="#1c1c1e"
    />
  );
}
