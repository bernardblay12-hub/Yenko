import { NextRequest, NextResponse } from "next/server";
import { createRequire } from "module";

// Polyfill DOMMatrix for Node.js environments (required by pdfjs-dist in Next.js/Turbopack)
if (typeof globalThis !== "undefined" && !("DOMMatrix" in globalThis)) {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    constructor(init?: any) {
      if (Array.isArray(init)) {
        if (init.length === 6) {
          this.m11 = init[0]; this.m12 = init[1];
          this.m21 = init[2]; this.m22 = init[3];
          this.m41 = init[4]; this.m42 = init[5];
        } else if (init.length === 16) {
          this.m11 = init[0]; this.m12 = init[1]; this.m13 = init[2]; this.m14 = init[3];
          this.m21 = init[4]; this.m22 = init[5]; this.m23 = init[6]; this.m24 = init[7];
          this.m31 = init[8]; this.m32 = init[9]; this.m33 = init[10]; this.m34 = init[11];
          this.m41 = init[12]; this.m42 = init[13]; this.m43 = init[14]; this.m44 = init[15];
        }
      }
    }
  };
}

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
      let pdfParser = require("pdf-parse");
      if (typeof pdfParser !== "function" && pdfParser.default) {
        pdfParser = pdfParser.default;
      }
      const data = await pdfParser(buffer);
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
