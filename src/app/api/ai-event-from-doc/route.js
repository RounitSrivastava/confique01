export const runtime = "nodejs";
import Groq from "groq-sdk";
import pdf from "pdf-parse";
import mammoth from "mammoth";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {

  try {

    const formData = await req.formData();

    const file = formData.get("file");

    if (!file) {

      return Response.json({
        error: "No file uploaded"
      });

    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    let extractedText = "";

    // PDF
    if (file.name.endsWith(".pdf")) {

      const pdfData = await pdf(buffer);

      extractedText = pdfData.text;

    }

    // DOCX
    else if (
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc")
    ) {

      const result = await mammoth.extractRawText({
        buffer
      });

      extractedText = result.value;

    }

    // TXT
    else if (file.name.endsWith(".txt")) {

      extractedText = buffer.toString("utf-8");

    }

    else {

      return Response.json({
        error: "Unsupported file type"
      });

    }

    // AI Extraction
    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [

        {
          role: "system",

          content: `
Extract event details from the document.

Return ONLY valid JSON.

{
  "title": "",
  "tagline": "",
  "description": "",
  "venue": "",
  "category": "",
  "eligibility": "",
  "prizes": "",

  "eventStart": "",
  "eventEnd": "",

  "registrationStart": "",
  "registrationEnd": "",

  "tags": [],

  "rounds": [
    {
      "title": "",
      "description": "",
      "date": ""
    }
  ],

  "customFields": [
    {
      "name": "",
      "type": "text",
      "required": true,
      "options": []
    }
  ],

  "teamConfig": {
    "enabled": false,
    "maxMembers": 4
  }
}
`
        },

        {
          role: "user",
          content: extractedText
        }

      ]

    });

    const text = completion.choices[0].message.content;

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const json = JSON.parse(cleanedText);

    return Response.json(json);

  } catch (err) {

    console.error("DOC AI ERROR:", err);

    return Response.json({
      error: err.message
    });

  }
}