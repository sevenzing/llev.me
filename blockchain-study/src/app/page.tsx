"use client";

import { HashPlayground } from "@/components/playgrounds/HashPlayground";
import { BlockWithData } from "@/components/playgrounds/BlockWithData";
import { Blockchain } from "@/components/playgrounds/Blockchain";
import { NetworkView } from "@/components/playgrounds/NetworkView";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export default function Home() {
  const { language, setLanguage, t } = useLanguage();

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

      <div className="pt-24 pb-32 space-y-32">
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
          <BlockWithData size="large" />
        </Section>

        {/* Section 3: The Chain */}
        <section id="chain" className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="space-y-6 max-w-3xl">
            <h3 className="text-3xl font-heading font-bold text-slate-900">{t.chain.title}</h3>
            <p className="text-lg text-slate-600 leading-relaxed">{t.chain.description}</p>
          </div>
          <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 shadow-inner">
            <Blockchain orientation="horizontal" />
          </div>
        </section>

        {/* Section 4: Distributed */}
        <NetworkSection t={t} />
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

function NetworkSection({ t }: { t: any }) {
  const [networkBlockchain, setNetworkBlockchain] = useState([
    { index: 1, data: "Genesis", hash: "0x1a2b", prevHash: "0x0000" }
  ]);
  const [selectedNode, setSelectedNode] = useState("A");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFn, setSyncFn] = useState<(() => void) | null>(null);

  const handleAddBlock = () => {
    const newIndex = networkBlockchain.length + 1;
    const prevBlock = networkBlockchain[networkBlockchain.length - 1];
    const newBlock = {
      index: newIndex,
      data: `Transaction ${newIndex}`,
      hash: `0x${Math.random().toString(16).slice(2, 6)}`,
      prevHash: prevBlock.hash,
    };
    setNetworkBlockchain([...networkBlockchain, newBlock]);
  };

  const handleSync = () => {
    if (syncFn) {
      syncFn();
    }
  };

  return (
    <section id="network" className="max-w-7xl mx-auto px-6 space-y-8">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h3 className="text-3xl font-heading font-bold text-slate-900">{t.network.title}</h3>
          <p className="text-lg text-slate-600 leading-relaxed">{t.network.description}</p>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 shadow-inner">
            <NetworkView
              onBlockchainChange={setNetworkBlockchain}
              onSelectedNodeChange={setSelectedNode}
              onSyncingChange={setIsSyncing}
              onSyncRequest={(fn) => setSyncFn(() => fn)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleAddBlock}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-bold"
            >
              + Block to {selectedNode}
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors text-xs font-bold"
            >
              {isSyncing ? "Syncing..." : `Sync from ${selectedNode}`}
            </button>
          </div>
        </div>
      </div>
      <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200 shadow-inner">
        <NetworkBlockchain blocks={networkBlockchain} onBlocksChange={setNetworkBlockchain} />
      </div>
    </section>
  );
}

function NetworkBlockchain({ blocks, onBlocksChange }: { blocks: any[], onBlocksChange: (blocks: any[]) => void }) {
  const handleDataChange = (index: number, newData: string) => {
    const updated = [...blocks];
    updated[index].data = newData;
    onBlocksChange(updated);
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 justify-center">
        {blocks.map((block, index) => (
          <div key={block.index} className="relative">
            <div className="p-3 rounded-lg shadow border-2 bg-emerald-50 border-emerald-200 w-52">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-heading font-bold text-slate-800">Block #{block.index}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">✓</span>
              </div>
              <div className="space-y-1.5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Data</label>
                  <input
                    type="text"
                    value={block.data}
                    onChange={(e) => handleDataChange(index, e.target.value)}
                    className="w-full p-1.5 rounded border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Prev Hash</label>
                  <div className="w-full p-1.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-slate-600 break-all">
                    {block.prevHash.slice(0, 6)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Hash</label>
                  <div className="w-full p-1.5 rounded border font-mono text-xs bg-emerald-100 text-emerald-800 border-emerald-200 break-all">
                    {block.hash.slice(0, 6)}
                  </div>
                </div>
              </div>
            </div>
            {index < blocks.length - 1 && (
              <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 hidden lg:block">
                <div className="text-2xl text-emerald-400">→</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
