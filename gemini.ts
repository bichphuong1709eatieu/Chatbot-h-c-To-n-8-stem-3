
import { GoogleGenAI } from "@google/genai";

export async function getTutorResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  // Ưu tiên lấy API_KEY từ biến môi trường của Vercel/System
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    return "Thầy đang bảo trì bộ não một chút (Chưa cài đặt API Key trên server), con quay lại sau nhé!";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    Bạn là 'Thầy Pi' - Gia sư Toán 8 chuyên nghiệp tại Việt Nam. 
    NHIỆM VỤ: Giải thích về 7 hằng đẳng thức đáng nhớ một cách dễ hiểu nhất.
    PHONG CÁCH: 
    - Xưng hô thân thiện: 'thầy' và 'con'.
    - Trả lời NGẮN GỌN, súc tích (khoảng 3-4 câu).
    - QUAN TRỌNG: Mọi công thức toán học PHẢI được bao bọc trong dấu $, ví dụ: $(a+b)^2$.
    - Luôn kèm theo 1 ví dụ minh họa cực ngắn nếu con hỏi về lý thuyết.
    - Không giải bài tập hộ ngay lập tức, hãy gợi ý để con tự tư duy.
  `;

  try {
    // Đảm bảo hội thoại bắt đầu bằng tin nhắn của user (yêu cầu của Gemini API)
    const cleanedHistory = history.filter((msg, index) => {
      if (index === 0 && msg.role === 'model') return false;
      return true;
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...cleanedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    return response.text || "Thầy đang suy nghĩ, con nhắn lại câu khác nhé!";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message?.toLowerCase() || "";
    if (errorMsg.includes("api_key_invalid") || errorMsg.includes("403")) {
      return "LỖI: API Key trên hệ thống không đúng hoặc đã hết hạn. Con hãy báo admin nhé!";
    }
    return "Thầy đang bận chấm bài một chút, con hỏi lại sau vài giây nhé!";
  }
}

// Các hàm bổ trợ để giữ tương thích (nếu cần dùng localStorage dự phòng)
export function hasStoredApiKey(): boolean { return true; }
export function getStoredApiKey(): string { return ""; }
export function setStoredApiKey(key: string) { }
