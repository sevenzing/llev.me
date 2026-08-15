import { ChainOfAchievements } from "@/components/chain/ChainOfAchievements";
import { TimeLoop } from "@/components/chain/TimeLoop";
import { WaveBackground } from "@/components/WaveBackground";

export default function AboutPage() {
  return (
    <div className="about-page">
      <WaveBackground />
      <div className="about-layout">
        <div className="about-side">
          <TimeLoop />
        </div>
        <ChainOfAchievements />
        <div className="about-side" />
      </div>
    </div>
  );
}
