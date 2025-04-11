export async function callGroq(prompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: `You are an expert UI/UX critic. Respond in this **exact** structure:

Strengths:
- ...

Weaknesses:
- ...

Suggestions:
- ...

Roast:
- Brutal, honest criticism of any cringe, outdated, or bad UI/UX decisions.

Keep it concise. Use bullet points. No intro, no conclusion. No extra text outside these sections.`,
        },
        {
          role: "user",
          content: `Here's the page content:\n${prompt}`,
        },
      ],
      temperature: 0.8,
    }),
  });
  const data = await res.json();

  const raw = data.choices[0].message.content;

  return parseCritique(raw);
}

function parseCritique(text: string) {
  const sections = {
    strengths: [] as string[],
    weaknesses: [] as string[],
    suggestions: [] as string[],
    roast: [] as string[],
  };

  const blocks = text.split("\n\n");
  blocks.forEach((block) => {
    const lines = block.split("\n");
    const title = lines[0].replace(":", "").trim();
    const bulletPoints = lines
      .slice(1)
      .map((line) => line.replace("-", "").trim());
    if (title.toLocaleLowerCase() === "strengths") {
      sections.strengths = bulletPoints;
    } else if (title.toLocaleLowerCase() === "weaknesses") {
      sections.weaknesses = bulletPoints;
    } else if (title.toLocaleLowerCase() === "suggestions") {
      sections.suggestions = bulletPoints;
    } else if (title.toLocaleLowerCase() === "roast") {
      sections.roast = bulletPoints;
    }
  });
  return sections;
}
