"use client";

import Link from "next/link";
import GradientWaves from "@/components/react-bits/GradientWaves";
import TextLoop from "@/components/react-bits/TextLoop";
import { useEffect, useState } from "react";

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + Math.min(1, Math.max(0, t)) * (outMax - outMin);
}

export function Intro() {
  const [screenWidth, setScreenWidth] = useState(1200);
  useEffect(() => {
    const update = () => setScreenWidth(window.innerWidth || 1200);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const curviness = mapRange(screenWidth, 1920, 320, 40, 150);
  const hello = "Hello! I'm Lev";
  const separator = "✦";
  const separatorWithSpace = ` ${separator} `;
  const who = [
    "web3 dev",
    "wave dev",
    "wow dev",
    "vibe dev",
  ]
  const fullText = who.map(w => hello + separatorWithSpace + w).join(separatorWithSpace);
  return (
    <main className="intro">
      <div className="intro-waves">
        <GradientWaves 
          mouseInteraction={true}
          parallaxStrength={0.1}
        />
      </div>

      <div className="intro-vignette" />

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
          curviness={curviness}
          speed={72}
          fontSize={36}
          // letterSpacing={3}
          uppercase={true}
          // color="#f4f0ea"
          letterSpacing={2}
          ribbonWidth={72}
          ribbonColor="#8c70fa"
          pauseOnHover={false}
        />
      </div>

      <footer className="intro-footer">
        <p className="intro-tag">links</p>
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
      </footer>
    </main>
  );
}
