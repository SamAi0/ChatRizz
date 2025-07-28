import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSendVoice, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob, duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-800/50 backdrop-blur-sm border border-purple-400/30 rounded-lg">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {!audioBlob ? (
        <>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
            }`}
          >
            {isRecording ? <Square size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
          </button>
          <span className="text-white text-sm">
            {isRecording ? `Recording... ${formatTime(duration)}` : 'Hold to record'}
          </span>
        </>
      ) : (
        <>
          <button
            onClick={isPlaying ? pauseAudio : playAudio}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
          >
            {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white" />}
          </button>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 h-1 bg-gray-600 rounded-full">
                <div className="h-1 bg-purple-500 rounded-full w-1/3"></div>
              </div>
              <span className="text-xs text-purple-200">{formatTime(duration)}</span>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
          >
            Send
          </button>
        </>
      )}
    </div>
  );
}