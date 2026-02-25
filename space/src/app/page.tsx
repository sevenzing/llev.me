import { SpiralAnimation } from "@/components/ui/spiral-animation";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background animation */}
      <div className="absolute inset-0 z-0">
        <SpiralAnimation />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="text-5xl font-bold">Hello, Spiral World 🌌</h1>
      </div>
    </main>
  );
}
