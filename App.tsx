import React, { useState } from 'react';
import { FormData, GeneratedContent } from './types';
import { InputStep } from './components/InputStep';
import { DraftingStep } from './components/DraftingStep';
import { LayoutStep } from './components/LayoutStep';

// Default initial state
const initialFormData: FormData = {
  name: '',
  family: '',
  oldAddress: { zip: '', location: '' },
  newAddress: { zip: '', location: '' }
};

const App: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    greetingText: '',
    originalImage: null,
    generatedImage: null,
    selectedStyle: 'Pop'
  });

  const handleInputComplete = (data: FormData) => {
    setFormData(data);
    setStep(2);
  };

  const handleDraftingComplete = (content: GeneratedContent) => {
    setGeneratedContent(content);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📦</span>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Moving Greetings AI</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>1. 入力</div>
            <span className="text-gray-300">→</span>
            <div className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>2. 作成</div>
            <span className="text-gray-300">→</span>
            <div className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>3. 印刷</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
          <InputStep 
            initialData={formData} 
            onNext={handleInputComplete} 
          />
        )}
        {step === 2 && (
          <DraftingStep 
            formData={formData} 
            onNext={handleDraftingComplete}
            onBack={() => setStep(1)} 
          />
        )}
        {step === 3 && (
          <LayoutStep 
            content={generatedContent} 
            onBack={() => setStep(2)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;