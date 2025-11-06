import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../Spinner';

const templates = [
  { title: 'Postingan Blog', prompt: 'Tulis postingan blog tentang manfaat kerja jarak jauh untuk kesejahteraan karyawan dan produktivitas perusahaan.' },
  { title: 'Email Pemasaran', prompt: 'Buat draf email pemasaran untuk lini baru produk pembersih ramah lingkungan, sorot bahan alami dan keefektifannya.' },
  { title: 'Iklan Media Sosial', prompt: 'Buat salinan iklan media sosial yang singkat dan menarik untuk penjualan kilat koleksi gaun musim panas baru.' },
  { title: 'Ide Cerita Pendek', prompt: 'Mulai cerita pendek tentang seorang pustakawan yang menemukan buku ajaib yang menulis sendiri.' },
  { title: 'Deskripsi Produk', prompt: 'Tulis deskripsi produk yang menarik untuk cangkir kopi pintar yang menjaga suhu sempurna, dapat dikontrol melalui aplikasi seluler.' },
];


const AIWriterPro: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Silakan masukkan topik atau prompt.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Hasilkan artikel berkualitas tinggi tentang: ${prompt}`,
      });
      setResult(response.text);
    } catch (err) {
      setError('Gagal membuat konten. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <p className="text-slate-600 mb-4">Masukkan topik, dan AI akan menulis artikel berkualitas tinggi untuk Anda.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
                Atau, mulai dengan templat:
            </label>
            <div className="flex flex-wrap gap-2">
                {templates.map((template, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setPrompt(template.prompt)}
                        disabled={isLoading}
                        className="bg-slate-100 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {template.title}
                    </button>
                ))}
            </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Masa depan energi terbarukan"
          className="w-full h-28 p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Menghasilkan...</> : 'Buat Artikel'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2 text-slate-800">Artikel yang Dihasilkan:</h4>
          <div className="prose prose-slate max-w-none whitespace-pre-wrap">{result}</div>
        </div>
      )}
    </div>
  );
};

export default AIWriterPro;