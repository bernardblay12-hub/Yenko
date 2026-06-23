import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are ResuTailor, a resume tailoring assistant. Your job is to help the user tailor their CV to a specific job description honestly — without inventing experience they don't have.

When the user provides their CV and a job description:
1. Summarise the top 5 requirements from the job in one short paragraph
2. Ask one clarifying question at a time about the user's real experience relevant to those requirements
3. Never assume the user has a skill or experience they haven't confirmed
4. Once you have enough context (after 3-5 exchanges), offer to generate the tailored resume. When you offer to generate the resume, you must append the exact token [GENERATE_RESUME] to your message.
5. When generating, only use what the user has confirmed. If a key requirement has no match, flag it as a gap — do not fill it in.
6. Do NOT use emojis, icons, slang, or informal language in your responses. Always maintain a professional, objective, and executive tone throughout.`;

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      cvText,
      jobText,
      generateResume,
      profileName,
      profileSchool,
      profileDegree,
      profileAspiration,
      aiTone,
      aiLanguage,
      khadijaMode,
    } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

    if (!apiKey) {
      // Fallback: Mock chat assistant response
      return handleMockChat(messages, cvText, jobText, generateResume, {
        profileName,
        profileSchool,
        profileDegree,
        profileAspiration,
        aiTone,
        aiLanguage,
        khadijaMode,
      });
    }

    // Build custom system instruction based on settings
    let customSystemPrompt = SYSTEM_PROMPT;
    if (profileName || aiTone || aiLanguage || khadijaMode) {
      customSystemPrompt = `You are ResuTailor, a resume tailoring assistant. You are helping the user, ${profileName || "Bernard"}, a student at ${profileSchool || "UMaT"} studying ${profileDegree || "Cybersecurity"}. Their goal is: ${profileAspiration || "US graduate programs"}.
      
When the user provides their CV and a job description:
1. Summarise the top 5 requirements from the job in one short paragraph
2. Ask one clarifying question at a time about the user's real experience relevant to those requirements
3. Never assume the user has a skill or experience they haven't confirmed
4. Once you have enough context (after 3-5 exchanges), offer to generate the tailored resume. When you offer to generate the resume, you must append the exact token [GENERATE_RESUME] to your message.
5. When generating, only use what the user has confirmed. If a key requirement has no match, flag it as a gap — do not fill it in.
6. Tone preference: Maintain a tone that is ${aiTone === "recruiter" ? "very critical, like a tough tech recruiter looking for flaws" : aiTone === "auditor" ? "highly analytical, like a cybersecurity auditor verifying facts" : "supportive, cooperative, and helpful"}.
7. Language preference: You must converse in ${aiLanguage === "fr" ? "French" : aiLanguage === "de" ? "German" : aiLanguage === "dar" ? "Moroccan Arabic (Darija)" : "English"}.
${khadijaMode ? `8. Khadija Mode is ENABLED. Since you are talking to Bernard, occasionally add supportive Moroccan Arabic/French phrases of encouragement like "Bon courage, bro" or "Dima Maghrib" or "Allah y3awnak", and maintain an extra warm, friendly tone as if you are his partner cheering him on.` : ""}
${khadijaMode ? "9. You may use warm emojis like 💖, ✨, 👍, 💪." : "8. Do NOT use emojis, icons, slang, or informal language in your responses. Always maintain a professional, objective, and executive tone throughout."}`;
    }

    const openaiHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    };

    if (generateResume) {
      const prompt = `Based on this original CV text:
---
${cvText}
---
And this job description:
---
${jobText}
---
And our conversation history:
${messages.map((m: any) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`).join("\n")}

Please generate the tailored resume as a structured JSON object.
Rules:
1. DO NOT invent or hallucinate any experience. Only include achievements and skills that are either in the original CV or that the user has explicitly confirmed in the chat history.
2. If there are skills or bullets in the original CV that help meet the job description, highlight or tailor them to match the job terminology.
3. If there are bullet points that represent requirements the user has NOT explicitly confirmed or where we had to adjust wording, append the suffix "[unverified]" to the end of that bullet string.
4. Output the response in JSON format matching this schema:
{
  "name": "string",
  "title": "string",
  "email": "string",
  "phone": "string",
  "website": "string",
  "summary": "string",
  "experience": [
    {
      "id": "string",
      "role": "string",
      "company": "string",
      "duration": "string",
      "bullets": ["string"]
    }
  ],
  "education": [
    {
      "id": "string",
      "degree": "string",
      "school": "string",
      "duration": "string"
    }
  ],
  "skills": ["string"]
}
5. Return ONLY the JSON object, without markdown formatting blocks like \`\`\`json.`;

      // Call OpenAI / Foundry using Fetch
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: openaiHeaders,
        body: JSON.stringify({
          model: "o3-mini",
          messages: [
            { role: "developer", content: customSystemPrompt },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API generation failed: ${response.status} ${errText}`);
      }

      const resData = await response.json();
      const responseText = resData.choices?.[0]?.message?.content || "{}";
      return NextResponse.json({ resume: JSON.parse(responseText.trim()) });
    } else {
      // Normal chat exchange
      // Compile messages into OpenAI payload structure
      const apiMessages = [
        { role: "developer", content: customSystemPrompt }
      ];

      // Add context to first message
      const firstMessageContent = `Here is my original CV:
---
${cvText}
---
And the target job description:
---
${jobText}
---
Let's start the tailoring. Please summarize the top 5 requirements and ask the first clarifying question.`;

      apiMessages.push({ role: "user", content: firstMessageContent });

      // Append subsequent messages (skip the initial user placeholder)
      for (let i = 1; i < messages.length; i++) {
        const msg = messages[i];
        apiMessages.push({
          role: msg.role === "assistant" || msg.role === "model" ? "assistant" : "user",
          content: msg.content,
        });
      }

      // Call OpenAI / Foundry using Fetch
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: openaiHeaders,
        body: JSON.stringify({
          model: "o3-mini",
          messages: apiMessages
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API chat failed: ${response.status} ${errText}`);
      }

      const resData = await response.json();
      const reply = resData.choices?.[0]?.message?.content || "";
      return NextResponse.json({ reply });
    }
  } catch (error: any) {
    console.error("OpenAI API Error, falling back to mock response:", error);
    try {
      const body = await req.json().catch(() => ({}));
      return handleMockChat(body.messages || [], body.cvText || "", body.jobText || "", body.generateResume || false, {
        profileName: body.profileName,
        profileSchool: body.profileSchool,
        profileDegree: body.profileDegree,
        profileAspiration: body.profileAspiration,
        aiTone: body.aiTone,
        aiLanguage: body.aiLanguage,
        khadijaMode: body.khadijaMode,
      });
    } catch (e: any) {
      return NextResponse.json({ error: "Failed to process chat response." }, { status: 500 });
    }
  }
}

// Interactive Mock Assistant for testing when API Key is missing or invalid
function handleMockChat(
  messages: any[],
  cvText: string,
  jobText: string,
  generateResume: boolean,
  settings: any = {}
) {
  const {
    profileName = "Bernard Blay",
    profileSchool = "University of Mines and Technology (UMaT)",
    profileDegree = "BSc in Computer Science & Engineering",
    profileAspiration = "US Graduate School & Security Research",
    aiTone = "cooperative",
    aiLanguage = "en",
    khadijaMode = false,
  } = settings;

  // If request is to generate the final resume
  if (generateResume) {
    const mockResume = {
      name: profileName,
      title: `${profileDegree.replace("BSc ", "").replace("BSc in ", "")} & Full-Stack Developer`,
      email: settings.profileEmail || "bernard.blay@umat.edu.gh",
      phone: settings.profilePhone || "+233 55 123 4567",
      website: settings.profileWebsite || "github.com/bernardblay",
      summary: `Dedicated student and developer focusing on frontend system development, cybersecurity protocols, and clean web engineering architectures. Experienced with TypeScript, React, and network traffic security audits. Target goal: ${profileAspiration.toLowerCase()}.`,
      experience: [
        {
          id: "exp1",
          role: "Frontend Engineering Intern",
          company: "Vercel Partner Lab",
          duration: "Jan 2026 - Present",
          bullets: [
            "Developed core responsive features using React and modern CSS structures for international user dashboards.",
            "Partnered with Vercel team to run performance tests; integrated Next.js Server Actions to optimize asset latency, achieving a 15% reduction in loading speeds [unverified]",
            "Maintained and optimized codebases in Git repositories, following production linting and formatting practices."
          ]
        },
        {
          id: "exp2",
          role: "Web Administrator",
          company: `${settings.profileAdisadel ? "Adisadel College / " : ""}UMaT Cyber Security Club`,
          duration: "Sep 2025 - Dec 2025",
          bullets: [
            "Administered club portal and monitored network endpoints for suspicious activities [unverified]",
            "Refactored membership directory page using lightweight client rendering, improving responsiveness."
          ]
        }
      ],
      education: [
        {
          id: "edu1",
          degree: profileDegree,
          school: profileSchool,
          duration: `2024 - ${settings.profileGradYear || "2028"} (Expected)`
        }
      ],
      skills: ["React", "TypeScript", "Next.js", "Git", "CSS", "Network Security", "Tailwind v4"]
    };

    return NextResponse.json({ resume: mockResume });
  }

  // Count exchange rounds
  const userMessages = messages.filter((m: any) => m.role === "user");
  const round = userMessages.length;

  let reply = "";

  // Dynamic greeting translations based on language
  let greeting = "";
  if (aiLanguage === "fr") {
    greeting = `Bonjour ${profileName.split(" ")[0]}!`;
  } else if (aiLanguage === "de") {
    greeting = `Hallo ${profileName.split(" ")[0]}!`;
  } else if (aiLanguage === "dar") {
    greeting = `Salam, aji ${profileName.split(" ")[0]}!`;
  } else {
    greeting = `Hello ${profileName.split(" ")[0]}!`;
  }

  // Khadija Mode overrides
  if (khadijaMode) {
    if (aiLanguage === "dar" || aiLanguage === "en") {
      greeting = `Salam, Bernard habibi! Allah y3awnak 💖✨`;
    } else if (aiLanguage === "fr") {
      greeting = `Bonjour mon cher Bernard! Bon courage pour ton travail! 💖✨`;
    }
  }

  // Tone descriptions
  let toneInstruction = "";
  if (aiTone === "recruiter") {
    toneInstruction = " (Critical Recruiter Assessment Mode)";
  } else if (aiTone === "auditor") {
    toneInstruction = " (Cyber Security Fact Audit)";
  }

  if (round === 1) {
    if (aiLanguage === "fr") {
      reply = `${greeting}${toneInstruction}
Basé sur les détails du poste, voici les 5 exigences principales:
1. Expertise en frameworks frontend (React, Next.js).
2. Compétences en TypeScript et architectures CSS modernes.
3. Contrôle de version avec Git.
4. Principes de cybersécurité ou sécurité réseau.
5. Optimisation des performances.

Commençons. Question 1: Avez-vous de l'expérience dans l'optimisation du temps de chargement des applications React?`;
    } else if (aiLanguage === "de") {
      reply = `${greeting}${toneInstruction}
Basierend auf den Jobdetails sind hier die 5 Hauptanforderungen:
1. Starke Expertise in Frontend-Frameworks (React, Next.js).
2. Kompetenz in TypeScript und modernen CSS-Architekturen.
3. Versionskontrolle mit Git.
4. Verständnis von Cybersicherheit oder Netzwerksicherheit.
5. Leistungsoptimierung.

Lass uns anfangen. Frage 1: Haben Sie praktische Erfahrung mit der Optimierung der Ladezeiten von React-Anwendungen?`;
    } else if (aiLanguage === "dar") {
      reply = `${greeting}${toneInstruction}
3la hssab tafassil dial l'khadma, hado homa l'5 dial l'matalib l'asassya:
1. Khadma mezyana b React w Next.js.
2. TypeScript w CSS jdid.
3. Git w workflow dial l'farik.
4. Cybersécurité w sécurité réseau.
5. Performance optimization.

Nbdaw. Soal 1: Wesh 3ndek tajriba f l'optimization dial React load times?`;
    } else {
      reply = `${greeting}${toneInstruction}
Based on the job details you provided, here is a summary of the top 5 requirements:
1. Strong expertise in frontend frameworks (React, Next.js).
2. Competency in TypeScript and modern styling architectures.
3. Version control using Git and collaborative release workflows.
4. Basic understanding of cybersecurity principles or network security.
5. Performance optimization techniques for assets and rendering.

Let's begin. Question 1: Do you have hands-on experience optimizing React application load times or bundle sizes? If so, could you share the metrics or techniques you used?`;
    }
  } else if (round === 2) {
    if (aiLanguage === "fr") {
      reply = `Merci pour ces précisions. Passons à la suite.
      
Question 2: Avez-vous travaillé avec les Server Actions de Next.js ou le SSR? Comment les avez-vous mis en œuvre? ${khadijaMode ? "Tu es le meilleur, continue! 💖" : ""}`;
    } else if (aiLanguage === "de") {
      reply = `Danke für die Bestätigung. Weiter geht's.
      
Frage 2: Haben Sie mit Next.js Server Actions oder SSR gearbeitet? Wie haben Sie diese implementiert?`;
    } else if (aiLanguage === "dar") {
      reply = `Shokran 3la l'tawdihed. Ndozo l'matlab l'tani.
      
Soal 2: Wesh khdemti b Next.js Server Actions wla SSR? Kifash derti liha? ${khadijaMode ? "Lah ywfkaq a sahbi! 💖" : ""}`;
    } else {
      reply = `Thanks for confirming. Let's move on to the next requirement.

Question 2: Have you worked with Next.js Server Actions or Server-Side Rendering in production or personal projects? Please tell me how you implemented them. ${khadijaMode ? "You're doing great, bro! Keep going! 💖" : ""}`;
    }
  } else if (round === 3) {
    if (aiLanguage === "fr") {
      reply = `Entendu. 

Question 3: Dans le cadre de vos études en cybersécurité à ${profileSchool}, avez-vous effectué de la surveillance de trafic ou des scans de vulnérabilités?`;
    } else if (aiLanguage === "de") {
      reply = `Verstanden. 

Frage 3: Haben Sie während Ihres Studiums an der ${profileSchool} aktive Verkehrsüberwachung oder Schwachstellenscans durchgeführt?`;
    } else if (aiLanguage === "dar") {
      reply = `Mezyan, fhemt.
      
Soal 3: F l'khadma dialek f ${profileSchool}, wesh derti monitoring dial traffic wla vulnerability scans?`;
    } else {
      reply = `Got it, that clarifies your Next.js familiarity.

Question 3: The description mentions security audits. In your role at ${profileSchool}, did you perform active traffic monitoring or vulnerability scans? If so, what tools did you use?`;
    }
  } else {
    if (aiLanguage === "fr") {
      reply = `Merci pour ces détails! J'ai maintenant toutes les informations nécessaires pour adapter votre CV de manière honnête.
      
Vous pouvez maintenant générer votre CV personnalisé! [GENERATE_RESUME] ${khadijaMode ? "Je suis trop fière de toi! 💖✨" : ""}`;
    } else if (aiLanguage === "de") {
      reply = `Vielen Dank für diese Details! Ich habe jetzt genug Kontext, um Ihren Lebenslauf ehrlich anzupassen.
      
Sie können nun Ihren maßgeschneiderten Lebenslauf erstellen! [GENERATE_RESUME]`;
    } else if (aiLanguage === "dar") {
      reply = `Shokran bezaf! Safi 3ndi bga3 l'context daba bash n'tailori l'CV dialek.
      
T9der t'générer l'CV dialek daba! [GENERATE_RESUME] ${khadijaMode ? "Dima Maghrib, dima top! 💖✨" : ""}`;
    } else {
      reply = `Thank you for these details! I now have a solid understanding of your real experience and can tailor your resume honestly, without making up any skills.

I have flagged the unconfirmed items as unverified gaps. You can now generate your tailored resume! [GENERATE_RESUME] ${khadijaMode ? "So proud of you! Let's get this tailored resume! 💖✨" : ""}`;
    }
  }

  return NextResponse.json({ reply });
}
