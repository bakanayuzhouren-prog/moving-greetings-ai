import React, { useState, useEffect } from 'react';
import { FormData, GeneratedContent, ImageStyle } from '../types';
import { generateGreeting, generateStyledImage } from '../services/geminiService';

interface DraftingStepProps {
  formData: FormData;
  onNext: (content: GeneratedContent) => void;
  onBack: () => void;
}

export const DraftingStep: React.FC<DraftingStepProps> = ({ formData, onNext, onBack }) => {
  const [content, setContent] = useState<GeneratedContent>({
    greetingText: '',
    originalImage: null,
    generatedImage: null,
    selectedStyle: 'Pop',
  });
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    // Generate text on mount if empty
    if (!content.greetingText) {
      setIsGeneratingText(true);
      generateGreeting(formData)
        .then((text) => setContent(prev => ({ ...prev, greetingText: text })))
        .finally(() => setIsGeneratingText(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent(prev => ({ 
            ...prev, 
            originalImage: reader.result as string,
            generatedImage: null // Reset generated if new upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!content.originalImage) return;
    setIsGeneratingImage(true);
    try {
      const styledImg = await generateStyledImage(content.originalImage, content.selectedStyle);
      setContent(prev => ({ ...prev, generatedImage: styledImg }));
    } catch (e) {
      alert("画像の生成に失敗しました。");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const styles: ImageStyle[] = ['Simple', 'Pop', 'Cheap', 'Gorgeous'];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium">
          &larr; 戻る
        </button>
        <h2 className="text-2xl font-bold text-gray-800">コンテンツの作成</h2>
        <div className="w-16"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Text Editor */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm mr-2">1</span>
            挨拶文の編集
          </h3>
          <div className="flex-grow relative">
            {isGeneratingText && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            )}
            <textarea
              className="w-full h-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-base leading-relaxed"
              value={content.greetingText}
              onChange={(e) => setContent({ ...content, greetingText: e.target.value })}
            />
          </div>
          <button 
            onClick={() => {
                setIsGeneratingText(true);
                generateGreeting(formData).then(t => {
                    setContent({...content, greetingText: t});
                    setIsGeneratingText(false);
                });
            }}
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 self-end"
          >
            再生成する &#8635;
          </button>
        </div>

        {/* Right: Image Generator */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
             <span className="bg-pink-100 text-pink-700 py-1 px-3 rounded-full text-sm mr-2">2</span>
             画像の作成
          </h3>
          
          <div className="mb-4">
             <label className="block w-full cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-100 transition">
                <span className="text-gray-500">
                    {content.originalImage ? "画像を変更する" : "写真をアップロード"}
                </span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
             </label>
          </div>

          {content.originalImage && (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2 justify-center">
                    {styles.map(style => (
                        <button
                            key={style}
                            onClick={() => setContent({...content, selectedStyle: style})}
                            className={`px-3 py-1 rounded-full text-sm border transition ${
                                content.selectedStyle === style 
                                ? 'bg-pink-500 text-white border-pink-500 shadow-md' 
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className={`bg-pink-600 text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2 hover:bg-pink-700 transition ${isGeneratingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isGeneratingImage ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                生成中...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                画像生成
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                         <img src={content.originalImage} alt="Original" className="w-full h-full object-cover" />
                         <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-2 py-1">元画像</span>
                    </div>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border flex items-center justify-center">
                        {content.generatedImage ? (
                            <>
                                <img src={content.generatedImage} alt="Generated" className="w-full h-full object-cover" />
                                <span className="absolute bottom-0 left-0 bg-pink-600/80 text-white text-xs px-2 py-1">生成画像</span>
                            </>
                        ) : (
                            <span className="text-gray-400 text-xs">生成待ち</span>
                        )}
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => onNext(content)}
          disabled={!content.greetingText}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          レイアウト調整へ
        </button>
      </div>
    </div>
  );
};