import { Intro } from "@/components/intro/Intro";
import { WaveBackground } from "@/components/WaveBackground";

export default function Page() {
  return (
    <>
      <WaveBackground sparksEnabled mouseInteraction />
      <Intro />
    </>
  );
}
