
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import Spinner from '../Spinner';
import { blobToBase64 } from '../../utils';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setEditedImageUrl(null); // Clear previous result
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !imageFile) {
      setError('Silakan unggah gambar dan berikan instruksi pengeditan.');
      return;
    }
    setIsLoading(true);
    setError('');
    setEditedImageUrl('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imageBase64 = await blobToBase64(imageFile);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64, mimeType: imageFile.type } },
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      if (part?.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        setEditedImageUrl(`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`);
      } else {
        throw new Error("No edited image was returned.");
      }
    } catch (err) {
      setError('Gagal mengedit gambar. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Unggah gambar dan beri tahu AI cara mengeditnya.</p>
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
          <label className="block text-sm font-medium text-slate-700 mb-1">2. Deskripsikan Edit Anda</label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="cth., Tambahkan filter retro"
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading || !originalImageUrl}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !originalImageUrl || !prompt}
          className="w-full bg-gradient-to-r from-lime-500 to-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Mengedit...</> : 'Terapkan Edit'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h4 className="font-bold text-center mb-2">Asli</h4>
          {originalImageUrl ? (
            <img src={originalImageUrl} alt="Original" className="rounded-lg shadow-md w-full" />
          ) : (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Silakan unggah gambar</div>
          )}
        </div>
        <div>
          <h4 className="font-bold text-center mb-2">Diedit</h4>
          {isLoading ? (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center"><Spinner/></div>
          ) : editedImageUrl ? (
            <img src={editedImageUrl} alt="Edited" className="rounded-lg shadow-md w-full" />
          ) : (
            <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Gambar editan Anda akan muncul di sini</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
