import { useState } from 'react';
// Import fungsi service yang sudah diubah dari Langkah 2
import { streamGenerateText } from '../services/apiService'; 

export default function YourAppComponent() {
  // Tambahkan state untuk API Key
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      setError('Harap masukkan API Key Anda.');
      return;
    }
    // ... validasi lainnya ...
    
    setIsLoading(true);
    setResponse('');
    setError('');

    try {
      const stream = await streamGenerateText({ apiKey, prompt });
      if (!stream) return;

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      
      // Baca stream data dari backend
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setResponse((prev) => prev + chunk); // Tambahkan setiap potongan data ke state respons
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Di dalam JSX Anda, tambahkan input untuk API Key
    <form onSubmit={handleSubmit}>
      {/* Kolom Input API Key yang baru */}
      <div>
        <label htmlFor="apiKey">Gemini API Key</label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Masukkan API Key Anda"
        />
      </div>

      {/* Kolom prompt yang sudah ada */}
      <div>
        <label htmlFor="prompt">Your Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Generate'}
      </button>

      {/* Tampilkan error atau respons */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && <div><pre>{response}</pre></div>}
    </form>
  );
}