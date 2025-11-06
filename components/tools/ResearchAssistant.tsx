
import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import Spinner from '../Spinner';

interface Source {
  uri: string;
  title: string;
}

const ResearchAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useLocation, setUseLocation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Silakan masukkan pertanyaan.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    setSources([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let config: any = { tools: [{ googleSearch: {} }] };
      
      if (useLocation) {
        config.tools = [{ googleMaps: {} }];
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          config.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          };
        } catch (geoError) {
          throw new Error("Tidak dapat memperoleh lokasi. Harap aktifkan layanan lokasi.");
        }
      }

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: config,
      });

      setResult(response.text);

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const extractedSources = groundingChunks.map(chunk => ({
            uri: chunk.web?.uri || chunk.maps?.uri || '#',
            title: chunk.web?.title || chunk.maps?.title || 'Sumber'
        })).filter(source => source.uri !== '#');
        setSources(extractedSources);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendapatkan hasil. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Ajukan pertanyaan untuk mendapatkan jawaban terkini dari Google Search. Untuk kueri berbasis lokasi, centang kotak di bawah ini.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Siapa yang memenangkan balapan F1 terbaru? atau Apa saja kafe yang bagus di dekat saya?"
          className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
         <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="useLocation"
            checked={useLocation}
            onChange={(e) => setUseLocation(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <label htmlFor="useLocation" className="ml-2 block text-sm text-gray-900">
            Gunakan lokasi saya saat ini (untuk kueri Google Maps)
          </label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Mencari...</> : 'Dapatkan Jawaban'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-slate-800">Jawaban:</h4>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap">{result}</div>
          {sources.length > 0 && (
            <div className="mt-4">
              <h5 className="font-semibold text-sm text-slate-700">Sumber:</h5>
              <ul className="list-disc list-inside mt-2 text-sm">
                {sources.map((source, index) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchAssistant;
