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
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log("----------------- PARSE CV DEBUG -----------------");
    console.log("File name:", file.name);
    console.log("File size (File API):", file.size);
    console.log("ArrayBuffer byteLength:", arrayBuffer.byteLength);
    console.log("First 10 bytes:", Array.from(uint8Array.slice(0, 10)));
    const isPdfHeader = uint8Array[0] === 37 && uint8Array[1] === 80 && uint8Array[2] === 68 && uint8Array[3] === 70;
    console.log("Starts with %PDF:", isPdfHeader);
    console.log("--------------------------------------------------");

    let text = "";

    if (file.name.toLowerCase().endsWith(".pdf")) {
      if (!isPdfHeader) {
        return NextResponse.json({
          error: `Invalid PDF file: "${file.name}" does not start with a valid PDF header (%PDF). Got bytes: [${Array.from(uint8Array.slice(0, 4)).join(", ")}] ("${Array.from(uint8Array.slice(0, 4)).map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "?")).join("")}"). Please verify the file is not corrupted.`
        }, { status: 400 });
      }

      const require = createRequire(import.meta.url);
      const pdfModule = require("pdf-parse");
      const PDFParseClass = pdfModule.PDFParse;
      
      const parser = new PDFParseClass({ data: uint8Array });
      const data = await parser.getText();
      text = data.text;
      await parser.destroy().catch(() => {});
    } else {
      // Decode txt or other format directly
      text = new TextDecoder().decode(uint8Array);
    }

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error parsing CV:", error);
    return NextResponse.json({ error: error.message || "Failed to parse CV" }, { status: 500 });
  }
}
