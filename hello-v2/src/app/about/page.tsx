import { ChainOfAchievements } from "@/components/chain/ChainOfAchievements";
import { TimeLoop } from "@/components/chain/TimeLoop";
import { WaveBackground } from "@/components/WaveBackground";

export default function AboutPage() {
  return (
    <div className="relative min-h-dvh text-cream">
      <WaveBackground />
      <div className="flex min-h-dvh items-stretch">
        <div className="flex min-w-0 flex-1 justify-center">
          <TimeLoop />
        </div>
        <ChainOfAchievements />
        <div className="flex min-w-0 flex-1 justify-center" />
      </div>
    </div>
  );
}
