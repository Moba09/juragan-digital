import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import Spinner from '../Spinner';
import { blobToBase64 } from '../../utils';

const loadingMessages = [
  "Memanaskan kursi sutradara digital...",
  "Menyusun piksel menjadi sebuah mahakarya...",
  "Mengajari algoritma seni sinema...",
  "Menerjemahkan visi Anda, bingkai demi bingkai...",
  "Ini mungkin memakan waktu beberapa saat. Seni yang hebat butuh kesabaran!",
];

const templates = [
  { title: 'Pemandangan Alam Sinematik', prompt: 'Rekaman drone sinematik dari pegunungan yang tertutup kabut saat matahari terbit, palet warna moody.' },
  { title: 'Animasi Karakter Pendek', prompt: 'Animasi pendek yang menyenangkan tentang seekor rubah kecil yang penasaran menjelajahi hutan ajaib di malam hari.' },
  { title: 'Selang Waktu Alam', prompt: 'Video selang waktu yang indah dari bunga sakura yang mekar dengan lebah beterbangan di sekitarnya.' },
  { title: 'Perjalanan Luar Angkasa', prompt: 'Perjalanan visual yang menakjubkan melalui nebula berwarna-warni dan galaksi jauh di luar angkasa.' },
  { title: 'Pemandangan Kota Cyberpunk', prompt: 'Pemandangan jalanan kota cyberpunk yang ramai saat malam hari, dengan mobil terbang, papan reklame neon, dan hujan.' },
];


type AspectRatio = "16:9" | "9:16";

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');


  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    checkApiKey();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      intervalRef.current = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isLoading]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPrompt = e.target.value;
    if (selectedPrompt) {
        setPrompt(selectedPrompt);
    }
  };

  const checkApiKey = async () => {
    if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
      setHasApiKey(true);
    } else {
      setHasApiKey(false);
    }
  };
  
  const handleSelectKey = async () => {
    if (!window.aistudio) {
        setError("Pemilihan kunci API tidak tersedia di lingkungan ini.");
        return;
    }
    await window.aistudio.openSelectKey();
    setHasApiKey(true);
  };

  const pollOperation = async (operation: GenerateVideosOperation, ai: GoogleGenAI): Promise<GenerateVideosOperation> => {
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        operation = await ai.operations.getVideosOperation({ name: operation.name });
      } catch(err) {
        if (err instanceof Error && err.message.includes("Requested entity was not found.")) {
           setHasApiKey(false);
           throw new Error("Kunci API Anda tidak valid. Silakan pilih yang baru.");
        }
        throw err;
      }
    }
    return operation;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !imageFile) {
      setError('Silakan masukkan prompt atau unggah gambar.');
      return;
    }
    setIsLoading(true);
    setError('');
    setVideoUrl('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imagePayload = imageFile ? {
        imageBytes: await blobToBase64(imageFile),
        mimeType: imageFile.type,
      } : undefined;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: imagePayload,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      });

      const finalOperation = await pollOperation(operation, ai);

      const downloadLink = finalOperation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("Pembuatan video gagal atau tidak mengembalikan tautan.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat video. Silakan coba lagi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
        <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Kunci API Diperlukan</h3>
            <p className="text-yellow-700 mt-2 mb-4">
                Generator Video menggunakan model canggih yang mengharuskan Anda memilih kunci API sendiri. Penagihan akan berlaku untuk akun Anda.
                <br/>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Pelajari lebih lanjut tentang penagihan.</a>
            </p>
            <button
                onClick={handleSelectKey}
                className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors"
            >
                Pilih Kunci API
            </button>
        </div>
    );
  }

  return (
    <div>
      <p className="text-slate-600 mb-4">Deskripsikan video yang ingin Anda buat, atau unggah gambar awal. Proses ini bisa memakan waktu beberapa menit.</p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
            <label htmlFor="video-prompt-template" className="block text-sm font-medium text-slate-700 mb-1">
                Mulai dengan templat (Opsional):
            </label>
            <select
                id="video-prompt-template"
                onChange={handleTemplateChange}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                disabled={isLoading}
                defaultValue=""
            >
                <option value="" disabled>Pilih sebuah templat...</option>
                {templates.map((template, index) => (
                    <option key={index} value={template.prompt}>
                        {template.title}
                    </option>
                ))}
            </select>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="cth., Elang agung terbang di atas pegunungan bersalju"
          className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />

        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Unggah Gambar Awal (Opsional)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            disabled={isLoading}
          />
        </div>

        {imagePreview && (
          <div className="mt-4">
            <img src={imagePreview} alt="Image preview" className="max-h-40 rounded-lg" />
          </div>
        )}
        
        <div className="mt-4">
          <label htmlFor="aspect-ratio-video" className="block text-sm font-medium text-slate-700 mb-1">Rasio Aspek</label>
          <select
            id="aspect-ratio-video"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            disabled={isLoading}
          >
            <option value="16:9">Lanskap (16:9)</option>
            <option value="9:16">Potret (9:16)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:opacity-90 transition-opacity duration-300 flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? <><Spinner /> Menghasilkan Video...</> : 'Buat Video'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-6 flex flex-col items-center justify-center">
        {isLoading && (
          <div className="w-full text-center">
            <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Spinner />
            </div>
            <p className="text-slate-600 animate-pulse">{loadingMessage}</p>
          </div>
        )}
        {videoUrl && !isLoading && (
          <video src={videoUrl} controls autoPlay loop className="rounded-lg shadow-lg max-w-full" />
        )}
      </div>
    </div>
  );
};

export default VideoGenerator;