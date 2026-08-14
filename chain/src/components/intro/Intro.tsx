"use client";

import Link from "next/link";
import GradientWaves from "@/components/react-bits/GradientWaves";
import TextLoop from "@/components/react-bits/TextLoop";

export function Intro() {

  const text = "Hello! I'm Lev";
  const separator = "✦";
  const separatorWithSpace = ` ${separator} `;
  const who = [
    "web3 dev",
    "wave dev",
    "wow dev",
    "vibe dev",
  ]
  const fullText = who.map(w => text + separatorWithSpace + w).join(separatorWithSpace);
  return (
    <main className="intro">
      <div className="intro-waves">
        <GradientWaves/>
      </div>

      {/* <div className="intro-vignette" /> */}

      <header className="intro-nav">
        <Link href="/about" className="intro-nav-link">
          about
        </Link>
      </header>

      <div className="intro-hero">
        <TextLoop
          text={fullText}
          shape="wave"
          separator={separator}
          speed={72}
          fontSize={36}
          // letterSpacing={3}
          uppercase={true}
          // color="#f4f0ea"
          ribbonWidth={72}
          ribbonColor="#8c70fa"
          pauseOnHover={false}
        />
      </div>

      {/* <footer className="intro-footer">
        <p className="intro-tag">developer with taste</p>
        <Link href="/about" className="intro-cta">
          the chain is broken
          <span aria-hidden> →</span>
        </Link>
        <nav className="intro-socials" aria-label="social">
          <a href="https://github.com/sevenzing" target="_blank" rel="noreferrer">
            github
          </a>
          <a href="https://linkedin.com/in/lymarenkolev/" target="_blank" rel="noreferrer">
            linkedin
          </a>
          <a href="https://instagram.com/llevchiks/" target="_blank" rel="noreferrer">
            instagram
          </a>
        </nav>
      </footer> */}
    </main>
  );
}
