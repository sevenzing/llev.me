"use client";

import { Highlight } from "@/components/ui/Highlight";
import { InteractionGuide } from "@/components/ui/InteractionGuide";
import { HashPlayground } from "@/components/playgrounds/HashPlayground";
import { HashComparator } from "@/components/playgrounds/HashComparator";
import { MiningGame } from "@/components/playgrounds/MiningGame";
import { BlockWithData } from "@/components/playgrounds/BlockWithData";
import { SingleBlockchainPlayground } from "@/components/playgrounds/SingleBlockchainPlayground";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkPlayground } from "@/components/playgrounds/NetworkPlayground";
import { useSingleBlockchain } from "@/hooks/useSingleBlockchain";
import { calculateBlockHash } from "@/lib/blockchain";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const blockExampleNumber = 711;
  const { blocks, miningBlock, miningNonce, mineBlockAtIndex, recalculateBlockHash, updateNonce } = useSingleBlockchain([
    {
      index: blockExampleNumber,
      nonce: 0,
      data: "Hello world!",
      prevHash: "b493ac361a9149c04f813695aee84fc7a39b3d2a83987294e4a5346f7ec4cfb5",
      hash: "5bfc4ce7f6435a4e49278938a2d3b93a7cf48eea596318f40c9419a163ca394b"
    }
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-slate-900 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-purple-400/30 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-pink-400/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <header className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-white/20 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <div className="flex items-center gap-6">
            <nav className="text-sm font-medium text-slate-600 space-x-4">
              <a href="#hashing" className="hover:text-blue-600 transition-colors">{t.nav.hashing}</a>
              <a href="#block" className="hover:text-blue-600 transition-colors">{t.nav.block}</a>
              <a href="#chain" className="hover:text-blue-600 transition-colors">{t.nav.chain}</a>
              <a href="#network" className="hover:text-blue-600 transition-colors">{t.nav.network}</a>
            </nav>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              className="px-3 py-1 text-sm font-bold bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/40 rounded-lg transition-all shadow-sm"
            >
              {language === 'en' ? 'RU' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-32 space-y-32 relative z-10">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-slate-900 drop-shadow-sm">
            {t.hero.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{t.hero.subtitle}</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {t.hero.description}
          </p>
        </section>

        {/* Section 1: Hashing */}
        <Section
          id="hashing"
          title={t.hashing.title}
          description={t.hashing.description}
          instruction="Type anything in the box to the right. Watch how the Hash changes completely with even a single character difference!"
        >
          <HashPlayground />
        </Section>

        {/* Section 1.5: Determinism */}
        <section className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-heading font-bold text-slate-900">Determinism</h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              <Highlight>The same input always produces the same **Hash**. It doesn't matter if you're in New York or Moscow, using a phone or a supercomputer.</Highlight>
            </p>
            <InteractionGuide text="Type the EXACT same text in both boxes (e.g. 'Hello'). Watch the equality sign light up green!" />
          </div>
          <HashComparator initialA="Привет" initialB="Hello" />
        </section>

        {/* Section 1.6: The Mining Game */}
        <Section
          id="mining"
          title="The Mining Game"
          description="We can say that data is valid if **Hash** of the data starts with 4 zeros '0000'. Let's add additional number called **Nonce** and try to increase it until Hash starts with four zeros."
          instruction="Try to find a **Nonce** that makes the Hash start with '0000'. You can guess manually, or wait for a hint!"
        >
          <MiningGame />
        </Section>

        {/* Section 2: The Block */}
        <Section
          id="block"
          title={t.block.title}
          description={t.block.description}
          instruction="Change the data to anything you want to store in Block. Then find the Nonce. Or dont waste your time and click **Mine** and fix the Block!"
        >
          <BlockWithData
            size="large"
            blockNumber={blocks[0].index}
            prevHash={blocks[0].prevHash}
            initialData={typeof blocks[0].data === 'string' ? blocks[0].data : JSON.stringify(blocks[0].data)}
            initialNonce={blocks[0].nonce}
            initialHash={blocks[0].hash}
            miningNonce={miningBlock === blockExampleNumber ? miningNonce : undefined}
            onDataChange={(data) => recalculateBlockHash(blockExampleNumber, data)}
            onNonceChange={(nonce) => updateNonce(blockExampleNumber, nonce)}
            onMineClick={() => mineBlockAtIndex(blockExampleNumber)}
            isMining={miningBlock === blockExampleNumber}
          />
        </Section>

        {/* Section 3: The Chain */}
        <section id="chain" className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-3xl font-heading font-bold text-slate-900">
              <Highlight>{t.chain.title}</Highlight>
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed">
              <Highlight>{t.chain.description}</Highlight>
            </p>
            <InteractionGuide text="Mine all blocks to fix the Chain. Change data in Block #0. See how it breaks all blocks. Well, to change data in chain you need to mine everything after it!" />
          </div>
          <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl ring-1 ring-white/40">
            <SingleBlockchainPlayground orientation="horizontal" numberOfBlocks={3} />
          </div>
        </section>

        {/* Section 4: Distributed */}
        <NetworkPlayground t={t} />
      </div>
    </main>
  );
}



function Section({ id, title, description, instruction, children }: { id: string, title: string, description: string, instruction?: string, children: React.ReactNode }) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center min-h-[60vh]">
      <div className="space-y-6">
        <h3 className="text-3xl font-heading font-bold text-slate-900">
          <Highlight>{title}</Highlight>
        </h3>
        <p className="text-lg text-slate-600 leading-relaxed">
          <Highlight>{description}</Highlight>
        </p>
        {instruction && <InteractionGuide text={instruction} />}
      </div>
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl ring-1 ring-white/40 flex items-center justify-center min-h-[400px]">
        {children}
      </div>
    </section>
  );
}
