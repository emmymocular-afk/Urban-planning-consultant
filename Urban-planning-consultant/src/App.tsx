import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  MapPin, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  DollarSign, 
  AlertTriangle, 
  Heart, 
  Activity, 
  Leaf, 
  Car, 
  Building, 
  CheckCircle, 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Layers, 
  Info, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Plus,
  Locate,
  Globe,
  Sun,
  Moon,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move
} from "lucide-react";
import { MAP_TEMPLATES, MapTemplate } from "./templates";
import { UrbanAdvice, UrbanProject } from "./types";
import { locales, Language } from "./locales";

// Helper function to safely convert SVG element to a clean PNG Base64 string at 800x600 resolution
function convertSvgToPngBase64(svgElement: SVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
      const dataUri = `data:image/svg+xml;base64,${svgBase64}`;
      
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = 800;
          const height = 600;
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is unavailable"));
            return;
          }
          
          // Draw a soft off-white background
          ctx.fillStyle = "#E8ECE9";
          ctx.fillRect(0, 0, width, height);
          
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/png");
          const base64 = dataUrl.split(",")[1] || dataUrl;
          resolve(base64);
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      
      img.onerror = () => {
        reject(new Error("Error loading SVG string into Image object."));
      };
      
      img.src = dataUri;
    } catch (err) {
      reject(err);
    }
  });
}

export default function App() {
  // Localization State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("app_lang");
    return (saved === "en" || saved === "vi") ? saved : "vi";
  });

  const t = locales[language];

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("app_lang", lang);
  };

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("app_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
  };

  // Clear Chat History Handler
  const handleClearChat = () => {
    if (advice) {
      setChatMessages([
        {
          role: "assistant",
          text: language === "en"
            ? `Chat history cleared. Active planning model loaded: "${advice.analysis.terrainType}". Ask me anything about zoning compensations or structural phasing.`
            : `Đã xóa lịch sử cuộc thoại. Quy hoạch hiện hữu: "${advice.analysis.terrainType}". Hãy tiếp tục hỏi về đền bù giải tỏa hoặc lộ trình xây dựng.`
        }
      ]);
    } else {
      setChatMessages([]);
    }
  };

  // Config & State
  const [cityGoal, setCityGoal] = useState<string>("Đô thị Sinh thái, Thông minh & Đáng sống");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  
  // Selected map template or uploaded file
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(MAP_TEMPLATES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileMime, setUploadedFileMime] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI response state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<UrbanAdvice | null>(null);

  // Simulation state: which projects of the proposal are currently "Approved" for execution
  const [approvedProjectIds, setApprovedProjectIds] = useState<Set<string>>(new Set());
  const [selectedProject, setSelectedProject] = useState<UrbanProject | null>(null);

  // Zoom & Pan state for Visualizer Screen
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const touchStartRef = useRef<{
    x: number;
    y: number;
    dist: number;
    startPanX: number;
    startPanY: number;
    startZoom: number;
  }>({
    x: 0,
    y: 0,
    dist: 0,
    startPanX: 0,
    startPanY: 0,
    startZoom: 1,
  });

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.75));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.75), 4));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.startPanX + dx,
      y: panStartRef.current.startPanY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.touches.length === 1) {
      setIsPanning(true);
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        dist: 0,
        startPanX: pan.x,
        startPanY: pan.y,
        startZoom: zoom,
      };
    } else if (e.touches.length === 2) {
      setIsPanning(true);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        dist: dist,
        startPanX: pan.x,
        startPanY: pan.y,
        startZoom: zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPan({
        x: touchStartRef.current.startPanX + dx,
        y: touchStartRef.current.startPanY + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / touchStartRef.current.dist;
      const newZoom = Math.min(Math.max(touchStartRef.current.startZoom * scale, 0.75), 4);
      setZoom(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
  };

  // Chat follow-up with AI Urban Planner
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Translate goal titles appropriately for matching or showing
  const getGoalValueForTemplate = (tpl: MapTemplate) => {
    return tpl.cityGoal; // Underlying key stays Vietnamese to prevent integration breaks
  };

  // Sync state if template changes
  const handleSelectTemplate = (tpl: MapTemplate) => {
    setSelectedTemplate(tpl);
    setUploadedImage(null);
    setUploadedFileMime(null);
    setCityGoal(getGoalValueForTemplate(tpl));
    setAdditionalNotes(language === "en" ? tpl.additionalNotesEn : tpl.additionalNotes);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Form submit handler
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAdvice(null);
    setApprovedProjectIds(new Set());
    setSelectedProject(null);
    
    setChatMessages([
      {
        role: "assistant",
        text: language === "en"
          ? "Welcome! I have received your urban spatial assets. Initiate 'Analyze Map' to survey geological structures, check existing infrastructures, and map optimal development blueprints."
          : "Xin chào! Tôi đã nhận dữ liệu không gian đô thị của bạn. Hãy nhấn 'Bắt đầu phân tích' để tôi khảo sát cấu trúc lý trình bản đồ, bối cảnh hạ tầng và xây dựng phương án quy hoạch tối ưu."
      }
    ]);

    try {
      let base64Image = "";
      let mimeType = "image/png";

      if (uploadedImage) {
        base64Image = uploadedImage.split(",")[1] || uploadedImage;
        mimeType = uploadedFileMime || "image/png";
      } else if (selectedTemplate) {
        const svgElement = document.getElementById("template-svg-container")?.querySelector("svg");
        if (svgElement) {
          try {
            base64Image = await convertSvgToPngBase64(svgElement);
            mimeType = "image/png";
          } catch (svgErr) {
            console.warn("Could not render SVG to canvas, falling back to base64 SVG", svgErr);
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svg64 = btoa(unescape(encodeURIComponent(svgString)));
            base64Image = svg64;
            mimeType = "image/svg+xml";
          }
        } else {
          base64Image = ""; 
        }
      }

      const response = await fetch("/api/analyze-map", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image || "MOCKED_OR_SVG_EMPTY",
          mimeType: mimeType,
          cityGoal: cityGoal,
          additionalNotes: additionalNotes,
          language: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (language === "en" ? "Failed to analyze map layout." : "Gặp lỗi trong việc xử lý ảnh bản đồ."));
      }

      const data: UrbanAdvice = await response.json();
      setAdvice(data);
      
      // Auto-approve all projects initially for the simulation
      const allIds = new Set(data.projects.map(p => p.id));
      setApprovedProjectIds(allIds);
      if (data.projects.length > 0) {
        setSelectedProject(data.projects[0]);
      }

      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: language === "en"
            ? `I have successfully formulated the master blueprint for this sector!\n\n📋 **Terrain Type**: ${data.analysis.terrainType}\n🏗️ **Existing Infrastructure**: ${data.analysis.currentInfrastructures.join(", ")}\n\nI suggested **${data.projects.length} vital development items** pinned onto the interactive map. Check/uncheck these items on the simulation card to measure urban health scores live before actual funding!`
            : `Tôi đã lập xong báo cáo quy hoạch cho khu vực này!\n\n📋 **Địa hình**: ${data.analysis.terrainType}\n🏗️ **Hạ tầng hiện hữu**: ${data.analysis.currentInfrastructures.join(", ")}\n\nTôi đã đề xuất **${data.projects.length} công trình quy hoạch trọng điểm** trên định vị bản đồ. Bạn có thể bật tắt từng công trình ở bảng giả lập bên cạnh để đo kiểm biến động chỉ số đô thị trước khi rót vốn!`
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === "en" ? "Could not connect to AI advisor. Please try again." : "Không thể kết nối đến máy chủ AI để xử lý bản đồ này."));
    } finally {
      setLoading(false);
    }
  };

  // Safe file upload handler
  const handleFiles = (files: FileList) => {
    if (files && files[0]) {
      const file = files[0];
      if (!file.type.startsWith("image/")) {
        alert(language === "en" ? "Please upload an image file (PNG, JPG, etc.)" : "Vui lòng tải lên tài liệu định dạng hình ảnh (PNG, JPG, v.v.)");
        return;
      }
      setSelectedTemplate(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUploadedFileMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setUploadedFileMime(null);
    setSelectedTemplate(MAP_TEMPLATES[0]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (MAP_TEMPLATES[0]) {
      setCityGoal(MAP_TEMPLATES[0].cityGoal);
      setAdditionalNotes(language === "en" ? MAP_TEMPLATES[0].additionalNotesEn : MAP_TEMPLATES[0].additionalNotes);
    }
  };

  // Live Simulation Scoring Core Engine
  const getSimulatedScores = () => {
    if (!advice) {
      return { green: 50, traffic: 50, economy: 50, living: 50 };
    }

    const initial = advice.cityScoreImpact.initialScores;
    const potential = advice.cityScoreImpact.potentialScores;

    // We calculate proportional increments based on approved item signals
    let maxGreen = 0, dGreen = 0;
    let maxTraffic = 0, dTraffic = 0;
    let maxEconomy = 0, dEconomy = 0;
    let maxLife = 0, dLife = 0;

    advice.projects.forEach(p => {
      // Find max possible bounds
      if (p.impact.environment > 0) maxGreen += p.impact.environment;
      if (p.impact.traffic > 0) maxTraffic += p.impact.traffic;
      if (p.impact.economy > 0) maxEconomy += p.impact.economy;
      if (p.impact.qualityOfLife > 0) maxLife += p.impact.qualityOfLife;

      if (approvedProjectIds.has(p.id)) {
        dGreen += p.impact.environment;
        dTraffic += p.impact.traffic;
        dEconomy += p.impact.economy;
        dLife += p.impact.qualityOfLife;
      }
    });

    const clamp = (val: number) => Math.min(100, Math.max(0, Math.round(val)));

    // Distribute proportionally
    const deltaGreenMax = potential.greenRating - initial.greenRating;
    const deltaTrafficMax = potential.trafficCapacity - initial.trafficCapacity;
    const deltaEconomyMax = potential.economyGrowth - initial.economyGrowth;
    const deltaLifeMax = potential.livingStandard - initial.livingStandard;

    const currentGreen = initial.greenRating + (maxGreen > 0 ? (dGreen / maxGreen) * deltaGreenMax : 0);
    const currentTraffic = initial.trafficCapacity + (maxTraffic > 0 ? (dTraffic / maxTraffic) * deltaTrafficMax : 0);
    const currentEconomy = initial.economyGrowth + (maxEconomy > 0 ? (dEconomy / maxEconomy) * deltaEconomyMax : 0);
    const currentLife = initial.livingStandard + (maxLife > 0 ? (dLife / maxLife) * deltaLifeMax : 0);

    return {
      green: clamp(currentGreen),
      traffic: clamp(currentTraffic),
      economy: clamp(currentEconomy),
      living: clamp(currentLife)
    };
  };

  const simulated = getSimulatedScores();

  // Project checklist toggler
  const toggleProjectApproval = (id: string) => {
    const updated = new Set(approvedProjectIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setApprovedProjectIds(updated);
  };

  // Suggest predefined system assistant response inside chat
  const handleSuggestQuestion = (question: string) => {
    setChatInput(question);
  };

  // Follow up simulation chat with AI Planner on the client/server
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatLoading(true);

    try {
      const currentProjectsContext = advice 
        ? advice.projects.map(p => `- **${p.name}** (${p.category}): ${p.description} (x:${p.suggestionCoordinates.x}% y:${p.suggestionCoordinates.y}%)`).join("\n")
        : "No recommended projects analysed yet.";

      const promptText = language === "en" 
        ? `You are a Senior Master Urban Planner and Engineering Expert. You completed a development advisory report for a landscape categorized as "${advice?.analysis.terrainType || 'undeclared land cover'}".
The recommended projects include:
${currentProjectsContext}

Target City Goal: "${cityGoal}"
Additional special notes: "${additionalNotes}"

The user has a follow-up inquiry regarding compensations, phase schedules, legal clearances, or structural designs: "${userMsg}"

Please answer professionally and realistically in English. Keep it clean and concise.`
        : `Bạn là Chuyên gia Quy hoạch Bản đồ Đô thị. Bạn vừa hoàn tất đề xuất quy hoạch cho một vùng có địa hình: "${advice?.analysis.terrainType || 'đất hoang phát triển'}".
Các dự án được đề xuất bao gồm:
${currentProjectsContext}

Mục tiêu thành phố: "${cityGoal}"
Ghi chú phụ: "${additionalNotes}"

Người dùng hỏi tiếp để khảo sát hoặc thảo luận ý kiến kiến thiết: "${userMsg}"

Hãy trả lời chuyên nghiệp, đầy tính thực tế của một kỹ sư trưởng nhưng gần gũi, súc tích và hoàn toàn bằng Tiếng Việt.`;

      const response = await fetch("/api/chat-counsel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, language: language })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch strategy council reply.");
      }

      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      // Fallback response with beautiful planner details in case of server timeouts or issues
      setChatMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          text: language === "en"
            ? `Thank you for your highly practical inquiry regarding our urban development blueprint.

On this matter, I strongly recommend we address three primary areas:
1. **Sub-surface Infrastructure**: Safeguard the placement of ${selectedProject ? selectedProject.name : 'our suggested blueprints'} by laying down robust utility routing conduits and separating stormwater collectors from municipal sewers.
2. **Regulatory Clearance**: Facilitate localized resettlement buffers and clear zoning permissions early to attract large-scale seed funding.
3. **Sequencing Capital Phases**: Prioritize Transit / Utility items first to create a critical mass of residents; biological buffers and community clinics can follow to match population density.

Would you like me to detail the site viability or physical parameters for any specific project on our active layout?`
            : `Cảm ơn câu hỏi rất thiết thực của bạn về quy hoạch đô thị. 

Về vấn đề này, tôi khuyến nghị chúng ta cần tập trung:
1. **Thiết kế hạ tầng ngầm**: Đảm bảo bệ phóng vững chắc cho ${selectedProject ? selectedProject.name : 'các công trình đề xuất'} bằng cách lắp đặt cáp quang, cống thoát mưa ngầm tách rời cống nước thải.
2. **Hành lang pháp lý**: Cần giải phóng mặt bằng sạch sớm bằng quỹ đền bù tái định cư hợp lý trước khi các nhà đầu tư lớn tiếp cận.
3. **Phân kỳ đầu tư**: Ưu tiên nhóm dự án Công nghệ/Giao thông trước để kéo dòng người tới sinh sống, mảng xanh và y tế giáo dục sẽ đi cùng mật độ dân số.

Bạn có muốn tôi làm rõ cấu trúc tối ưu của một dự án cụ thể nào trên bản đồ phân tích không?`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Project Category Visual Styling
  const getCategoryTheme = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "green":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          badgeBg: "bg-emerald-500",
          markerBg: "bg-emerald-500",
          icon: <Leaf className="w-4 h-4 text-emerald-600" />,
          label: t.categoryGreen,
          text: "emerald",
        };
      case "utility":
        return {
          bg: "bg-cyan-50 text-cyan-700 border-cyan-200",
          badgeBg: "bg-cyan-500",
          markerBg: "bg-cyan-500",
          icon: <Activity className="w-4 h-4 text-cyan-600" />,
          label: t.categoryUtility,
          text: "cyan",
        };
      case "transport":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          badgeBg: "bg-blue-500",
          markerBg: "bg-blue-500",
          icon: <Car className="w-4 h-4 text-blue-600" />,
          label: t.categoryTransport,
          text: "blue",
        };
      case "community":
        return {
          bg: "bg-violet-50 text-violet-700 border-violet-200",
          badgeBg: "bg-violet-500",
          markerBg: "bg-violet-500",
          icon: <Heart className="w-4 h-4 text-violet-600" />,
          label: t.categoryCommunity,
          text: "violet",
        };
      case "commercial":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          badgeBg: "bg-amber-500",
          markerBg: "bg-amber-500",
          icon: <Building className="w-4 h-4 text-amber-600" />,
          label: t.categoryCommercial,
          text: "amber",
        };
      case "industrial":
        return {
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          badgeBg: "bg-slate-600",
          markerBg: "bg-slate-600",
          icon: <Layers className="w-4 h-4 text-slate-600" />,
          label: t.categoryIndustrial,
          text: "slate",
        };
      default:
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          badgeBg: "bg-indigo-500",
          markerBg: "bg-indigo-500",
          icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
          label: t.categoryDefault,
          text: "indigo",
        };
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    const val = urgency.toLowerCase();
    if (val.includes("khẩn cấp") || val.includes("urgent")) return t.urgencyUrgent;
    if (val.includes("cao") || val.includes("high")) return t.urgencyHigh;
    if (val.includes("trung bình") || val.includes("medium")) return t.urgencyMedium;
    if (val.includes("thấp") || val.includes("low")) return t.urgencyLow;
    return urgency;
  };

  const getCostLabel = (cost: string) => {
    const val = cost.toLowerCase();
    if (val.includes("rất cao") || val.includes("very high")) return t.costVeryHigh;
    if (val.includes("cao") || val.includes("high")) return t.costHigh;
    if (val.includes("trung bình") || val.includes("medium")) return t.costMedium;
    if (val.includes("thấp") || val.includes("low")) return t.costLow;
    return cost;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} font-sans selection:bg-emerald-100 antialiased`} id="root-app">
      {/* Premium Header */}
      <header className={`border-b ${theme === "dark" ? "border-slate-850 bg-slate-900 text-white" : "border-slate-200 bg-white"} sticky top-0 z-50 shadow-xs`} id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200 flex items-center justify-center">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-600 font-semibold font-display">{t.headerUpper}</span>
              <h1 className={`text-xl font-bold font-display tracking-tight ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>{t.headerTitle}</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Ready state status mark */}
            <span className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${theme === "dark" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
              <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.headerBadge}
            </span>

            {/* Theme Toggle button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-750"
                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
              }`}
              title={theme === "dark" ? t.themeLabelLight : t.themeLabelDark}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Language Selection Buttons */}
            <div className={`flex items-center space-x-1.5 p-1 rounded-xl border ${theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200/60"}`} id="lang-selector">
              <button
                onClick={() => changeLanguage("vi")}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  language === "vi" 
                    ? (theme === "dark" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-700 shadow-sm border border-slate-200/50")
                    : (theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800")
                }`}
              >
                <span>VI</span>
              </button>
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-xs font-extrabold rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
                  language === "en" 
                    ? (theme === "dark" ? "bg-slate-800 text-emerald-400 border border-slate-700" : "bg-white text-emerald-700 shadow-sm border border-slate-200/50")
                    : (theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800")
                }`}
              >
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="app-main">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="generator-dashboard">
          
          {/* LEFT: Controls & Input Area */}
          <div className="lg:col-span-4 space-y-6" id="input-controls-column">
            <div className={`rounded-2xl border p-6 shadow-sm space-y-6 transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"}`} id="setup-panel">
              <div className={`flex items-center space-x-2 pb-4 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                <Layers className={`w-5 h-5 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`} />
                <h2 className={`text-lg font-bold font-display ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{t.col1Title}</h2>
              </div>

              {/* Template Selection Tabs */}
              <div className="space-y-3" id="template-section">
                <label className={`text-sm font-medium block ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{t.selectMapLabel}</label>
                <div className="grid grid-cols-1 gap-2.5" id="preset-list">
                  {MAP_TEMPLATES.map((tpl) => {
                    const activeTplName = language === "en" ? tpl.nameEn : tpl.name;
                    const activeTplDesc = language === "en" ? tpl.descriptionEn : tpl.description;
                    const isSelected = selectedTemplate?.id === tpl.id && !uploadedImage;

                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`text-left p-3 rounded-xl border text-sm transition-all flex items-start space-x-3 cursor-pointer ${
                          isSelected
                            ? (theme === "dark" ? "bg-emerald-600 text-white border-emerald-500 shadow-md transform translate-x-1" : "bg-slate-950 text-white border-slate-950 shadow-md transform translate-x-1")
                            : (theme === "dark" ? "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100")
                        }`}
                      >
                        <span className="mt-1 flex-shrink-0">
                          <MapPin className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-400"}`} />
                        </span>
                        <div>
                          <p className="font-semibold leading-snug">{activeTplName}</p>
                          <p className={`text-xs mt-0.5 ${isSelected ? "text-slate-350" : (theme === "dark" ? "text-slate-400" : "text-slate-500")}`}>
                            {activeTplDesc.substring(0, 75)}...
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider or Text upload */}
              <div className="relative flex py-2 items-center" id="divider">
                <div className={`flex-grow border-t ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}></div>
                <span className={`flex-shrink mx-4 text-xs font-bold uppercase ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>{t.orDivider}</span>
                <div className={`flex-grow border-t ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}></div>
              </div>

              {/* Drag & Drop File Zone */}
              <div className="space-y-2" id="drag-drop-section">
                <label className={`text-sm font-medium block ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>{t.uploadMapLabel}</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-emerald-500 bg-emerald-50/50"
                      : uploadedImage
                      ? "border-emerald-500/30 bg-emerald-50/10"
                      : (theme === "dark" ? "border-slate-805 bg-slate-950 hover:bg-slate-900 hover:border-slate-700 text-slate-300" : "border-slate-300 bg-slate-50 hover:bg-slate-100/70 hover:border-slate-400")
                  }`}
                  id="image-dropzone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files!)}
                    className="hidden"
                    accept="image/*"
                  />
                  {uploadedImage ? (
                    <div className="space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-emerald-800">{t.loadedMapBadge}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearImage();
                        }}
                        className="text-[11px] text-red-650 hover:underline inline-flex items-center cursor-pointer"
                      >
                        <X className="w-3 h-3 mr-1" /> {t.cancelAndPreset}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="mx-auto w-8 h-8 text-slate-405 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className={`text-xs font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-750"}`}>{t.dragDropText}</p>
                      <p className="text-[10px] text-slate-400">{t.dragDropSub}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Goal parameters */}
              <div className={`space-y-4 pt-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} id="goal-section">
                <div className="space-y-2">
                  <label className={`text-sm font-semibold flex items-center ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                    {t.goalLabel}
                  </label>
                  <select
                    value={cityGoal}
                    onChange={(e) => setCityGoal(e.target.value)}
                    className={`w-full text-sm rounded-xl border px-3 py-2.5 transition-all focus:border-emerald-500 focus:outline-none ${theme === "dark" ? "border-slate-800 bg-slate-950 text-slate-200 focus:bg-slate-900" : "border-slate-200 bg-slate-50 text-slate-800 focus:bg-white"}`}
                  >
                    <option value="Đô thị Sinh thái, Thông minh & Đáng sống" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{t.cityGoalEco}</option>
                    <option value="Cụm Công nghiệp Sạch, Vận tải thông suốt" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{t.cityGoalIndustrial}</option>
                    <option value="Nâng cấp Hạ tầng dân sinh, phòng tránh thiên tai" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{t.cityGoalDisaster}</option>
                    <option value="Khu Phố Du lịch Văn hóa, kết nối Cảng sông" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{t.cityGoalTourism}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-medium block ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{t.additionalReqLabel}</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder={t.additionalReqPlaceholder}
                    className={`w-full text-xs rounded-xl border p-2.5 transition-all resize-none focus:border-emerald-500 focus:outline-none ${theme === "dark" ? "border-slate-800 bg-slate-950 text-slate-200 focus:bg-slate-900" : "border-slate-200 bg-slate-50 text-slate-850 focus:bg-white"}`}
                  />
                </div>
              </div>

              {/* Core trigger button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-emerald-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                id="btn-analyze"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t.btnAnalyzeLoading}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>{t.btnAnalyzeReady}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Visualizer Area */}
          <div className="lg:col-span-8 flex flex-col space-y-6" id="visualizer-column">
            
            {/* Map Canvas with Suggestion overlays */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden p-3 relative select-none shadow-xl border border-slate-800" id="map-canvas-card">
              <div className="flex items-center justify-between text-white p-3 pb-4" id="map-header">
                <div className="flex items-center space-x-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <p className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">{t.canvasMockTitle}</p>
                </div>
                {advice && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    {t.detectSuccessBadge.replace("{n}", advice.projects.length.toString())}
                  </span>
                )}
              </div>

              {/* The Actual Spatial Frame */}
              <div
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  if (zoom > 1.05 || pan.x !== 0 || pan.y !== 0) {
                    handleResetZoom();
                  } else {
                    setZoom(1.75);
                  }
                }}
                className={`relative border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 max-h-[500px] flex items-center justify-center select-none ${
                  isPanning ? "cursor-grabbing" : "cursor-grab"
                }`}
                id="visualizer-screen"
              >
                {/* Transformed Map & Pins Layer */}
                <div
                  className={`w-full h-full relative flex items-center justify-center ${
                    isPanning ? "transition-none" : "transition-transform duration-150 ease-out"
                  }`}
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded area map"
                      className="w-full h-full object-cover opacity-85 pointer-events-none"
                      draggable={false}
                    />
                  ) : selectedTemplate ? (
                    <div
                      id="template-svg-container"
                      className="w-full h-full transition-opacity duration-300 pointer-events-none flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.svgHtml }}
                    />
                  ) : (
                    <div className="text-slate-500 text-center p-8 pointer-events-none">
                      <Compass className="w-12 h-12 mx-auto mb-2 opacity-30 animate-spin-slow" />
                      <p className="text-sm">{t.loadedRepDefault}</p>
                    </div>
                  )}

                  {/* AI suggestion overlay pins */}
                  {advice && advice.projects.map((proj) => {
                    const isApproved = approvedProjectIds.has(proj.id);
                    const isSelected = selectedProject?.id === proj.id;
                    const theme = getCategoryTheme(proj.category);

                    const leftPercentage = proj.suggestionCoordinates.x;
                    const topPercentage = proj.suggestionCoordinates.y;

                    return (
                      <div
                        key={proj.id}
                        style={{
                          position: "absolute",
                          left: `${leftPercentage}%`,
                          top: `${topPercentage}%`,
                          transform: "translate(-50%, -50%)",
                          zIndex: isSelected ? 40 : isApproved ? 30 : 10,
                        }}
                        className="transition-all duration-300 pointer-events-auto"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(proj);
                          }}
                          className={`group relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? "bg-amber-400 border-white text-slate-950 scale-125 ring-4 ring-amber-400/30 font-bold" 
                              : isApproved
                              ? `${theme.markerBg} text-white border-white scale-100 hover:scale-115`
                              : "bg-slate-700 text-slate-300 border-slate-500 scale-90 opacity-60 hover:opacity-100"
                          }`}
                          title={proj.name}
                        >
                          {isApproved && (
                            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping -z-10 ${theme.markerBg}`}></span>
                          )}
                          
                          <span className="text-xs font-semibold">
                            {proj.name.substring(0, 1)}
                          </span>

                          {/* Tooltip bubble */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-44 bg-slate-950 text-white text-[11px] p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all text-center z-50 shadow-xl border border-slate-700">
                            <p className="font-bold line-clamp-1">{proj.name}</p>
                            <p className="text-slate-300 text-[9px] mt-0.5">{theme.label}</p>
                            <div className="w-2 h-2 bg-slate-950 border-r border-b border-slate-700 absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 rotate-45"></div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Floating Zoom & Pan Controls (Top-Right) */}
                <div className="absolute top-3 right-3 flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg z-30 space-x-1 text-slate-200">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t.zoomIn}
                    aria-label={t.zoomIn}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 rounded border border-slate-800 transition-colors cursor-pointer"
                    title={t.resetZoom}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t.zoomOut}
                    aria-label={t.zoomOut}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={t.resetZoom}
                    aria-label={t.resetZoom}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mini Hint Badge (Top-Left) */}
                <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-sm border border-slate-800/80 rounded-lg px-2.5 py-1 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono pointer-events-none z-20">
                  <Move className="w-3 h-3 text-slate-500" />
                  <span>{t.panControlsHint}</span>
                </div>

                {/* Legend bar underneath visualizer */}
                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur-md rounded-xl px-2.5 py-1.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 max-w-[95%] z-20">
                  <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">
                    {language === "en" ? "Categories:" : "Các Phân Loại:"}
                  </span>
                  <span className="flex items-center text-[10px] text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1 inline-block"></span> {t.categoryGreen}</span>
                  <span className="flex items-center text-[10px] text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1 inline-block"></span> {t.categoryTransport}</span>
                  <span className="flex items-center text-[10px] text-violet-400"><span className="w-2 h-2 rounded-full bg-violet-500 mr-1 inline-block"></span> {t.categoryCommunity}</span>
                  <span className="flex items-center text-[10px] text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1 inline-block"></span> {t.categoryCommercial}</span>
                  <span className="flex items-center text-[10px] text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-500 mr-1 inline-block"></span> {t.categoryUtility}</span>
                </div>
              </div>

              {/* Status footer inside visualizer card */}
              <div className="p-3 bg-slate-950/40 border-t border-slate-800/80 mt-2 rounded-xl text-xs text-slate-300 flex items-center justify-between" id="visualizer-footer">
                <span className="flex items-center text-slate-400">
                  <Info className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {t.canvasFooterHint}
                </span>
                <span className="text-[10px] font-mono text-slate-500">{t.canvasFooterResolution}</span>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-800 text-sm flex items-start space-x-3" id="error-banner">
                <AlertTriangle className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">{t.errorBannerTitle}</p>
                  <p className="mt-1 text-red-700 text-xs">{error}</p>
                  <p className="mt-2 text-red-850 font-medium">{t.errorBannerAction}</p>
                </div>
              </div>
            )}

            {/* Loading placeholder cards */}
            {loading && (
              <div className="bg-white border rounded-3xl p-8 text-center space-y-4 shadow-sm" id="loading-placeholder">
                <div className="flex justify-center">
                  <div className="relative">
                    <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
                    <Compass className="w-6 h-6 text-slate-800 absolute top-3 left-3 animate-pulse" />
                  </div>
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <p className="font-semibold text-slate-800 text-lg">{t.loadingCaption}</p>
                  <p className="text-slate-500 text-xs">{t.loadingDetails}</p>
                </div>
              </div>
            )}

            {/* AI Results Presentation Panel */}
            {advice && !loading && (
              <div className="space-y-6" id="analytical-results">
                
                {/* 1. Quick stats & Big simulation board */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl" id="scores-simulation-card">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">{t.virtualPanelTitle}</span>
                      <h3 className="text-xl font-bold font-display text-white mt-1">{t.virtualPanelSub}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">{t.approvedProjectsCount}</span>
                      <span className="px-3 py-1 bg-emerald-600 rounded-full font-mono text-sm font-bold text-white">
                        {approvedProjectIds.size} / {advice.projects.length}
                      </span>
                    </div>
                  </div>

                  {/* 4 Index dials */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="simulation-indicators">
                    {/* Index A: Green Index */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                        <span>{t.indicatorGreen}</span>
                        <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-emerald-400 font-mono">{simulated.green}</span>
                        <span className="text-xs text-slate-500">/100pt</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div 
                          style={{ width: `${simulated.green}%` }} 
                          className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 font-mono">
                        <span>{t.scoreInitial}: {advice.cityScoreImpact.initialScores.greenRating}</span>
                        <span>{t.scoreTarget}: {advice.cityScoreImpact.potentialScores.greenRating}</span>
                      </div>
                    </div>

                    {/* Index B: Traffic capacity */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                        <span>{t.indicatorTraffic}</span>
                        <Car className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-blue-400 font-mono">{simulated.traffic}</span>
                        <span className="text-xs text-slate-500">/100pt</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div 
                          style={{ width: `${simulated.traffic}%` }} 
                          className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 font-mono">
                        <span>{t.scoreInitial}: {advice.cityScoreImpact.initialScores.trafficCapacity}</span>
                        <span>{t.scoreTarget}: {advice.cityScoreImpact.potentialScores.trafficCapacity}</span>
                      </div>
                    </div>

                    {/* Index C: Economy */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                        <span>{t.indicatorEconomy}</span>
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-amber-400 font-mono">{simulated.economy}</span>
                        <span className="text-xs text-slate-500">/100pt</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div 
                          style={{ width: `${simulated.economy}%` }} 
                          className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 font-mono">
                        <span>{t.scoreInitial}: {advice.cityScoreImpact.initialScores.economyGrowth}</span>
                        <span>{t.scoreTarget}: {advice.cityScoreImpact.potentialScores.economyGrowth}</span>
                      </div>
                    </div>

                    {/* Index D: Living standard */}
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                        <span>{t.indicatorLiving}</span>
                        <Heart className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl font-black text-violet-400 font-mono">{simulated.living}</span>
                        <span className="text-xs text-slate-500">/100pt</span>
                      </div>
                      
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div 
                          style={{ width: `${simulated.living}%` }} 
                          className="h-full bg-violet-500 transition-all duration-500 rounded-full"
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 mt-1.5 font-mono">
                        <span>{t.scoreInitial}: {advice.cityScoreImpact.initialScores.livingStandard}</span>
                        <span>{t.scoreTarget}: {advice.cityScoreImpact.potentialScores.livingStandard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Narrative quote */}
                  <div className="mt-5 p-4 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed italic" id="narrative-box">
                    💡 <strong>{t.aiBriefingTitle}</strong> "{advice.cityScoreImpact.narrative}"
                  </div>
                </div>

                {/* Grid area split: Left column is detailed list of projects / Right column is details on selected item */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="detailed-projects-layout">
                  
                  {/* Sub Column: Projects proposals check-list */}
                  <div className={`rounded-2xl border p-5 space-y-4 transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`} id="proposals-listing">
                    <div className={`flex items-center justify-between pb-3 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                      <h4 className={`font-bold text-sm tracking-tight flex items-center ${theme === "dark" ? "text-slate-100" : "text-slate-850"}`}>
                        <Building className="w-4 h-4 text-emerald-600 mr-1.5" />
                        {t.proposalsTitle}
                      </h4>
                      <span className="text-xs text-slate-400">{t.proposalsSubtitle}</span>
                    </div>

                    <div className="space-y-2.5" id="proposals-selector-block">
                      {advice.projects.map((proj) => {
                        const isApproved = approvedProjectIds.has(proj.id);
                        const isSelected = selectedProject?.id === proj.id;
                        const themeCat = getCategoryTheme(proj.category);

                        return (
                          <div 
                            key={proj.id}
                            onClick={() => setSelectedProject(proj)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                              isSelected
                                ? (theme === "dark" ? "bg-slate-850 border-emerald-500 shadow-xs ring-1 ring-emerald-500/30 text-white" : "bg-slate-50 border-emerald-500/85 shadow-xs ring-1 ring-emerald-500/20 text-slate-900")
                                : (theme === "dark" ? "hover:bg-slate-800 bg-slate-950 border-slate-850 text-slate-200" : "hover:bg-slate-50/50 bg-white border-slate-200 text-slate-900")
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProjectApproval(proj.id);
                              }}
                              className={`p-1 mt-0.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                isApproved
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-300 text-transparent hover:border-slate-400"
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" strokeWidth={3} />
                            </button>

                            <div className="flex-grow space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${themeCat.bg}`}>
                                  {themeCat.label}
                                </span>
                                <span className="text-[10px] text-slate-405 flex items-center">
                                  {t.urgencyLabel}: <strong className={`ml-1 ${theme === "dark" ? "text-slate-200" : "text-slate-705"}`}>{getUrgencyLabel(proj.urgency)}</strong>
                                </span>
                              </div>
                              <h5 className={`text-sm font-bold leading-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                                {proj.name}
                              </h5>
                              <p className={`text-xs line-clamp-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                                {proj.description}
                              </p>
                              
                              {/* Small vector badges */}
                              <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1">
                                <span className="flex items-center">
                                  <DollarSign className="w-3 h-3 mr-0.5 text-slate-400" />
                                  {t.budgetLabel}: <strong className={`ml-0.5 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>{getCostLabel(proj.estimatedCost)}</strong>
                                </span>
                                <span className="text-slate-300">|</span>
                                <span className={`font-mono font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{t.coordsLabel}: ({proj.suggestionCoordinates.x}%, {proj.suggestionCoordinates.y}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub Column: Selected project inspection & Geographic justification */}
                  <div className="md:col-span-12 lg:col-span-5 md:grid md:grid-cols-2 lg:flex lg:flex-col lg:space-y-6 gap-6" id="inspection-sidebar">
                    {selectedProject ? (
                      <div className={`rounded-2xl border p-5 space-y-4 shadow-sm w-full transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`} id="inspector-card">
                        <div className={`pb-3 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">{t.insSidebarTitle}</span>
                          <h4 className={`text-base font-bold mt-0.5 flex items-center ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                            <span className="p-1 text-amber-500 mr-1.5"><Locate className="w-4.5 h-4.5" /></span>
                            {selectedProject.name}
                          </h4>
                        </div>

                        {/* Cost & Urgency values */}
                        <div className="grid grid-cols-2 gap-3" id="inspector-stats">
                          <div className={`p-2.5 text-center rounded-xl ${theme === "dark" ? "bg-slate-950" : "bg-slate-50"}`}>
                            <p className="text-[10px] text-slate-400 font-semibold">{t.insUrgencyHeader}</p>
                            <p className={`font-bold mt-1 text-sm ${
                              selectedProject.urgency.includes('Khẩn cấp') || selectedProject.urgency.toLowerCase().includes('urgent') ? 'text-red-650' : (theme === "dark" ? 'text-slate-200' : 'text-slate-800')
                            }`}>{getUrgencyLabel(selectedProject.urgency)}</p>
                          </div>
                          <div className={`p-2.5 text-center rounded-xl ${theme === "dark" ? "bg-slate-950" : "bg-slate-50"}`}>
                            <p className="text-[10px] text-slate-400 font-semibold font-sans">{t.insBudgetHeader}</p>
                            <p className={`font-bold text-sm mt-1 ${theme === "dark" ? 'text-slate-200' : 'text-slate-850'}`}>{getCostLabel(selectedProject.estimatedCost)}</p>
                          </div>
                        </div>

                        {/* Core functional description */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-display">{t.insScopeHeader}</p>
                          <p className={`text-xs leading-relaxed p-3 rounded-xl border ${theme === "dark" ? "text-slate-300 bg-slate-950 border-slate-850" : "text-slate-600 bg-slate-50/50 border-slate-100"}`}>
                            {selectedProject.description}
                          </p>
                        </div>

                        {/* Geological Reason */}
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider font-display">{t.insGeoHeader}</p>
                          <div className={`text-xs p-3.5 rounded-xl border leading-relaxed font-sans ${theme === "dark" ? "bg-emerald-950/20 text-emerald-300 border-emerald-900/40" : "bg-emerald-50/40 text-emerald-800 border-emerald-100/60"}`}>
                            {selectedProject.explanation}
                          </div>
                        </div>

                        {/* Numeric Impact meters progress */}
                        <div className={`space-y-2 pt-2 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                          <p className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">{t.insImpactHeader}</p>
                          <div className="space-y-1.5" id="mini-project-meters">
                            {/* Traffic impact */}
                            <div className="flex items-center text-[11px] text-slate-400">
                              <span className="w-20 text-slate-400">{t.insTrafficMini}</span>
                              <div className={`flex-grow h-1.5 rounded-full overflow-hidden mx-2 relative ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                <div 
                                  style={{ 
                                    width: `${Math.abs(selectedProject.impact.traffic) * 10}%`,
                                    left: selectedProject.impact.traffic >= 0 ? "50%" : "auto",
                                    right: selectedProject.impact.traffic < 0 ? "50%" : "auto" 
                                  }}
                                  className={`absolute h-full rounded-full ${selectedProject.impact.traffic >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                ></div>
                              </div>
                              <span className={`font-mono w-6 text-right font-bold ${selectedProject.impact.traffic >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {selectedProject.impact.traffic >= 0 ? `+${selectedProject.impact.traffic}` : selectedProject.impact.traffic}
                              </span>
                            </div>

                            {/* Enviro impact */}
                            <div className="flex items-center text-[11px] text-slate-400">
                              <span className="w-20 text-slate-400">{t.insEnvironmentMini}</span>
                              <div className={`flex-grow h-1.5 rounded-full overflow-hidden mx-2 relative ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                <div 
                                  style={{ 
                                    width: `${Math.abs(selectedProject.impact.environment) * 10}%`,
                                    left: selectedProject.impact.environment >= 0 ? "50%" : "auto",
                                    right: selectedProject.impact.environment < 0 ? "50%" : "auto" 
                                  }}
                                  className={`absolute h-full rounded-full ${selectedProject.impact.environment >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                ></div>
                              </div>
                              <span className={`font-mono w-6 text-right font-bold ${selectedProject.impact.environment >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {selectedProject.impact.environment >= 0 ? `+${selectedProject.impact.environment}` : selectedProject.impact.environment}
                              </span>
                            </div>

                            {/* Standard of living impact */}
                            <div className="flex items-center text-[11px] text-slate-400">
                              <span className="w-20 text-slate-400">{t.insLivingMini}</span>
                              <div className={`flex-grow h-1.5 rounded-full overflow-hidden mx-2 relative ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                <div 
                                  style={{ 
                                    width: `${Math.abs(selectedProject.impact.qualityOfLife) * 10}%`,
                                    left: selectedProject.impact.qualityOfLife >= 0 ? "50%" : "auto",
                                    right: selectedProject.impact.qualityOfLife < 0 ? "50%" : "auto" 
                                  }}
                                  className={`absolute h-full rounded-full ${selectedProject.impact.qualityOfLife >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                ></div>
                              </div>
                              <span className={`font-mono w-6 text-right font-bold ${selectedProject.impact.qualityOfLife >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {selectedProject.impact.qualityOfLife >= 0 ? `+${selectedProject.impact.qualityOfLife}` : selectedProject.impact.qualityOfLife}
                              </span>
                            </div>

                            {/* Economy impact */}
                            <div className="flex items-center text-[11px] text-slate-400">
                              <span className="w-20 text-slate-400">{t.insEconomyMini}</span>
                              <div className={`flex-grow h-1.5 rounded-full overflow-hidden mx-2 relative ${theme === "dark" ? "bg-slate-800" : "bg-slate-100"}`}>
                                <div 
                                  style={{ 
                                    width: `${Math.abs(selectedProject.impact.economy) * 10}%`,
                                    left: selectedProject.impact.economy >= 0 ? "50%" : "auto",
                                    right: selectedProject.impact.economy < 0 ? "50%" : "auto" 
                                  }}
                                  className={`absolute h-full rounded-full ${selectedProject.impact.economy >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                ></div>
                              </div>
                              <span className={`font-mono w-6 text-right font-bold ${selectedProject.impact.economy >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {selectedProject.impact.economy >= 0 ? `+${selectedProject.impact.economy}` : selectedProject.impact.economy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`border rounded-2xl p-6 text-center text-xs w-full ${theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-450" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                        {t.insSelectPlaceholder}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Structured Geography Report Details */}
                <div className={`rounded-3xl border p-6 md:p-8 shadow-sm space-y-6 transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`} id="geography-insights-report">
                  <div className={`flex items-center space-x-2 border-b pb-4 ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                    <Compass className="w-5 h-5 text-emerald-600" />
                    <h3 className={`text-lg font-bold font-display ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>{t.reportTitle}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="geography-data-blocks">
                    <div className="space-y-4">
                      {/* Detected features */}
                      <div className={`rounded-2xl p-4 space-y-2 border ${theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                        <p className="text-xs uppercase font-mono text-slate-405 tracking-wider font-semibold">{t.reportFeatures}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {advice.analysis.detectedFeatures.map((feat, idx) => (
                            <span key={idx} className={`border text-xs px-2.5 py-1 rounded-lg font-medium ${theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-250 text-slate-700"}`}>
                              🔍 {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Terrain Category */}
                      <div className={`rounded-2xl p-4 space-y-1.5 border ${theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                        <p className="text-xs uppercase font-mono text-slate-405 tracking-wider font-semibold">{t.reportTerrain}</p>
                        <p className={`text-sm font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{advice.analysis.terrainType}</p>
                      </div>

                      {/* Current infrastructures */}
                      <div className={`rounded-2xl p-4 space-y-2 border ${theme === "dark" ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                        <p className="text-xs uppercase font-mono text-slate-405 tracking-wider font-semibold">{t.reportExisting}</p>
                        <ul className={`text-xs space-y-1 font-sans ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                          {advice.analysis.currentInfrastructures.map((infra, idx) => (
                            <li key={idx} className="flex items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2"></span>
                              {infra}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Bottlenecks/Challenges */}
                      <div className={`border rounded-2xl p-4.5 space-y-2 ${theme === "dark" ? "bg-red-950/10 border-red-900/30 text-red-200" : "bg-red-50/40 border-red-100"}`}>
                        <p className="text-xs uppercase font-mono text-red-650 tracking-wider font-bold">{t.reportChallenges}</p>
                        <ul className="text-xs space-y-1.5">
                          {advice.analysis.challenges.map((chal, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
                              <span className={`leading-snug ${theme === "dark" ? "text-red-200" : "text-red-805"}`}>{chal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div className={`border rounded-2xl p-4.5 space-y-2 ${theme === "dark" ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-200" : "bg-emerald-50/30 border-emerald-100"}`}>
                        <p className="text-xs uppercase font-mono text-emerald-700 tracking-wider font-bold">{t.reportOpportunities}</p>
                        <ul className="text-xs space-y-1.5">
                          {advice.analysis.opportunities.map((opp, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-emerald-500 mr-2 flex-shrink-0">🌱</span>
                              <span className={`leading-snug ${theme === "dark" ? "text-emerald-300" : "text-emerald-805"}`}>{opp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Operational overall 3-fold strategies */}
                  <div className={`pt-4 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                    <p className={`text-xs font-semibold tracking-wider uppercase mb-3 text-center ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{t.reportStrategyTitle}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="strategies-listing">
                      {advice.strategies.map((strat, idx) => (
                        <div key={idx} className="p-4 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-1">
                          <span className="text-[10px] font-mono font-black text-emerald-400">{t.reportOptionPrefix} 0{idx + 1}</span>
                          <h5 className="font-bold text-xs uppercase tracking-tight text-white">{strat.title}</h5>
                          <p className="text-[11px] text-slate-300 leading-snug">{strat.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Deep consultation chatbot helper */}
                <div className={`rounded-3xl p-6 shadow-xl space-y-4 border transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`} id="assistant-chat-block">
                  <div className={`flex items-center justify-between border-b pb-4 ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                      <div>
                        <h4 className={`font-bold text-sm ${theme === "dark" ? "text-slate-100" : "text-slate-850"}`}>{t.chatTitle}</h4>
                        <p className="text-[10px] text-slate-400">{t.chatSubtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {t.chatActiveStatus}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearChat}
                        className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-[10px] font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 cursor-pointer ${theme === "dark" ? "border-slate-800 bg-slate-950 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}
                        title={t.clearChatBtn}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t.clearChatBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className={`h-64 overflow-y-auto space-y-3 p-3 rounded-2xl border ${theme === "dark" ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"}`} id="chat-messages-scroll">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-emerald-600 text-white font-sans rounded-tr-none"
                              : (theme === "dark" ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none text-left whitespace-pre-line" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none text-left whitespace-pre-line")
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className={`rounded-2xl rounded-tl-none p-3.5 text-xs flex items-center space-x-2 border animate-pulse ${theme === "dark" ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`}>
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                          <span>{t.chatLoadingIndicator}</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preset prompt suggestions */}
                  <div className="flex flex-wrap gap-1.5 items-center" id="presets-chat-prompts">
                    <span className="text-[10px] text-slate-400 uppercase pr-1.5">{t.chatSuggestionText}</span>
                    <button
                      type="button"
                      onClick={() => handleSuggestQuestion(t.chatPromptPhasing)}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer ${theme === "dark" ? "bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300" : "bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-600"}`}
                    >
                      {t.chatBtnPhasing}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSuggestQuestion(t.chatPromptRelocation.replace("{name}", selectedProject?.name || (language === "en" ? "the project" : "dự án")))}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer ${theme === "dark" ? "bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300" : "bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-600"}`}
                    >
                      {t.chatBtnRelocation}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSuggestQuestion(t.chatPromptBenefits.replace("{name}", selectedProject?.name || (language === "en" ? "the project" : "dự án")))}
                      className={`text-[10px] px-2.5 py-1 rounded-full transition-all cursor-pointer ${theme === "dark" ? "bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300" : "bg-slate-100 hover:bg-slate-200 hover:text-slate-900 text-slate-600"}`}
                    >
                      {t.chatBtnBenefits}
                    </button>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChat} className="flex gap-2" id="chat-input-form">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t.chatInputPlaceholder}
                      className={`flex-grow rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 transition-all font-sans border ${theme === "dark" ? "bg-slate-950 border-slate-850 text-slate-200 text-left" : "bg-white border-slate-200 text-slate-850 text-left"}`}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !chatInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-3 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* Zero state: Explain user how it operates before analysis */}
            {!advice && !loading && (
              <div className={`border rounded-3xl p-8 shadow-xs text-center space-y-6 transition-colors ${theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"}`} id="welcome-instructions">
                <div className="max-w-md mx-auto space-y-2">
                  <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${theme === "dark" ? "bg-emerald-950/30 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className={`font-bold text-lg font-display ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>{t.welcomeTitle}</h3>
                  <p className={`text-xs leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    {t.welcomeDesc}
                  </p>
                </div>

                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto pt-4 border-t ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`} id="welcome-steps">
                  <div className="space-y-1 text-center">
                    <span className={`inline-flex w-6 h-6 text-xs font-bold items-center justify-center rounded-full ${theme === "dark" ? "bg-slate-850 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                      {t.welcomeStep1Number}
                    </span>
                    <h5 className={`text-xs font-bold uppercase ${theme === "dark" ? "text-slate-205" : "text-slate-800"}`}>{t.welcomeStep1Title}</h5>
                    <p className="text-[11px] text-slate-400">{t.welcomeStep1Desc}</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <span className={`inline-flex w-6 h-6 text-xs font-bold items-center justify-center rounded-full ${theme === "dark" ? "bg-slate-850 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                      {t.welcomeStep2Number}
                    </span>
                    <h5 className={`text-xs font-bold uppercase font-display ${theme === "dark" ? "text-slate-205" : "text-slate-800"}`}>{t.welcomeStep2Title}</h5>
                    <p className="text-[11px] text-slate-400">{t.welcomeStep2Desc}</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <span className={`inline-flex w-6 h-6 text-xs font-bold items-center justify-center rounded-full ${theme === "dark" ? "bg-slate-850 text-slate-200" : "bg-slate-100 text-slate-700"}`}>
                      {t.welcomeStep3Number}
                    </span>
                    <h5 className={`text-xs font-bold uppercase font-display ${theme === "dark" ? "text-slate-205" : "text-slate-800"}`}>{t.welcomeStep3Title}</h5>
                    <p className="text-[11px] text-slate-400">{t.welcomeStep3Desc}</p>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleAnalyze}
                    className={`px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl tracking-wider uppercase transition-all shadow-md flex items-center space-x-2 cursor-pointer ${theme === "dark" ? "shadow-none" : "shadow-emerald-100"}`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>{t.welcomeBtnAnalyzeNow}</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-20 py-8 border-t transition-colors ${theme === "dark" ? "bg-slate-950 border-slate-900 text-slate-400" : "bg-white border-slate-200 text-slate-500"}`} id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-1.5 leading-relaxed">
          <p>{t.footerCopyright}</p>
          <p className={`text-[10px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>{t.footerPowerPhrase}</p>
          
          {/* Detailed Legal Disclaimer Warning */}
          <div className={`mt-6 p-4 rounded-xl border max-w-4xl mx-auto flex items-start space-x-3 text-left leading-relaxed ${
            theme === "dark"
              ? "bg-slate-900/55 border-slate-800/80 text-slate-400"
              : "bg-amber-50/50 border-amber-100 text-slate-600"
          }`} id="legal-disclaimer-banner">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${theme === "dark" ? "text-amber-500/80" : "text-amber-600"}`} />
            <p className="text-[11px] font-sans">
              {t.warningDisclaimer}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
