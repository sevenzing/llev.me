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
import { KeysAndSignatures } from "@/components/playgrounds/KeysAndSignatures";
import { TransactionPlayground } from "@/components/playgrounds/TransactionPlayground";
import { MempoolPlayground } from "@/components/playgrounds/MempoolPlayground";
import { DataValidityPlayground } from "@/components/playgrounds/DataValidityPlayground";
import { DataDemo } from "@/components/playgrounds/DataDemo";
import { CardBackground } from "@/components/ui/CardBackground";
import Snowfall from "react-snowfall";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { language, setLanguage, t } = useLanguage();
  const params = useSearchParams();
  const blockExampleNumber = 711;
  const showSnow = params.get("snow") === "true";
  const { blocks, miningBlock, miningNonce, mineBlockAtIndex, recalculateBlockHash, updateNonce } = useSingleBlockchain([
    {
      index: blockExampleNumber,
      nonce: 0,
      data: "Hello world!",
      prevHash: "0000ac361a9149c04f813695aee84fc7a39b3d2a83987294e4a5346f7ec4cfb4",
      hash: "5bfc4ce7f6435a4e49278938a2d3b93a7cf48eea596318f40c9419a163ca394b"
    }
  ]);

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-slate-900 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {showSnow && <Snowfall color="#dee4fd" style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
      }} />}

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
              <a href="#data" className="hover:text-blue-600 transition-colors">{t.nav.data}</a>
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
        {/* Hero / Intro */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-slate-900 drop-shadow-sm">
            {t.intro.title} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{t.intro.subtitle}</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {t.intro.description}
          </p>
        </section>

        {/* The Data */}
        <Section
          id="data"
          title={t.data.title}
          description={t.data.description}
          instruction={t.data.instruction}
          withCard={false}
        >
          <DataDemo />
        </Section>

        {/* Hashing */}
        <Section
          id="hashing"
          title={t.hashing.title}
          description={t.hashing.description}
          instruction="Type anything in the box to the right. Watch how the Hash changes completely with even a single character difference!"
          withCard={false}
        >
          <HashPlayground />
        </Section>

        {/* Determinism */}
        <Section
          id="determinism"
          title={t.determinism.title}
          description={t.determinism.description}
          instruction={t.determinism.instruction}
          withCard={false}
        >
          <HashComparator initialA="Привет" initialB="Hello" />
        </Section>

        {/* Data Validity */}
        <Section
          id="validity"
          title={t.dataValidity.title}
          description={t.dataValidity.description}
          instruction={t.dataValidity.instruction}
          withCard={false}
        >
          <DataValidityPlayground />
        </Section>

        {/* The Mining Game */}
        <Section
          id="mining"
          title={t.miningGame.title}
          description={t.miningGame.description}
          instruction={t.miningGame.instruction}
          withCard={false}
        >
          <MiningGame />
        </Section>

        {/* The Block */}
        <Section
          id="block"
          title={t.block.title}
          description={t.block.description}
          instruction="Change the data to anything you want to store in Block. Then find the Nonce. Or dont waste your time and click Mine and fix the Block!"
          withCard={false}
        >
          <CardBackground className="flex flex-col items-center justify-center p-4 w-full">
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
          </CardBackground>
        </Section>

        {/* The Chain */}
        <Section
          id="chain"
          title={t.chain.title}
          description={t.chain.description}
          instruction="Mine all blocks to fix the Chain. Change data in Block #0. See how it breaks all blocks. Well, to change data in chain you need to mine everything after it!"
          layout="vertical"
        >
          <SingleBlockchainPlayground orientation="horizontal" numberOfBlocks={3} />
        </Section>

        {/* Distributed */}
        <NetworkPlayground t={t} />

        {/* Keys */}
        <Section
          id="keys"
          title={t.keys.title}
          description={t.keys.description}
          instruction="Generate a wallet. Copy the Private Key to sign a message. Then copy the Public Key and Signature to verify it!"
          layout="vertical"
        >
          <KeysAndSignatures />
        </Section>

        <Section
          id="transactions"
          title={t.transactions.title}
          description={t.transactions.description}
          instruction={t.transactions.instruction}
          layout="horizontal"
        >
          <TransactionPlayground />
        </Section>

        {/* Mempool & Mining */}
        <Section
          id="mempool"
          title={t.mempool.title}
          description={t.mempool.description}
          instruction={t.mempool.instruction}
          layout="vertical"
        >
          <MempoolPlayground />
        </Section>
      </div>
    </main>
  );
}



function Section({ id, title, description, instruction, layout = 'horizontal', withCard = true, children }: { id: string, title: string, description: string, instruction?: string, layout?: 'vertical' | 'horizontal' | undefined, withCard?: boolean, children: React.ReactNode }) {
  const cardClasses = withCard
    ? "bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl ring-1 ring-white/40 flex items-center justify-center min-h-[400px]"
    : "flex items-center justify-center min-h-[400px]";

  if (layout === 'horizontal') {
    return (
      <section id={id} className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center min-h-[60vh]">
        <div className="space-y-6">
          <h3 className="text-3xl font-heading font-bold text-slate-900">
            <Highlight>{title}</Highlight>
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
            <Highlight>{description}</Highlight>
          </p>
          {instruction && <InteractionGuide text={instruction} />}
        </div>
        <div className={cardClasses}>
          {children}
        </div>
      </section>
    );
  } else {
    return (
      <section id={id} className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="space-y-6 max-w-3xl mx-auto text-center">
          <h3 className="text-3xl font-heading font-bold text-slate-900">
            <Highlight>{title}</Highlight>
          </h3>
          <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
            <Highlight>{description}</Highlight>
          </p>
          {instruction && <InteractionGuide text={instruction} />}
        </div>
        <div className={cardClasses}>
          {children}
        </div>
      </section>
    );
  }
}
