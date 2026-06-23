import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = "";

    if (file.name.toLowerCase().endsWith(".pdf")) {
      const require = createRequire(import.meta.url);
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      text = data.text;
    } else {
      // Decode txt or other format directly
      text = new TextDecoder().decode(buffer);
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error parsing CV:", error);
    return NextResponse.json({ error: error.message || "Failed to parse CV" }, { status: 500 });
  }
}
