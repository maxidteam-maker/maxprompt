import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { VideoAspectRatio, VideoResolution } from '../types';
import FileUpload from './FileUpload';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';

const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>(VideoAspectRatio.Landscape);
  const [resolution, setResolution] = useState<VideoResolution>(VideoResolution.SD);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt && !imageFile) {
      setError('Please enter a prompt or upload an image.');
      return;
    }
    setLoading(true);
    setError(null);
    setResultVideo(null);

    try {
      const videoUrl = await generateVideo(prompt, aspectRatio, resolution, imageFile);
      setResultVideo(videoUrl);
    } catch (err) {
      if (err instanceof Error) {
          if (err.message.toLowerCase().includes('quota')) {
              setError('Error: Kuota API Key Anda telah habis atau perlu aktivasi billing di akun Google Cloud Anda. Ini bukan kesalahan aplikasi, silakan periksa detail akun Google Anda.');
          } else {
              setError(err.message);
          }
      } else {
          setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FileUpload 
          onFileSelect={setImageFile}
          label="1. Upload Starting Image (Optional)"
          disabled={loading}
        />

        <div>
          <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-2">
            2. Describe the Video to Generate
          </label>
          <textarea
            id="video-prompt"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-lime-500 focus:outline-none transition"
            placeholder="e.g., A cinematic shot of a lone astronaut on a red planet"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(VideoAspectRatio).map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    aspectRatio === ratio
                      ? 'bg-lime-500 text-gray-900 ring-2 ring-lime-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {ratio === VideoAspectRatio.Landscape ? '16:9 Landscape' : '9:16 Portrait'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(VideoResolution).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res)}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    resolution === res
                      ? 'bg-lime-500 text-gray-900 ring-2 ring-lime-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!prompt && !imageFile)}
          className="w-full flex justify-center items-center gap-2 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? <Spinner className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
          {loading ? 'Generating Video...' : 'Generate Video'}
        </button>
      </form>
      
      {loading && <div className="mt-4 text-lime-300 bg-lime-900/50 p-3 rounded-lg text-center animate-pulse">sabar lur, lagi proses... ini bisa memakan waktu beberapa menit.</div>}

      {error && <div className="mt-4 text-red-300 bg-red-900/50 p-4 rounded-lg text-sm">{error}</div>}

      {resultVideo && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <div className="w-full overflow-hidden rounded-lg bg-gray-800/50">
            <video src={resultVideo} controls autoPlay loop className="w-full h-full object-contain" />
          </div>
           <a
              href={resultVideo}
              download={`maxprompt_video_${Date.now()}.mp4`}
              className="mt-4 inline-block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Download Video
            </a>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
