import React, { useState } from 'react';
import { NOTEBOOK_PAGES } from '../data/notebook';
import { NotebookPage } from '../types/game';
import { parseCompositionString } from '../services/musicGrammar';
import { audioEngine, triggerHaptic } from '../services/audioEngine';
import { BookOpen, X, Lock, CheckCircle, Copy, Play, Sparkles } from 'lucide-react';

interface NotebookModalProps {
  unlockedPageIds: string[];
  onLoadCodeToComposer?: (code: string) => void;
  onClose: () => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  unlockedPageIds,
  onLoadCodeToComposer,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activePageId, setActivePageId] = useState<string>(NOTEBOOK_PAGES[0].id);
  const [copiedPageId, setCopiedPageId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Tudo' },
    { id: 'LORE', label: 'Regras' },
    { id: 'GRAMMAR', label: 'Gramática' },
    { id: 'RIVALS', label: 'Dossiês' },
    { id: 'SECRETS', label: 'Códigos' },
    { id: 'THEORY', label: 'Teoria' },
  ];

  const filteredPages = NOTEBOOK_PAGES.filter(p =>
    selectedCategory === 'ALL' ? true : p.category === selectedCategory
  );

  const activePage = NOTEBOOK_PAGES.find(p => p.id === activePageId) || NOTEBOOK_PAGES[0];
  const isPageUnlocked = activePage.isUnlockedByDefault || unlockedPageIds.includes(activePage.id);

  const handleCopySampleCode = (code: string, pageId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPageId(pageId);
    audioEngine.playKeyClick();
    triggerHaptic('confirm');
    setTimeout(() => setCopiedPageId(null), 1500);
  };

  const handlePlaySample = (code: string) => {
    const notes = parseCompositionString(code);
    audioEngine.playSequence(notes, 140, 'original');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-3xl w-full flex flex-col rounded-3xl overflow-hidden shadow-2xl border-4 border-[#3c3022] bg-[#221c14] animate-in zoom-in-95 duration-200 max-h-[90vh] my-auto">
        {/* Notebook Top Spiral Header Bar */}
        <div className="bg-[#382b1d] p-3.5 border-b border-[#4d3c2a] flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#D5B84A]" />
            <div>
              <h2 className="font-handwriting text-xl font-bold leading-none text-[#faf5eb]">O Caderno de Códigos</h2>
              <span className="text-[10px] text-[#baa48d] uppercase tracking-wider">Anotações Secretas do Recreio</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#2a2016] text-[#baa48d] hover:text-white border border-[#4d3c2a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notebook Content Workspace */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden min-h-0">
          {/* Left Index Column (Page List) */}
          <div className="md:col-span-5 bg-[#2a2217] border-r border-[#443524] p-3 flex flex-col gap-2 overflow-y-auto max-h-[190px] md:max-h-full">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    selectedCategory === cat.id
                      ? 'bg-[#D5B84A] text-black'
                      : 'bg-[#1c160f] text-[#baa48d] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Pages List */}
            <div className="flex flex-col gap-1.5">
              {filteredPages.map(page => {
                const unlocked = page.isUnlockedByDefault || unlockedPageIds.includes(page.id);
                const isSelected = page.id === activePageId;

                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => {
                      setActivePageId(page.id);
                      audioEngine.playKeyClick();
                    }}
                    className={`p-2.5 rounded-xl text-left transition flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#faf5eb] text-[#23272d] border-[#d5c5ae] shadow-md font-bold'
                        : 'bg-[#1f1911] text-[#c9b7a3] border-[#362a1d] hover:bg-[#2c2217]'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] font-mono opacity-60">P.{page.pageNumber}</span>
                      <span className="text-xs truncate">{page.title}</span>
                    </div>

                    <div>
                      {unlocked ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Paper Page View */}
          <div className="md:col-span-7 notebook-paper p-4 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[420px] md:max-h-full">
            {isPageUnlocked ? (
              <div className="flex flex-col gap-4">
                {/* Page Title & Stickers */}
                <div className="border-b-2 border-[#bfae95] pb-2 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#8c785f] uppercase tracking-wider font-mono">
                      PÁGINA {activePage.pageNumber} • {activePage.category}
                    </span>
                    <h3 className="font-handwriting text-2xl font-bold text-[#23272d] leading-tight mt-0.5">
                      {activePage.title}
                    </h3>
                  </div>

                  {/* Sticker Badges */}
                  <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                    {activePage.stickers.map((stk, i) => (
                      <span
                        key={i}
                        className="bg-[#D5B84A] text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-[#a68d31] rotate-[-2deg]"
                      >
                        {stk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Handwritten Content Lines */}
                <div className="flex flex-col gap-2 font-handwriting text-base sm:text-lg text-[#23272d] leading-relaxed">
                  {activePage.content.map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>

                {/* Sample Code Interactive Box if present */}
                {activePage.sampleCode && (
                  <div className="mt-3 bg-[#e8decb] border-2 border-dashed border-[#b39e80] rounded-2xl p-3.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#544738]">
                      <span>CÓDIGO DE EXEMPLO / HIT:</span>
                      <span className="font-mono text-[10px]">Formato 3310</span>
                    </div>

                    <div className="font-lcd text-lg text-[#101112] bg-[#B7C6A3] p-2.5 rounded-lg border border-[#8e9e7b] break-all shadow-inner tracking-wider">
                      {activePage.sampleCode}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handlePlaySample(activePage.sampleCode!)}
                        className="flex-1 py-1.5 bg-[#23272d] text-[#faf5eb] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#343a42] transition"
                      >
                        <Play className="w-3.5 h-3.5 text-[#D5B84A]" />
                        <span>Ouvir Exemplo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopySampleCode(activePage.sampleCode!, activePage.id)}
                        className="flex-1 py-1.5 bg-[#d5c5ae] text-[#23272d] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#c4b197] transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPageId === activePage.id ? 'Copiado!' : 'Copiar Código'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Locked Page Placeholder */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#e0d3be] flex items-center justify-center text-[#73634e] mb-3 shadow">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-handwriting text-2xl font-bold text-[#3d3326] mb-1">Página Bloqueada</h3>
                <p className="text-xs text-[#635441] max-w-xs mb-3">
                  Você ainda não descobriu estas anotações no pátio.
                </p>
                <div className="bg-[#ede2ce] border border-[#d1c0a5] px-3 py-1.5 rounded-xl text-xs font-mono text-[#544634]">
                  Como desbloquear: {activePage.unlockConditionHint}
                </div>
              </div>
            )}

            {/* Page Footer */}
            <div className="mt-4 pt-2 border-t border-[#bfae95] text-[10px] text-[#73634e] flex justify-between font-mono">
              <span>Caderno de Códigos • Recreio 2000</span>
              <span>Página {activePage.pageNumber} de {NOTEBOOK_PAGES.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
