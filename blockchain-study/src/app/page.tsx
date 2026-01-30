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
import { EcosystemPlayground } from "@/components/playgrounds/EcosystemPlayground";
import { DataValidityPlayground } from "@/components/playgrounds/DataValidityPlayground";
import { DataDemo } from "@/components/playgrounds/DataDemo";
import { CardBackground } from "@/components/ui/CardBackground";
import Snowfall from "react-snowfall";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Menu, X, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const navLinks = [
    { href: "#data", label: t.nav.data },
    { href: "#hashing", label: t.nav.hashing },
    { href: "#determinism", label: t.nav.determinism },
    { href: "#validity", label: t.nav.validity },
    { href: "#block", label: t.nav.block },
    { href: "#chain", label: t.nav.chain },
    { href: "#network", label: t.nav.network },
    { href: "#keys", label: t.nav.keys },
    { href: "#transactions", label: t.nav.transactions },
    { href: "#mempool", label: t.nav.mempool },
    { href: "#ecosystem", label: t.nav.ecosystem },
  ];

  // Close menu when clicking a link
  const handleLinkClick = (e: React.MouseEvent | null, href: string) => {
    if (e) e.preventDefault();
    setIsMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      // Update URL without jump
      window.history.pushState(null, '', href);

      // Wait for menu closing animation to settle if it was mobile
      const delay = isMenuOpen ? 300 : 0;
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth' });
      }, delay);
    }
  };

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
            <nav className="hidden xl:flex text-[11px] font-black uppercase tracking-widest text-slate-500 items-center gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
                className="px-3 py-1.5 text-xs font-black bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/40 rounded-xl transition-all shadow-sm"
              >
                {language === 'en' ? 'RU' : 'EN'}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="xl:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <nav className="flex flex-col p-6 gap-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
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
          onAnchorClick={handleLinkClick}
        >
          <DataDemo />
        </Section>

        {/* Hashing */}
        <Section
          id="hashing"
          title={t.hashing.title}
          description={t.hashing.description}
          instruction={t.hashing.instruction}
          withCard={false}
          onAnchorClick={handleLinkClick}
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
          onAnchorClick={handleLinkClick}
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
          onAnchorClick={handleLinkClick}
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
          onAnchorClick={handleLinkClick}
        >
          <MiningGame />
        </Section>

        {/* The Block */}
        <Section
          id="block"
          title={t.block.title}
          description={t.block.description}
          instruction={t.block.instruction}
          withCard={false}
          onAnchorClick={handleLinkClick}
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
          onAnchorClick={handleLinkClick}
        >
          <SingleBlockchainPlayground orientation="horizontal" numberOfBlocks={3} />
        </Section>

        {/* Distributed */}
        <NetworkPlayground t={t} onAnchorClick={handleLinkClick} />

        {/* Keys */}
        <Section
          id="keys"
          title={t.keys.title}
          description={t.keys.description}
          instruction={t.keys.instruction}
          layout="vertical"
          onAnchorClick={handleLinkClick}
        >
          <KeysAndSignatures />
        </Section>

        <Section
          id="transactions"
          title={t.transactions.title}
          description={t.transactions.description}
          instruction={t.transactions.instruction}
          layout="horizontal"
          onAnchorClick={handleLinkClick}
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
          onAnchorClick={handleLinkClick}
        >
          <MempoolPlayground />
        </Section>

        {/* Final Ecosystem */}
        <EcosystemPlayground onAnchorClick={handleLinkClick} />
      </div>
    </main>
  );
}



function Section({ id, title, description, instruction, layout = 'horizontal', withCard = true, onAnchorClick, children }: { id: string, title: string, description: string, instruction?: string, layout?: 'vertical' | 'horizontal' | undefined, withCard?: boolean, onAnchorClick?: (e: React.MouseEvent, href: string) => void, children: React.ReactNode }) {
  const cardClasses = withCard
    ? "bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-xl ring-1 ring-white/40 flex items-center justify-center min-h-[400px]"
    : "flex items-center justify-center min-h-[400px]";

  const TitleWithAnchor = (
    <div className="group flex items-center gap-3 relative">
      <h3 className="text-3xl font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
        <Highlight>{title}</Highlight>
      </h3>
      <a
        href={`#${id}`}
        onClick={(e) => onAnchorClick?.(e, `#${id}`)}
        className="opacity-0 group-hover:opacity-100 p-2 text-blue-500 hover:text-blue-700 transition-all transform translate-x-[-10px] group-hover:translate-x-0"
        aria-label={`Link to ${title}`}
      >
        <LinkIcon size={20} />
      </a>
    </div>
  );

  if (layout === 'horizontal') {
    return (
      <section id={id} className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center min-h-[60vh]">
        <div className="space-y-6">
          {TitleWithAnchor}
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
        <div className="space-y-6 max-w-4xl mx-auto text-center flex flex-col items-center">
          {TitleWithAnchor}
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
