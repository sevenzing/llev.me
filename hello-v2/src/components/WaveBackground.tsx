"use client";

import GradientWaves from "@/components/react-bits/GradientWaves";
import ClickSpark from "@/components/react-bits/ClickSpark";

interface WaveBackgroundProps {
  sparksEnabled?: boolean;
  mouseInteraction?: boolean;
}

export function WaveBackground({ sparksEnabled = false, mouseInteraction = false }: WaveBackgroundProps) {
  const waves = (
    <div className="h-full">
      <GradientWaves mouseInteraction={mouseInteraction} parallaxStrength={0.25} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-0">
      {sparksEnabled ? (
        <ClickSpark
          className="h-full [&_canvas]:z-[1]"
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
