import { NextRequest, NextResponse } from "next/server";

const GROQ_MODEL = "llama-3.1-8b-instant";
const SYSTEM_PROMPT = `Kamu adalah asisten keuangan di aplikasi Sinity Finance. Bantu user dengan:
- Tips mengatur anggaran dan menabung
- Menjelaskan pemasukan vs pengeluaran
- Saran mencatat keuangan dengan baik
- Jawab dalam Bahasa Indonesia, singkat dan ramah

FORMAT RESPONS: Gunakan Markdown agar mudah dibaca:
- **Bold** untuk istilah penting atau judul poin
- Daftar berurut pakai angka: 1. 2. 3.
- Daftar bullet pakai tanda * atau -
- Paragraf singkat per blok; pisahkan saran jadi poin-poin

Contoh format:
**Tabungan**: Alokasikan 10-20% dari gaji...
1. **Poin pertama**: penjelasan
2. **Poin kedua**: penjelasan
* Contoh item
* Contoh item lain

Jangan beri saran investasi spesifik atau jual produk. Fokus ke edukasi keuangan dasar.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY tidak diatur. Tambahkan di .env" },
      { status: 500 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus JSON dengan messages" },
      { status: 400 }
    );
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array wajib diisi" },
      { status: 400 }
    );
  }

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data?.error?.message || data?.message || "Groq API error";
      return NextResponse.json(
        { error: err },
        { status: res.status >= 400 ? res.status : 500 }
      );
    }

    const content =
      data?.choices?.[0]?.message?.content?.trim() || "Maaf, tidak ada respons.";
    return NextResponse.json({ message: content });
  } catch (e) {
    console.error("Groq API error:", e);
    return NextResponse.json(
      { error: "Gagal menghubungi AI. Cek koneksi atau API key." },
      { status: 500 }
    );
  }
}
