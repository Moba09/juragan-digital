
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../Spinner';

type AspectRatio = "1:1" | "16:9" | "9:16";

const AIImageCreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Silakan masukkan deskripsi untuk gambar.');
      return;
    }
    setIsLoading(true);
    setError('');
    setImageUrl('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        setImageUrl(`data:image/png;base64,${base64ImageBytes}`);
      } else {
        throw new Error("No image was generated.");
      }
    } catch (err) {
      setError('Gagal membuat gambar. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Deskripsikan gambar yang ingin Anda buat. Jadilah sespesifik mungkin untuk hasil terbaik.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Astronot fotorealistik menunggang kuda di Mars"
          className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
         <div className="mt-4">
          <label htmlFor="aspect-ratio" className="block text-sm font-medium text-slate-700 mb-1">Rasio Aspek</label>
          <select
            id="aspect-ratio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading}
          >
            <option value="1:1">Persegi (1:1)</option>
            <option value="16:9">Lanskap (16:9)</option>
            <option value="9:16">Potret (9:16)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Membuat Gambar...</> : 'Buat Gambar'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-6 flex justify-center">
        {isLoading && (
            <div className={`bg-slate-100 rounded-lg flex items-center justify-center animate-pulse ${aspectRatio === '16:9' ? 'w-full aspect-video' : aspectRatio === '9:16' ? 'w-9/16 aspect-[9/16]' : 'w-64 h-64'}`}>
             <div className="text-center">
                <p className="text-slate-500">Menghasilkan...</p>
              </div>
          </div>
        )}
        {imageUrl && !isLoading && (
          <img src={imageUrl} alt={prompt} className="rounded-lg shadow-lg max-w-full h-auto" />
        )}
      </div>
    </div>
  );
};

export default AIImageCreator;
