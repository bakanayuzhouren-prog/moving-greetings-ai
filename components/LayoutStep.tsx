import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent, PaperSize, PAPER_DIMENSIONS, LayoutElement } from '../types';

interface LayoutStepProps {
  content: GeneratedContent;
  onBack: () => void;
}

export const LayoutStep: React.FC<LayoutStepProps> = ({ content, onBack }) => {
  const [paperSize, setPaperSize] = useState<PaperSize>('postcard');
  
  // Initial elements
  const [elements, setElements] = useState<LayoutElement[]>([
    {
      id: 'image',
      type: 'image',
      x: 10,
      y: 10,
      width: 80,
      height: 40,
      content: content.generatedImage || content.originalImage || '', // Fallback to original if generated missing
    },
    {
      id: 'text',
      type: 'text',
      x: 10,
      y: 55,
      width: 80,
      height: 30,
      content: content.greetingText,
      style: { fontSize: '14px', lineHeight: '1.6' }
    }
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{x: number, y: number} | null>(null);
  const elemStart = useRef<{x: number, y: number, w: number, h: number} | null>(null);
  const mode = useRef<'move' | 'resize' | null>(null);

  // Mouse Handlers for Drag & Resize
  const handleMouseDown = (e: React.MouseEvent, id: string, action: 'move' | 'resize') => {
    e.stopPropagation();
    setActiveId(id);
    mode.current = action;
    dragStart.current = { x: e.clientX, y: e.clientY };
    
    const el = elements.find(el => el.id === id);
    if(el) {
        elemStart.current = { x: el.x, y: el.y, w: el.width, h: el.height };
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStart.current || !elemStart.current || !mode.current || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStart.current.x) / containerRect.width * 100;
    const deltaY = (e.clientY - dragStart.current.y) / containerRect.height * 100;

    setElements(prev => prev.map(el => {
      if (el.id !== activeId) return el;
      
      if (mode.current === 'move') {
        return {
          ...el,
          x: Math.max(0, Math.min(100 - el.width, elemStart.current!.x + deltaX)),
          y: Math.max(0, Math.min(100 - el.height, elemStart.current!.y + deltaY)),
        };
      } else {
        // Resize
        return {
            ...el,
            width: Math.max(10, elemStart.current!.w + deltaX),
            height: Math.max(5, elemStart.current!.h + deltaY)
        };
      }
    }));
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    mode.current = null;
  };

  const handlePrint = () => {
    window.print();
  };

  // If no image is available, remove image element
  useEffect(() => {
     if (!content.generatedImage && !content.originalImage) {
         setElements(prev => prev.filter(e => e.type !== 'text')); // Actually keep text, remove image
     }
  }, [content]);

  const currentDim = PAPER_DIMENSIONS[paperSize];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 animate-fade-in h-screen md:h-auto overflow-hidden md:overflow-visible">
      
      {/* Sidebar Controls (Hidden on Print) */}
      <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-md no-print flex flex-col gap-6 z-10">
        <div>
           <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium mb-4 block">
              &larr; コンテンツ編集に戻る
           </button>
           <h2 className="text-xl font-bold text-gray-800">印刷設定</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">用紙サイズ</label>
          <div className="flex gap-2">
            {(['postcard', 'a4'] as PaperSize[]).map((s) => (
                <button
                    key={s}
                    onClick={() => setPaperSize(s)}
                    className={`flex-1 py-2 px-3 text-sm rounded-lg border ${paperSize === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                    {PAPER_DIMENSIONS[s].name}
                </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500">
            <p className="mb-2">ヒント:</p>
            <ul className="list-disc list-inside space-y-1">
                <li>要素をドラッグして移動</li>
                <li>右下のハンドルでサイズ変更</li>
                <li>印刷時に背景画像を有効にしてください</li>
            </ul>
        </div>

        <div className="mt-auto pt-6 border-t">
            <button
                onClick={handlePrint}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                印刷する
            </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-grow bg-gray-200 p-8 overflow-auto flex justify-center items-start min-h-screen md:min-h-0 print-reset">
        <div 
            className="print-area bg-white shadow-2xl relative overflow-hidden transition-all duration-300"
            style={{
                width: `${currentDim.width}mm`,
                height: `${currentDim.height}mm`,
                // Scale for screen viewing based on postcard vs A4
                transform: `scale(${paperSize === 'postcard' ? 1.5 : 0.8})`,
                transformOrigin: 'top center'
            }}
            ref={containerRef}
            onClick={() => setActiveId(null)}
        >
            {elements.map(el => (
                <div
                    key={el.id}
                    className={`absolute group ${activeId === el.id ? 'z-50' : 'z-10'}`}
                    style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${el.width}%`,
                        height: `${el.height}%`,
                        cursor: 'move',
                        border: activeId === el.id ? '2px dashed #6366f1' : '1px dashed transparent' // Dashed line only when active
                    }}
                    onMouseDown={(e) => handleMouseDown(e, el.id, 'move')}
                >
                    {/* Content */}
                    <div className="w-full h-full overflow-hidden relative">
                         {el.type === 'image' && el.content ? (
                             <img src={el.content} className="w-full h-full object-cover pointer-events-none" alt="" />
                         ) : (
                             <div className="w-full h-full whitespace-pre-wrap p-2 text-gray-800" style={el.style}>
                                 {el.content}
                             </div>
                         )}
                    </div>

                    {/* Resize Handle (Only visible when active and NOT printing) */}
                    {activeId === el.id && (
                        <div 
                            className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-500 rounded-full cursor-se-resize flex items-center justify-center shadow-md no-print transform translate-x-1/2 translate-y-1/2 hover:scale-110 transition"
                            onMouseDown={(e) => handleMouseDown(e, el.id, 'resize')}
                        >
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};