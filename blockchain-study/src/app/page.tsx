"use client";

import { HashPlayground } from "@/components/playgrounds/HashPlayground";
import { BlockWithData } from "@/components/playgrounds/BlockWithData";
import { SingleBlockchainPlayground } from "@/components/playgrounds/SingleBlockchainPlayground";
import { useLanguage } from "@/contexts/LanguageContext";
import { NetworkPlayground } from "@/components/playgrounds/NetworkPlayground";
import { useSingleBlockchain } from "@/hooks/useSingleBlockchain";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const { blocks, miningBlock, miningNonce, mineBlockAtIndex, recalculateBlockHash, updateNonce } = useSingleBlockchain(1);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <div className="flex items-center gap-6">
            <nav className="text-sm font-medium text-slate-500 space-x-4">
              <a href="#hashing" className="hover:text-blue-600 transition-colors">{t.nav.hashing}</a>
              <a href="#block" className="hover:text-blue-600 transition-colors">{t.nav.block}</a>
              <a href="#chain" className="hover:text-blue-600 transition-colors">{t.nav.chain}</a>
              <a href="#network" className="hover:text-blue-600 transition-colors">{t.nav.network}</a>
            </nav>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
              className="px-3 py-1 text-sm font-bold bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              {language === 'en' ? 'RU' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <div className="pt-24 pb-32 space-y-16">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-slate-900">
            {t.hero.title} <br />
            <span className="text-blue-600">{t.hero.subtitle}</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.hero.description}
          </p>
        </section>

        {/* Section 1: Hashing */}
        <Section
          id="hashing"
          title={t.hashing.title}
          description={t.hashing.description}
        >
          <HashPlayground />
        </Section>

        {/* Section 2: The Block */}
        <Section
          id="block"
          title={t.block.title}
          description={t.block.description}
        >
          <BlockWithData
            size="large"
            blockNumber={blocks[0].index}
            prevHash={blocks[0].prevHash}
            initialData={typeof blocks[0].data === 'string' ? blocks[0].data : JSON.stringify(blocks[0].data)}
            initialNonce={blocks[0].nonce}
            initialHash={blocks[0].hash}
            miningNonce={miningBlock === 0 ? miningNonce : undefined}
            onDataChange={(data) => recalculateBlockHash(0, data)}
            onNonceChange={(nonce) => updateNonce(0, nonce)}
            onMineClick={() => mineBlockAtIndex(0)}
            isMining={miningBlock === 0}
          />
        </Section>

        {/* Section 3: The Chain */}
        <section id="chain" className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-3xl font-heading font-bold text-slate-900">{t.chain.title}</h3>
            <p className="text-lg text-slate-600 leading-relaxed">{t.chain.description}</p>
          </div>
          <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 shadow-inner">
            <SingleBlockchainPlayground orientation="horizontal" numberOfBlocks={3} />
          </div>
        </section>

        {/* Section 4: Distributed */}
        <NetworkPlayground t={t} />
      </div>
    </main>
  );
}

function Section({ id, title, description, children }: { id: string, title: string, description: string, children: React.ReactNode }) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center min-h-[60vh]">
      <div className="space-y-6">
        <h3 className="text-3xl font-heading font-bold text-slate-900">{title}</h3>
        <p className="text-lg text-slate-600 leading-relaxed">{description}</p>
      </div>
      <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 shadow-inner flex items-center justify-center min-h-[400px]">
        {children}
      </div>
    </section>
  );
}
