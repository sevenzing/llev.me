import Link from "next/link";
import { ChainOfAchievements } from "@/components/chain/ChainOfAchievements";

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-nav">
        <Link href="/" className="about-nav-link">
          ← home
        </Link>
      </header>
      <ChainOfAchievements />
    </div>
  );
}
