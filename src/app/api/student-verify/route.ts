import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const university = formData.get("university") as string;
    const gradYear = formData.get("gradYear") as string;
    const file = formData.get("file") as File;

    if (!file || !email || !university || !gradYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const mimeType = file.type;

    let contentToSendToOpenAI: any;

    // If PDF, extract text using pdf-parse to save tokens and handle PDFs easily
    if (mimeType === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const require = createRequire(import.meta.url);
      const pdfModule = require("pdf-parse");
      const PDFParseClass = pdfModule.PDFParse;
      
      const parser = new PDFParseClass({ data: uint8Array });
      const data = await parser.getText();
      const text = data.text;
      await parser.destroy().catch(() => {});

      contentToSendToOpenAI = [
        {
          type: "text",
          text: `Here is the extracted text from the user's uploaded PDF document:\n\n${text}`
        }
      ];
    } else {
      // It's likely an image (png/jpg). Convert to base64 for Vision API
      const base64String = Buffer.from(arrayBuffer).toString("base64");
      contentToSendToOpenAI = [
        {
          type: "text",
          text: "Here is the image of the user's uploaded document."
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64String}`
          }
        }
      ];
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const modelName = process.env.OPENAI_MODEL || "o3-mini";

    if (!apiKey) {
      // Fallback if no API key
      return NextResponse.json({ 
        isVerified: true, 
        reason: "Mock verified without API key." 
      });
    }

    const systemPrompt = `You are a compliance officer responsible for verifying student enrollments.
The user claims the following details:
- University: ${university}
- Email: ${email}
- Graduation Year: ${gradYear}

Review the provided document (text or image) and determine if it appears to be a legitimate student ID or proof of enrollment matching these details (or at least plausibly belonging to this user/university). Students might blur sensitive parts, but look for university name, student status, or dates.
Return a structured JSON with two fields:
{
  "isVerified": boolean,
  "reason": "String explaining why it was accepted or rejected"
}
ONLY return the JSON object.`;

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: "developer", content: systemPrompt },
          { role: "user", content: contentToSendToOpenAI }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI Verification Error:", errText);
      // Fallback gracefully so we don't block users if the API acts up
      return NextResponse.json({
        isVerified: true,
        reason: "Automatically approved due to API error."
      });
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const result = JSON.parse(resultText);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Error verifying student:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
