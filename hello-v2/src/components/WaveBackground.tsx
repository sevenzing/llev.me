"use client";

import GradientWaves from "@/components/react-bits/GradientWaves";
import ClickSpark from "@/components/react-bits/ClickSpark";

interface WaveBackgroundProps {
  sparksEnabled?: boolean;
  mouseInteraction?: boolean;
}

export function WaveBackground({ sparksEnabled = false, mouseInteraction = false }: WaveBackgroundProps) {
  const waves = (
    <div className="wave-background-waves">
      <GradientWaves mouseInteraction={mouseInteraction} parallaxStrength={0.25} />
    </div>
  );

  return (
    <div className="wave-background">
      {sparksEnabled ? (
        <ClickSpark
          className="wave-background-spark"
          sparkColor="#f4f0ea"
          sparkSize={12}
          sparkRadius={32}
          sparkCount={10}
          duration={480}
        >
          {waves}
        </ClickSpark>
      ) : (
        waves
      )}
    </div>
  );
}
