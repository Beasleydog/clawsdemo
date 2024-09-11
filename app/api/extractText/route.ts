import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { createReadStream } from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const audioBlob = await req.blob();
    if (!audioBlob) {
      return NextResponse.json(
        { error: "No audio data received" },
        { status: 400 }
      );
    }

    // Create a temporary file
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `audio-${Date.now()}.mp4`);
    await fs.writeFile(
      tempFilePath,
      Buffer.from(await audioBlob.arrayBuffer())
    );

    // Initialize the Groq client
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // Create a transcription job
    const transcription = await groq.audio.transcriptions.create({
      file: createReadStream(tempFilePath),
      model: "distil-whisper-large-v3-en",
      response_format: "json",
      language: "en",
      temperature: 0.0,
    });

    return NextResponse.json({ text: transcription.text }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error processing audio" },
      { status: 500 }
    );
  } finally {
    // Delete the temporary file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
  }
}
