import { GoogleGenAI } from "@google/genai";
import { FormData, ImageStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGreeting = async (data: FormData): Promise<string> => {
  const prompt = `
    以下の情報を元に、引っ越し先の近隣住民に向けた挨拶状の文章を作成してください。
    
    【情報】
    名前: ${data.name}
    家族構成: ${data.family}
    旧住所: ${data.oldAddress.location}
    新住所: ${data.newAddress.location}

    【シチュエーション】
    - 新居への引っ越しの挨拶。
    - 相手は初対面の近隣住民（向こう三軒両隣など）。

    【必須要素】
    - 「はじめまして」という挨拶。
    - 「これからよろしくお願いします」という気持ち。
    - 引っ越しや工事の期間中、騒音などで迷惑をかけたことへのお詫び（「工事期間中はご迷惑をおかけしました」等）を必ず含めること。
    - 200文字以内で簡潔に。
    - 丁寧語（です・ます調）で。
    - 郵便番号や具体的な番地は記載せず、文章のみを出力してください。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "文章の生成に失敗しました。";
  } catch (error) {
    console.error("Text Generation Error:", error);
    return "エラーが発生しました。もう一度お試しください。";
  }
};

export const generateStyledImage = async (base64Image: string, style: ImageStyle): Promise<string> => {
  // Extract pure base64 if it has the data url prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  let prompt = "";
  switch (style) {
    case 'Simple':
      prompt = "Transform this image into a simple, minimalist line art illustration. Clean lines, few colors, elegant.";
      break;
    case 'Pop':
      prompt = "Transform this image into a colorful, vibrant Pop Art style illustration. Bold colors, comic book dots, energetic.";
      break;
    case 'Cheap':
      prompt = "Transform this image into a deliberately low-quality, MS Paint style, funny and crude doodle. Pixelated, bad anatomy, humorous.";
      break;
    case 'Gorgeous':
      prompt = "Transform this image into a luxurious, highly detailed oil painting style. Gold accents, dramatic lighting, baroque aesthetic.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      }
    });

    // Handle potential text response if image gen fails or model decides to talk
    // Check parts for image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
    }
    
    throw new Error("No image returned");

  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};