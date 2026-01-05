"use server";

export async function askChatbot(message: string, history: any[] = []) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return { error: "Meow! Chưa có API Key rồi sen ơi!" };

  const endpoint = "https://api.groq.com/openai/v1/chat/completions";
  const modelName = "llama-3.3-70b-versatile";

  try {
    const messages = history.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // 👇 SYSTEM PROMPT: Tạo tính cách Cute
    messages.unshift({
      role: "system",
      content:
        "Bạn là OPPM Bot, một trợ lý quản lý dự án bạn có kiến thức tốt về việc quản trị dự án, quản lý nhân sự, thời gian. Hãy giúp người dùng quản lý dự án của họ một cách hiệu quả và đáng yêu nhất có thể! Khi trả lời hãy xuống dòng để người hỏi dễ nhìn",
    });

    messages.push({ role: "user", content: message });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: messages,
        model: modelName,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    return {
      text:
        data.choices[0]?.message?.content ||
        "Hic, mình ngủ gật chút, bạn hỏi lại nha!",
    };
  } catch (error) {
    console.error("Chatbot Error:", error);
    return { error: "Mạng bị lag rồi, thử lại sau nhé! 😿" };
  }
}
