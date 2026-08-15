import { ChainOfAchievements } from "@/components/chain/ChainOfAchievements";
import { TimeLoop } from "@/components/chain/TimeLoop";
import { WaveBackground } from "@/components/WaveBackground";

export default function AboutPage() {
  return (
    <div className="relative min-h-dvh text-cream [overflow-anchor:none]">
      <WaveBackground />
      <div className="flex min-h-dvh items-stretch">
        <div className="relative min-h-0 min-w-0 flex-1">
          <TimeLoop />
        </div>
        <ChainOfAchievements />
        <div className="min-h-0 min-w-0 flex-1" />
      </div>
    </div>
  );
}
