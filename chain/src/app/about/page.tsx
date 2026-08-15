import { ChainOfAchievements } from "@/components/chain/ChainOfAchievements";
import { TimeLoop } from "@/components/chain/TimeLoop";
import { WaveBackground } from "@/components/WaveBackground";

export default function AboutPage() {
  return (
    <div className="about-page">
      <WaveBackground />
      <TimeLoop />
      <ChainOfAchievements />
    </div>
  );
}
