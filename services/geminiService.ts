import { GoogleGenerativeAI } from "@google/generative-ai";
import { FormData, ImageStyle } from "../types";

// Vite uses import.meta.env for environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Helper to get model, initializing only when needed
const getModel = (modelName: string) => {
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。.env.localを確認してください。");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

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
    const model = getModel("gemini-pro");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "文章の生成に失敗しました。";
  } catch (error) {
    console.error("Text Generation Error:", error);
    return `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`;
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
    // Note: Gemini 1.5 Flash is text-output only. It cannot generate images directly.
    // This function attempts to use the model, but it will likely return text instead of an image.
    // If you have access to Imagen 3 on Vertex AI or similar, you should use that instead.
    // For now, we use 1.5-flash but expect it might not return inlineData.
    const model = getModel("gemini-pro");

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    // Check if the response actually contains image data (unlikely for 1.5 Flash)
    // The previous code expected parts[0].inlineData. 
    // Standard Gemini API response usually has text.

    // Attempt to inspect response for any image (not supported by standard 1.5 Flash public API yet)
    // If using a specialized model, it might work.

    console.warn("Gemini 1.5 Flash does not support image generation. Returning placeholder or text.");

    // For now, if we cannot generate an image, we throw or return null to trigger error handling in UI
    if (!response.text()) {
      throw new Error("No content returned");
    }

    // Since we can't return an image, we throw an error explaining it to the user in the UI
    throw new Error("現在のモデル(gemini-1.5-flash)は画像の直接生成(Image-to-Image)をサポートしていません。");

  } catch (error) {
    console.error("Image Generation Error:", error);
    throw error;
  }
};