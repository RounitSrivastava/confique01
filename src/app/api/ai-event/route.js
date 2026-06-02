import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {

  try {

    const body = await req.json();

    const completion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",

      messages: [

        {
          role: "system",

          content: `
You are an AI event generator.

Return ONLY valid JSON.

DO NOT return explanations.
DO NOT wrap JSON in markdown.

The JSON structure MUST match EXACTLY.

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

  "isFree": true,

  "pricingMode": "fixed",

  "fixedPrice": "",

  "ticketTypes": [
    {
      "name": "",
      "price": 0
    }
  ],

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

Rules:

1. rounds MUST be array of objects.

2. customFields MUST use "name", not "label".

3. checkbox/dropdown/radio fields MUST include options array.

4. Dates must be YYYY-MM-DD.

5. category should be one of:
   Tech,
   Entrepreneurship,
   Competition,
   Cultural,
   Seminar,
   Workshop,
   Others

6. If event has paid registration:
   set "isFree": false

7. For single registration fee:
   use:
   "pricingMode": "fixed"

8. For multiple ticket types:
   use:
   "pricingMode": "flexible"

9. ticketTypes format MUST be:

[
  {
    "name": "VIP",
    "price": 999
  }
]

10. If event is free:
   - fixedPrice should be ""
   - ticketTypes should be []

11. Extract realistic event rounds.

12. Extract useful registration fields.

13. If user mentions:
   VIP,
   Regular,
   Student Pass,
   Early Bird,
   Pro Pass,
   Premium,
   Booth Pass,
   Team Pass

   then automatically use flexible pricing.

14. Do not hallucinate impossible details.

15. Keep descriptions concise and clean.
`
        },

        {
          role: "user",
          content: body.prompt
        }

      ],

      temperature: 0.7,

      max_tokens: 2000

    });

    const text = completion.choices[0].message.content;

    console.log("RAW AI RESPONSE:", text);

    // Remove markdown wrappers if AI adds them
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const json = JSON.parse(cleanedText);

    // Safety defaults
    const safeResponse = {

      title: json.title || "",
      tagline: json.tagline || "",
      description: json.description || "",
      venue: json.venue || "",
      category: json.category || "Others",
      eligibility: json.eligibility || "",
      prizes: json.prizes || "",

      eventStart: json.eventStart || "",
      eventEnd: json.eventEnd || "",

      registrationStart: json.registrationStart || "",
      registrationEnd: json.registrationEnd || "",

      isFree:
        typeof json.isFree === "boolean"
          ? json.isFree
          : true,

      pricingMode:
        json.pricingMode || "fixed",

      fixedPrice:
        json.fixedPrice || "",

      ticketTypes:
        Array.isArray(json.ticketTypes)
          ? json.ticketTypes
          : [],

      tags:
        Array.isArray(json.tags)
          ? json.tags
          : [],

      rounds:
        Array.isArray(json.rounds)
          ? json.rounds
          : [],

      customFields:
        Array.isArray(json.customFields)
          ? json.customFields
          : [],

      teamConfig:
        typeof json.teamConfig === "object" &&
        json.teamConfig !== null
          ? json.teamConfig
          : {
              enabled: false,
              maxMembers: 4
            }

    };

    return Response.json(safeResponse);

  } catch (err) {

    console.log("AI ERROR:", err);

    return Response.json({
      error: err.message || "AI generation failed"
    });

  }
}