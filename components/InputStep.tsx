import React, { useRef, useState } from 'react';
import { FormData } from '../types';

interface InputStepProps {
  onNext: (data: FormData) => void;
  initialData: FormData;
}

export const InputStep: React.FC<InputStepProps> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [loadingZip, setLoadingZip] = useState<string | null>(null);

  // Refs for focusing next inputs
  const nameRef = useRef<HTMLInputElement>(null);
  const familyRef = useRef<HTMLInputElement>(null);
  const oldZipRef = useRef<HTMLInputElement>(null);
  const oldAddrRef = useRef<HTMLInputElement>(null);
  const newZipRef = useRef<HTMLInputElement>(null);
  const newAddrRef = useRef<HTMLInputElement>(null);

  const fetchAddress = async (zip: string, type: 'old' | 'new') => {
    if (zip.length !== 7) return;
    setLoadingZip(type);
    try {
      // Using zipcloud API (CORS might work, or use JSONP if needed. Using fetch for simplicity assuming proxy or direct access)
      // Note: In a real prod env, a robust proxy is needed. 
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
      const data = await response.json();
      if (data.results) {
        const addr = `${data.results[0].address1}${data.results[0].address2}`; // Pref + City/Ward
        setFormData(prev => ({
          ...prev,
          [type === 'old' ? 'oldAddress' : 'newAddress']: {
            ...prev[type === 'old' ? 'oldAddress' : 'newAddress'],
            location: addr
          }
        }));
      }
    } catch (e) {
      console.error("Zip fetch failed", e);
    } finally {
      setLoadingZip(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  // Helper to convert full-width numbers to half-width
  const toHalfWidth = (str: string) => {
    return str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'old' | 'new') => {
    let val = e.target.value;
    // Normalize full-width to half-width
    val = toHalfWidth(val);
    // Remove any remaining non-numeric characters
    val = val.replace(/[^0-9]/g, '');

    setFormData(prev => ({
      ...prev,
      [type === 'old' ? 'oldAddress' : 'newAddress']: {
        ...prev[type === 'old' ? 'oldAddress' : 'newAddress'],
        zip: val
      }
    }));
    if (val.length === 7) {
        fetchAddress(val, type);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center border-b pb-4">基本情報入力</h2>
      
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
          <input
            ref={nameRef}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="例：山田 太郎"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, familyRef)}
            autoFocus
          />
        </div>

        {/* Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">家族構成</label>
          <input
            ref={familyRef}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            placeholder="例：妻の花子、息子の健太、犬のポチ"
            value={formData.family}
            onChange={(e) => setFormData({ ...formData, family: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, oldZipRef)}
          />
        </div>

        {/* Old Address */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">引っ越し前の居住地</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">郵便番号 (ハイフンなし)</label>
              <input
                ref={oldZipRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={7}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="1234567"
                value={formData.oldAddress.zip}
                onChange={(e) => handleZipChange(e, 'old')}
                onKeyDown={(e) => handleKeyDown(e, oldAddrRef)}
              />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">都道府県・市町村</label>
                <div className="relative">
                  <input
                    ref={oldAddrRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="東京都渋谷区 (番地不要)"
                    value={formData.oldAddress.location}
                    onChange={(e) => setFormData({ ...formData, oldAddress: { ...formData.oldAddress, location: e.target.value } })}
                    onKeyDown={(e) => handleKeyDown(e, newZipRef)}
                  />
                  {loadingZip === 'old' && <div className="absolute right-3 top-2 text-xs text-gray-400">検索中...</div>}
                </div>
            </div>
          </div>
        </div>

        {/* New Address */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">引っ越し後の居住地</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">郵便番号 (ハイフンなし)</label>
              <input
                ref={newZipRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={7}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                placeholder="9876543"
                value={formData.newAddress.zip}
                onChange={(e) => handleZipChange(e, 'new')}
                onKeyDown={(e) => handleKeyDown(e, newAddrRef)}
              />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">都道府県・市町村</label>
                <div className="relative">
                  <input
                    ref={newAddrRef}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                    placeholder="神奈川県横浜市 (番地不要)"
                    value={formData.newAddress.location}
                    onChange={(e) => setFormData({ ...formData, newAddress: { ...formData.newAddress, location: e.target.value } })}
                    onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                            e.preventDefault();
                            // Optional: Focus the submit button or just blur
                            newAddrRef.current?.blur();
                         }
                    }}
                  />
                  {loadingZip === 'new' && <div className="absolute right-3 top-2 text-xs text-gray-400">検索中...</div>}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onNext(formData)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <span>生成</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};