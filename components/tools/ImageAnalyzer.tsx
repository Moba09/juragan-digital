
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../Spinner';
import { blobToBase64 } from '../../utils';

const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('Deskripsikan gambar ini secara detail.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setResult(''); // Clear previous result
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Silakan unggah gambar untuk dianalisis.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imageBase64 = await blobToBase64(imageFile);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType: imageFile.type } },
            { text: prompt },
          ],
        },
      });

      setResult(response.text);
    } catch (err) {
      setError('Gagal menganalisis gambar. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Unggah gambar dan ajukan pertanyaan tentangnya, atau gunakan prompt default untuk mendapatkan deskripsi mendetail.</p>
      <div className="mb-4">
        {imageUrl ? (
            <img src={imageUrl} alt="Uploaded for analysis" className="max-h-64 rounded-lg shadow-md mx-auto" />
          ) : (
            <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Gambar Anda akan muncul di sini</div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">1. Unggah Gambar</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">2. Ajukan Pertanyaan (atau gunakan default)</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading || !imageUrl}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !imageUrl}
          className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Menganalisis...</> : 'Analisis Gambar'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {result && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-slate-800">Hasil Analisis:</h4>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
