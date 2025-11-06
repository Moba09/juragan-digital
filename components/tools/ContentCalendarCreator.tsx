import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Spinner from '../Spinner';

interface ContentIdea {
  day: string;
  idea: string;
  format: string;
  details: string;
}

const ContentCalendarCreator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('1 minggu');
  const [result, setResult] = useState<ContentIdea[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      setError('Silakan masukkan topik untuk kalender konten.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Buat kalender konten selama ${duration} untuk topik: "${topic}". Berikan berbagai ide dan format konten.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "Hari atau tanggal untuk posting konten." },
                idea: { type: Type.STRING, description: "Judul atau ide utama konten." },
                format: { type: Type.STRING, description: "Format konten (misalnya, Postingan Blog, Reel Instagram, Tweet)." },
                details: { type: Type.STRING, description: "Deskripsi singkat atau poin-poin penting untuk konten." }
              },
              required: ["day", "idea", "format", "details"]
            }
          },
        },
      });

      const jsonStr = response.text.trim().replace(/^```json\s*|```$/g, '');
      const calendarResult: ContentIdea[] = JSON.parse(jsonStr);
      setResult(calendarResult);

    } catch (err) {
      setError('Gagal membuat kalender konten. Silakan coba topik lain.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Masukkan topik dan durasi, dan AI akan membuat draf kalender konten yang terstruktur untuk Anda.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">Topik Konten</label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="cth., Resep sarapan sehat"
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="duration" className="block text-sm font-medium text-slate-700 mb-1">Durasi</label>
          <select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading}
          >
            <option value="1 minggu">1 Minggu</option>
            <option value="2 minggu">2 Minggu</option>
            <option value="1 bulan">1 Bulan</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !topic}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Membuat Kalender...</> : 'Buat Kalender'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      
      {result && (
        <div className="mt-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Kalender Konten Anda:</h3>
            {result.map((item, index) => (
                <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg text-slate-800">{item.idea}</h4>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{item.format}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 mt-1">{item.day}</p>
                    <p className="text-slate-600 mt-2">{item.details}</p>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ContentCalendarCreator;