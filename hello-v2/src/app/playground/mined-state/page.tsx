import { DemoFrame } from "@/components/playground/mined-state/shared";
import { DimDesaturateCard } from "@/components/playground/mined-state/DimDesaturateCard";
import { SealStampCard } from "@/components/playground/mined-state/SealStampCard";
import { TerminalHashCard } from "@/components/playground/mined-state/TerminalHashCard";
import { BreathingGlowCard } from "@/components/playground/mined-state/BreathingGlowCard";
import { AccentStripeCard } from "@/components/playground/mined-state/AccentStripeCard";

export default function MinedStatePlaygroundPage() {
  return (
    <div className="min-h-dvh bg-ink px-6 py-24 text-cream">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-lg font-medium tracking-[0.06em]">mined vs unmined — resting state ideas</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/50">
          The impact-drop animation covers the moment a block gets mined, but blocks need to look
          different at rest too — a glance at the chain should tell you which blocks are settled
          and which are still pending. Click &ldquo;mine&rdquo; / &ldquo;reset&rdquo; to toggle each
          card between states.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2">
          <DemoFrame
            index={1}
            title="Dim & desaturate"
            description="Unmined blocks sit at lower opacity with a dashed border and slightly desaturated content, like they haven't 'materialized' yet. Mined blocks snap to full opacity, saturation, and a solid grape border. Cheapest to implement — just conditional classes."
          >
            <DimDesaturateCard />
          </DemoFrame>

          <DemoFrame
            index={2}
            title="Corner seal"
            description="A small circular stamp in the top-right corner: a dashed, dim placeholder with '?' while pending, replaced by a solid grape seal with a checkmark once mined. Keeps the card body itself untouched, the badge carries all the meaning."
          >
            <SealStampCard />
          </DemoFrame>

          <DemoFrame
            index={3}
            title="Terminal hash"
            description="Most surgical option: only the hash row and a small status dot change. Pending shows a pulsing '░░░░' placeholder and a dim dot; mined shows the real hash with a soft glow and a solid grape dot. Good if you want minimal visual noise across the whole chain."
          >
            <TerminalHashCard />
          </DemoFrame>

          <DemoFrame
            index={4}
            title="Breathing glow"
            description="Unmined blocks are flat and inert. Mined blocks get a soft grape glow behind the card that slowly breathes (reusing the existing mine-pulse animation) — a persistent, low-key 'this is alive and validated' cue rather than a one-off effect."
          >
            <BreathingGlowCard />
          </DemoFrame>

          <DemoFrame
            index={5}
            title="Accent stripe + label"
            description="A vertical status stripe on the left edge: a dashed gray hazard-stripe pattern while pending, a solid grape-to-blue gradient once mined, paired with a small 'pending' / 'verified' pill in the header. Reads well as a scannable list/timeline signal."
          >
            <AccentStripeCard />
          </DemoFrame>
        </div>
      </div>
    </div>
  );
}
