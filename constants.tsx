import React from 'react';
import { Category, Tool } from './types';

// --- ICON COMPONENTS ---

const IconAll = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const IconBookmark = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
);

const IconPen = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const IconCamera = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconMicrophone = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const IconBeaker = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

// --- CATEGORIES ---

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Alat', icon: <IconAll /> },
  { id: 'bookmarks', name: 'Tersimpan', icon: <IconBookmark /> },
  { id: 'content', name: 'Pembuatan Konten', icon: <IconPen /> },
  { id: 'image-video', name: 'Gambar & Video', icon: <IconCamera /> },
  { id: 'audio', name: 'Alat Audio', icon: <IconMicrophone /> },
  { id: 'analysis', name: 'Analisis & Riset', icon: <IconBeaker /> },
];

// --- TOOLS ---

export const TOOLS: Tool[] = [
  {
    id: 1,
    icon: <div className="text-3xl">✍️</div>,
    title: 'Penulis AI Pro',
    description: 'Hasilkan artikel, postingan blog, dan tulisan pemasaran berkualitas tinggi tentang topik apa pun dalam hitungan detik.',
    tags: ['menulis', 'konten', 'pemasaran'],
    category: 'content',
  },
  {
    id: 13,
    icon: <div className="text-3xl">📅</div>,
    title: 'Pembuat Kalender Konten',
    description: 'Hasilkan kalender konten terstruktur untuk topik tertentu, termasuk ide, format, dan jadwal posting.',
    tags: ['konten', 'kalender', 'perencanaan', 'media sosial'],
    category: 'content',
  },
  {
    id: 2,
    icon: <div className="text-3xl">📈</div>,
    title: 'Prediktor Tren',
    description: 'Manfaatkan AI dengan penalaran canggih untuk menganalisis topik kompleks dan memprediksi tren masa depan.',
    tags: ['analisis', 'strategi', 'masa depan'],
    category: 'analysis',
  },
  {
    id: 3,
    icon: <div className="text-3xl">🎨</div>,
    title: 'Pembuat Gambar AI',
    description: 'Ubah deskripsi teks Anda menjadi gambar menakjubkan berkualitas tinggi untuk tujuan apa pun.',
    tags: ['gambar', 'seni', 'desain'],
    category: 'image-video',
  },
  {
    id: 4,
    icon: <div className="text-3xl">✂️</div>,
    title: 'Editor Gambar',
    description: 'Edit gambar Anda dengan perintah teks sederhana. Tambahkan objek, ubah gaya, dan banyak lagi.',
    tags: ['gambar', 'editing', 'kreatif'],
    category: 'image-video',
  },
  {
    id: 5,
    icon: <div className="text-3xl">👁️</div>,
    title: 'Penganalisis Gambar',
    description: 'Unggah gambar dan ajukan pertanyaan tentangnya. Dapatkan deskripsi dan wawasan terperinci.',
    tags: ['visi', 'analisis', 'gambar'],
    category: 'image-video',
  },
  {
    id: 6,
    icon: <div className="text-3xl">🔎</div>,
    title: 'Asisten Riset',
    description: 'Dapatkan jawaban terkini dari web, didasarkan pada Google Search dan Maps.',
    tags: ['riset', 'web', 'peta'],
    category: 'analysis',
  },
  {
    id: 7,
    icon: <div className="text-3xl">🎬</div>,
    title: 'Generator Video',
    description: 'Buat video pendek berkualitas tinggi dari perintah teks atau gambar awal. (Memerlukan Kunci API)',
    tags: ['video', 'animasi', 'kreatif'],
    category: 'image-video',
  },
  {
    id: 8,
    icon: <div className="text-3xl">💡</div>,
    title: 'Penganalisis Niche',
    description: 'Analisis niche bisnis untuk mendapatkan wawasan tentang audiens, monetisasi, dan strategi konten.',
    tags: ['bisnis', 'strategi', 'json'],
    category: 'analysis',
  },
  {
    id: 9,
    icon: <div className="text-3xl">💬</div>,
    title: 'Percakapan Langsung',
    description: 'Lakukan percakapan suara-ke-suara secara real-time dengan asisten AI yang membantu.',
    tags: ['audio', 'langsung', 'percakapan'],
    category: 'audio',
  },
  {
    id: 10,
    icon: <div className="text-3xl">🎙️</div>,
    title: 'Transkriptor Audio',
    description: 'Transkripsikan audio lisan dari mikrofon Anda menjadi teks secara real-time.',
    tags: ['audio', 'transkripsi', 'suara-ke-teks'],
    category: 'audio',
  },
  {
    id: 11,
    icon: <div className="text-3xl">🔊</div>,
    title: 'Teks-ke-Suara',
    description: 'Ubah teks apa pun menjadi ucapan yang terdengar alami dengan suara AI berkualitas tinggi.',
    tags: ['audio', 'tts', 'suara'],
    category: 'audio',
  },
  {
    id: 12,
    icon: <div className="text-3xl">🗒️</div>,
    title: 'Perangkum Rapat AI',
    description: 'Meringkas rapat tim secara otomatis menggunakan AI.',
    tags: ['audio', 'rapat', 'produktivitas'],
    category: 'audio',
  },
];
