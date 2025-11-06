
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { encode } from '../../utils';

const AudioTranscriber: React.FC = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  
  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptRef = useRef('');

  const cleanup = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current.onaudioprocess = null;
    }
    if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(track => track.stop());
    if (sessionRef.current) sessionRef.current.close();
    
    sessionRef.current = null;
    setIsTranscribing(false);
  };
  
  useEffect(() => () => cleanup(), []);

  const handleToggleTranscription = async () => {
    if (isTranscribing) {
      cleanup();
      return;
    }

    setError('');
    setFullTranscript('');
    transcriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsTranscribing(true);

      // Fix for webkitAudioContext TypeScript error
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: GenAI_Blob = {
                  data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                  mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              transcriptRef.current += message.serverContent.inputTranscription.text;
              setFullTranscript(transcriptRef.current);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setError('Terjadi kesalahan saat transkripsi.');
            cleanup();
          },
          onclose: () => cleanup(),
        },
        config: {
          // FIX: Added mandatory responseModalities config for Live API calls.
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError('Gagal memulai transkripsi. Periksa izin mikrofon.');
      setIsTranscribing(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <button
          onClick={handleToggleTranscription}
          className={`px-6 py-3 rounded-full font-bold text-white text-lg transition-all w-56 ${isTranscribing ? 'bg-red-500 hover:bg-red-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
        >
          {isTranscribing ? 'Hentikan Transkripsi' : 'Mulai Transkripsi'}
        </button>
        <p className="text-sm text-slate-500 mt-2">{isTranscribing ? "Mikrofon Anda aktif." : "Klik untuk mulai mentranskripsi."}</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[200px]">
        {fullTranscript ? (
            <p className="text-slate-800 whitespace-pre-wrap">{fullTranscript}</p>
        ) : (
            <p className="text-slate-400 text-center pt-10">Transkripsi akan muncul di sini...</p>
        )}
      </div>
    </div>
  );
};

export default AudioTranscriber;
