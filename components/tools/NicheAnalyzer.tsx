
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from '../Spinner';

interface NicheAnalysis {
  nicheTitle: string;
  description: string;
  targetAudience: string;
  monetizationStrategies: string[];
  contentPillars: string[];
}

const NicheAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<NicheAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Silakan masukkan topik niche untuk dianalisis.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Berikan analisis terperinci untuk niche bisnis: "${prompt}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nicheTitle: { type: Type.STRING, description: "Judul yang menarik untuk niche tersebut." },
              description: { type: Type.STRING, description: "Ringkasan singkat tentang niche tersebut." },
              targetAudience: { type: Type.STRING, description: "Deskripsi terperinci tentang pelanggan atau audiens ideal." },
              monetizationStrategies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar 3-5 cara potensial untuk menghasilkan uang di niche ini."
              },
              contentPillars: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Daftar 3-5 topik utama atau kategori konten untuk difokuskan."
              },
            },
            required: ["nicheTitle", "description", "targetAudience", "monetizationStrategies", "contentPillars"]
          },
        },
      });
      
      // Trim potential markdown fences for JSON
      const jsonStr = response.text.trim().replace(/^```json\s*|```$/g, '');
      const analysis: NicheAnalysis = JSON.parse(jsonStr);
      setResult(analysis);

    } catch (err) {
      setError('Gagal menganalisis niche. Silakan coba topik lain.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Masukkan niche bisnis atau konten, dan AI akan memberikan analisis terstruktur tentang potensinya, termasuk target audiens, strategi monetisasi, dan ide konten.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Makanan hewan peliharaan berkelanjutan untuk penduduk kota"
          className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Menganalisis...</> : 'Analisis Niche'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
          <h3 className="text-2xl font-bold text-slate-800">{result.nicheTitle}</h3>
          <p className="text-slate-600">{result.description}</p>
          
          <div>
            <h4 className="font-semibold text-lg text-slate-700">Target Audiens</h4>
            <p className="text-slate-600 mt-1">{result.targetAudience}</p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-slate-700">Strategi Monetisasi</h4>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600">
              {result.monetizationStrategies.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-slate-700">Pilar Konten</h4>
            <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600">
              {result.contentPillars.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NicheAnalyzer;
