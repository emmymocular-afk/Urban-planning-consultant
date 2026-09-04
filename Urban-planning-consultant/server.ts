import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for JSON bodies to accept base64 map images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize GoogleGenAI SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not defined.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// JSON response schema for structured urban advice
const urbanAdviceSchemaResponse = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.OBJECT,
      properties: {
        detectedFeatures: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Các đặc điểm tự nhiên và cải tạo chính phát hiện thấy trên hình ảnh (ví dụ: bãi đất trống, sông ngòi, ngã tư lớn...)"
        },
        terrainType: {
          type: Type.STRING,
          description: "Phân loại địa hình tổng quát (ví dụ: Đồng bằng, Ven sông, Đồi núi, Khu đô thị cũ...)"
        },
        currentInfrastructures: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Hạ tầng kết cấu hiện hữu có thể quan sát thấy."
        },
        challenges: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Các thách thức quy hoạch chính ở vùng này (ví dụ: thiếu kết nối, nguy cơ ngập lụt, quá tải...)"
        },
        opportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Các cơ hội phát triển đô thị nổi bật dựa trên quỹ đất hoặc vị trí địa lý."
        }
      },
      required: ["detectedFeatures", "terrainType", "currentInfrastructures", "challenges", "opportunities"]
    },
    strategies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Tiêu đề chiến lược phát triển" },
          description: { type: Type.STRING, description: "Chi tiết ngắn gọn về chiến lược quy hoạch" }
        },
        required: ["title", "description"]
      },
      description: "2-3 chiến lược tổng thể quy hoạch vùng này để thành đô thị phát triển mạnh mẽ."
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Mã định danh duy nhất viết liền không dấu, ví dụ: 'tram-y-te-thong-minh'" },
          name: { type: Type.STRING, description: "Tên công trình đề xuất bằng Tiếng Việt đầy đủ" },
          category: { type: Type.STRING, description: "Thể loại: Green (Năng lượng, Cây xanh/Môi trường), Utility (Hạ tầng tiện ích, Thu gom nước thải), Transport (Giao thông, bến bãi), Community (Văn hóa giáo dục y tế, công cộng), Commercial (Khu trung tâm mua sắm, văn phòng), Industrial (Khu công nghệ cao, logistic), or Housing (Nhà ở xã hội, đô thị trẻ)" },
          description: { type: Type.STRING, description: "Chi tiết mô tả công năng, quy mô của công trình này" },
          estimatedCost: { type: Type.STRING, description: "Mức đầu tư dự thảo: Thấp, Trung bình, Cao, Rất cao" },
          urgency: { type: Type.STRING, description: "Mức độ cấp thiết: Thấp, Trung bình, Cao, Khẩn cấp" },
          impact: {
            type: Type.OBJECT,
            properties: {
              traffic: { type: Type.NUMBER, description: "Tác động đến Giao thông (thành số điểm từ -10 đến +10)" },
              environment: { type: Type.NUMBER, description: "Tác động đến Môi trường (thành số điểm từ -10 đến +10)" },
              qualityOfLife: { type: Type.NUMBER, description: "Tác động đến Chất lượng sống dân sinh (thành số điểm từ -10 đến +10)" },
              economy: { type: Type.NUMBER, description: "Tác động đến Tăng trưởng Kinh tế (thành số điểm từ -10 đến +10)" }
            },
            required: ["traffic", "environment", "qualityOfLife", "economy"]
          },
          suggestionCoordinates: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER, description: "Tọa độ phần trăm ngang (0-100) đề xuất hiển thị trên màn hình khu vực trống trong ảnh bản đồ" },
              y: { type: Type.NUMBER, description: "Tọa độ phần trăm dọc (0-100) đề xuất hiển thị trên màn hình khu vực trống trong ảnh bản đồ" }
            },
            required: ["x", "y"]
          },
          explanation: { type: Type.STRING, description: "Giải trình trực quan lý do đặt công trình tại vị trí tọa độ đề xuất này." }
        },
        required: ["id", "name", "category", "description", "estimatedCost", "urgency", "impact", "suggestionCoordinates", "explanation"]
      }
    },
    cityScoreImpact: {
      type: Type.OBJECT,
      properties: {
        initialScores: {
          type: Type.OBJECT,
          properties: {
            greenRating: { type: Type.NUMBER, description: "Điểm mảng xanh hiện hữu ban đầu (0-100)" },
            trafficCapacity: { type: Type.NUMBER, description: "Điểm năng lực giao thông ban đầu (0-100)" },
            economyGrowth: { type: Type.NUMBER, description: "Điểm động sinh kinh tế ban đầu (0-100)" },
            livingStandard: { type: Type.NUMBER, description: "Điểm tiện ích chất lượng sống ban đầu (0-100)" }
          },
          required: ["greenRating", "trafficCapacity", "economyGrowth", "livingStandard"]
        },
        potentialScores: {
          type: Type.OBJECT,
          properties: {
            greenRating: { type: Type.NUMBER, description: "Điểm mảng xanh tiềm năng tối đa sau khi xây dựng (0-100)" },
            trafficCapacity: { type: Type.NUMBER, description: "Điểm giao thông tiềm năng sau khi xây dựng (0-100)" },
            economyGrowth: { type: Type.NUMBER, description: "Điểm kinh tế tiềm năng sau khi xây dựng (0-100)" },
            livingStandard: { type: Type.NUMBER, description: "Điểm chất lượng cuộc sống tiềm năng sau khi xây dựng (0-100)" }
          },
          required: ["greenRating", "trafficCapacity", "economyGrowth", "livingStandard"]
        },
        narrative: { type: Type.STRING, description: "Phát biểu tổng kết đầy cảm hứng về quy hoạch tương lai cho toàn diện khu vực này." }
      },
      required: ["initialScores", "potentialScores", "narrative"]
    }
  },
  required: ["analysis", "strategies", "projects", "cityScoreImpact"]
};

// API Route for analyzing map screenshots
app.post("/api/analyze-map", async (req, res) => {
  try {
    const { image, mimeType, cityGoal, additionalNotes, language } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: "Không tìm thấy hình ảnh bản đồ hoặc định dạng hợp lệ." });
    }

    const ai = getGeminiClient();

    // Prepare content parts
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: image,
      },
    };

    const isEn = language === "en";
    const textPart = {
      text: isEn 
        ? `You are an outstanding Urban Planner and Senior Infrastructure Expert.
Analyze this image (copied from Google Maps or satellite views of a land/urban area undergoing development or remodeling).

TARGET CITY DEVELOPMENT GOAL: "${cityGoal || 'Ecological, Smart & Highly Livable City'}"
USER'S ADDITIONAL SPECIAL NOTES: "${additionalNotes || 'No specific requests'}"

Please identify:
1. General terrain, natural structure elements (river, mountain, lake, etc.) or built signatures (lines, existing houses) in the photo.
2. Major planning challenges (clogging, lacking greenspace, lack of health or education services, flood risks, etc.) and opportunities.
3. Propose at least 4 to a maximum of 6 highly realistic, specific, and vital development projects to transform this area into a part of a sustainable smart city.
Proposals must be diversified across categories: Green, Utility, Transport, Community, Commercial, Industrial, or Housing.
4. For each project, propose a precise percentage coordinate x (10 to 90) and y (10 to 90) corresponding to empty spots or remodeling sites on this image so users can visualize overlay placements clearly. Balance the x, y coordinates rationally based on the terrain structure you see in the image.

CRITICAL INSTRUCTION: You MUST return the full response and all texts in English, including project names, descriptions, challenges, opportunities, explanations, strategies, narratives, categories, etc. Use categories from: Green, Utility, Transport, Community, Commercial, Industrial, or Housing.`
        : `Bạn là một Kiến trúc sư Quy hoạch đô thị lỗi lạc và Chuyên gia Hạ tầng cao cấp. 
Hãy phân tích hình ảnh này (được chụp từ bản đồ Google Maps hoặc ảnh vệ tinh của một khu đất/vùng đô thị đang phát triển hoặc cần cải tạo quy hoạch).

MỤC TIÊU PHÁT TRIỂN CỦA THÀNH PHỐ: "${cityGoal || 'Đô thị Sinh thái, Thông minh & Đáng sống'}"
GHI CHÚ THÊM CỦA NGƯỜI DÙNG: "${additionalNotes || 'Không có yêu cầu đặc biệt'}"

Hãy xác định:
1. Địa hình chung, các yếu tố cấu trúc tự nhiên (sông, núi, hồ) hoặc nhân tạo (vạch kẻ đường, nhà cửa hiện hữu) trong ảnh.
2. Các thách thức hiện thời (ùn tắc, thiếu mảng xanh, thiếu hạ tầng y tế/giáo dục, ngập nước...) và cơ hội phát triển.
3. Đề xuất ít nhất 4 cho tới tối đa 6 dự án công trình cụ thể, thực tiễn và cần thiết nhất để khu vực này bứt phá trở thành một phần của thành phố thông minh phát triển bền vững.
Các công trình đề xuất nên đa dạng giữa các nhóm: mảng xanh sinh thái, nút giao thông/mạng lưới kết nối, trung tâm công cộng/y tế/giáo dục, xử lý chất thải/nhà máy điện sạch, thương mại dịch vụ.
4. Với mỗi công trình, hãy gợi ý TOẠ ĐỘ PHẦN TRĂM x (từ 10 đến 90) và y (từ 10 đến 90) tương ứng với vị trí đất trống hoặc vị trí cần cải tạo trên bức ảnh này để người dùng có thể nhìn thấy trực quan điểm đặt công trình. Hãy cân đối tọa độ x, y thật hợp lý dựa vào cấu trúc ảnh thực tế mà bạn nhìn thấy.

Yêu cầu trả về kết quả hoàn toàn bằng tiếng Việt với cấu trúc JSON chính xác theo mô tả sơ đồ cấu trúc.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: urbanAdviceSchemaResponse,
        temperature: 0.2, // Lower temperature for structured planning recommendations
      },
    });

    if (!response || !response.text) {
      throw new Error("Không nhận được câu trả lời hợp lệ từ Gemini API.");
    }

    const resultData = JSON.parse(response.text.trim());
    return res.json(resultData);
  } catch (error: any) {
    console.error("Lỗi phân tích bản đồ trong server.ts:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi phân tích bản đồ bằng AI: " + (error.message || error),
    });
  }
});

// API Route for follow-up urban planner consultation chat
app.post("/api/chat-counsel", async (req, res) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Thiếu dữ liệu câu hỏi từ người dùng." });
    }

    const ai = getGeminiClient();
    const isEn = language === "en";
    const languageDirective = isEn 
      ? "\n\n[DIRECTIVE: You MUST answer the question completely in English. Speak professionally and keep it concise as a senior urban architect.]"
      : "\n\n[DIRECTIVE: Bạn PHẢI trả lời hoàn toàn bằng Tiếng Việt. Trả lời chuyên nghiệp và ngắn gọn của một kỹ sư/kiến trúc sư trưởng chuyên gia.]";

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt + languageDirective,
      config: {
        temperature: 0.6,
      }
    });

    const reply = result.text || (isEn ? "Sorry, I could not decipher this prompt. Please ask again." : "Xin lỗi, tôi chưa giải mã được ý kiến này. Bạn có thể hỏi lại không?");
    return res.json({ reply });
  } catch (error: any) {
    console.error("Lỗi trò chuyện tư vấn quy hoạch:", error);
    return res.status(500).json({
      error: "Đã xảy ra lỗi khi trao đổi với chuyên gia AI: " + (error.message || error),
    });
  }
});

// Serve static assets and SPA fallback or use Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Server connected at http://0.0.0.0:${PORT}`);
  });
}

startServer();
