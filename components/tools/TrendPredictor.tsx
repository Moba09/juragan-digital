
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../Spinner';

const TrendPredictor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Silakan masukkan topik atau pertanyaan kompleks.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Analisis topik berikut dan prediksi tren masa depan: ${prompt}`,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });
      setResult(response.text);
    } catch (err) {
      setError('Gagal membuat prediksi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Ajukan pertanyaan kompleks atau berikan topik. AI akan menggunakan penalaran tingkat lanjut ('Mode Berpikir') untuk memberikan analisis terperinci dan memprediksi tren masa depan.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Dampak jangka panjang keuangan terdesentralisasi pada perbankan tradisional"
          className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Menganalisis...</> : 'Prediksi Tren'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-slate-800">Analisis Mendalam:</h4>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default TrendPredictor;
