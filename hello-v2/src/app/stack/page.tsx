import { FallingStack } from "@/components/stack/FallingStack";
import { WaveBackground } from "@/components/WaveBackground";

export default function StackPage() {
  return (
    <div className="relative min-h-dvh text-cream [overflow-anchor:none]">
      <WaveBackground />
      <main className="relative z-[1] flex min-h-dvh items-center justify-center px-5 py-24">
        <FallingStack />
      </main>
    </div>
  );
}
