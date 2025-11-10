import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Important for Vercel

export async function POST(req: Request) {
  try {
    const { text, voice = "en_us_male" } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const ttsRes = await fetch("https://api.ttsmaker.com/v1/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voice,
        audio_format: "mp3",
        sample_rate: 24000,
      }),
    });

    const rawText = await ttsRes.text(); // read as text first

    // Try parsing JSON safely
    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("TTSMaker returned non-JSON response:", rawText.slice(0, 200));
      return NextResponse.json(
        { error: "TTSMaker returned invalid JSON", rawText },
        { status: 500 }
      );
    }

    if (!ttsRes.ok || !data.audio) {
      return NextResponse.json(
        { error: "TTSMaker failed", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ audio: data.audio });
  } catch (error: any) {
    console.error("TTS route error:", error);
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
