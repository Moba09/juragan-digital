
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../../utils';

const LiveConversation: React.FC = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState('');
  const [transcripts, setTranscripts] = useState<{ speaker: 'user' | 'model', text: string }[]>([]);
  
  const sessionRef = useRef<LiveSession | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  let currentInputTranscription = '';
  let currentOutputTranscription = '';

  const cleanup = () => {
    console.log("Cleaning up resources...");
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current = null;
    }
    if(mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
     if (sessionRef.current) {
        sessionRef.current.close();
        sessionRef.current = null;
    }
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsSessionActive(false);
  };

  // Ensure cleanup happens on component unmount
  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleToggleSession = async () => {
    if (isSessionActive) {
      cleanup();
      return;
    }

    setError('');
    setTranscripts([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setIsSessionActive(true);

      // Fix for webkitAudioContext TypeScript error
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      // Fix for webkitAudioContext TypeScript error
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Sesi dibuka.');
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            mediaStreamSourceRef.current = source;
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
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
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription += message.serverContent.outputTranscription.text;
            }
            if (message.serverContent?.inputTranscription) {
              currentInputTranscription += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.turnComplete) {
              const fullInput = currentInputTranscription.trim();
              const fullOutput = currentOutputTranscription.trim();
              if (fullInput) setTranscripts(prev => [...prev, { speaker: 'user', text: fullInput }]);
              if (fullOutput) setTranscripts(prev => [...prev, { speaker: 'model', text: fullOutput }]);
              currentInputTranscription = '';
              currentOutputTranscription = '';
            }

            // Handle Audio Playback
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const outputCtx = outputAudioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Kesalahan sesi:', e);
            setError('Terjadi kesalahan pada sesi.');
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            console.log('Sesi ditutup.');
            cleanup();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setError('Gagal memulai sesi. Periksa izin mikrofon.');
      setIsSessionActive(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <button
          onClick={handleToggleSession}
          className={`px-6 py-3 rounded-full font-bold text-white text-lg transition-all w-48 ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isSessionActive ? 'Hentikan Sesi' : 'Mulai Bicara'}
        </button>
        <p className="text-sm text-slate-500 mt-2">{isSessionActive ? "Mikrofon Anda aktif." : "Klik untuk memulai percakapan."}</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg min-h-[200px] max-h-[300px] overflow-y-auto">
        {transcripts.length === 0 && !isSessionActive && (
          <p className="text-slate-400 text-center pt-10">Percakapan akan muncul di sini...</p>
        )}
        {transcripts.map((t, i) => (
          <div key={i} className={`mb-2 ${t.speaker === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block px-3 py-1 rounded-lg ${t.speaker === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'}`}>
              <strong>{t.speaker === 'user' ? 'Anda' : 'AI'}:</strong> {t.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveConversation;
