import { FallingStack } from "@/components/stack/FallingStack";
import { FluxLoop } from "@/components/stack/FluxLoop";
import { WaveBackground } from "@/components/WaveBackground";

export default function StackPage() {
  return (
    <div className="relative min-h-dvh text-cream [overflow-anchor:none]">
      <WaveBackground />
      <div className="flex min-h-dvh items-stretch">
        <div className="min-h-0 min-w-0 flex-1" />
        <main className="relative z-[1] flex w-[min(420px,calc(100%-40px))] flex-none items-center py-24">
          <FallingStack />
        </main>
        <div className="relative min-h-0 min-w-0 flex-1">
          <FluxLoop />
        </div>
      </div>
    </div>
  );
}
