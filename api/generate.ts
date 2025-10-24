// Import tipe yang diperlukan untuk Vercel Serverless Functions
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Pastikan untuk menginstal @vercel/node: npm install @vercel/node
// Pastikan juga menginstal @google/generative-ai: npm install @google/generative-ai

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { apiKey, prompt } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is missing' });
  }
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is missing' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContentStream(prompt);
    
    // Set header untuk streaming agar respons bisa diterima langsung oleh frontend
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText); // Kirim setiap potongan data ke client
    }
    
    res.end(); // Akhiri koneksi setelah semua data terkirim

  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: `Failed to call Gemini API: ${error.message}` });
  }
}```

### Langkah 2: Ubah File Service API Call (Modifikasi)

Anda memiliki folder `services`. Kemungkinan besar ada file di dalamnya yang bertanggung jawab untuk melakukan `fetch` atau pemanggilan API. Mari kita asumsikan namanya `apiService.ts` atau yang serupa.

**Cari file di dalam `services/`** yang berisi kode `fetch`, lalu ubah agar terlihat seperti ini:

```typescript
// Contoh di dalam file services/someApiService.ts

interface GeneratePayload {
  apiKey: string;
  prompt: string;
}

// Ubah fungsi yang ada atau buat yang baru
export const streamGenerateText = async (payload: GeneratePayload) => {
  const response = await fetch('/api/generate', { // Arahkan ke backend function yang baru dibuat
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload), // Kirim apiKey dan prompt
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'An unknown error occurred');
  }

  // Kembalikan body respons untuk di-stream di komponen
  return response.body; 
};