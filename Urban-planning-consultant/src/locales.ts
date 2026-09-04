export type Language = "vi" | "en";

export interface LocaleSchema {
  headerUpper: string;
  headerTitle: string;
  headerBadge: string;
  
  col1Title: string;
  selectMapLabel: string;
  orDivider: string;
  uploadMapLabel: string;
  loadedMapBadge: string;
  cancelAndPreset: string;
  dragDropText: string;
  dragDropSub: string;
  goalLabel: string;
  additionalReqLabel: string;
  additionalReqPlaceholder: string;
  btnAnalyzeReady: string;
  btnAnalyzeLoading: string;

  canvasMockTitle: string;
  detectSuccessBadge: string;
  loadedRepDefault: string;
  canvasFooterHint: string;
  canvasFooterResolution: string;

  errorBannerTitle: string;
  errorBannerAction: string;
  loadingCaption: string;
  loadingDetails: string;

  virtualPanelTitle: string;
  virtualPanelSub: string;
  approvedProjectsCount: string;
  indicatorGreen: string;
  indicatorTraffic: string;
  indicatorEconomy: string;
  indicatorLiving: string;
  scoreInitial: string;
  scoreTarget: string;
  aiBriefingTitle: string;

  proposalsTitle: string;
  proposalsSubtitle: string;
  urgencyLabel: string;
  budgetLabel: string;
  coordsLabel: string;

  insSidebarTitle: string;
  insUrgencyHeader: string;
  insBudgetHeader: string;
  insScopeHeader: string;
  insGeoHeader: string;
  insImpactHeader: string;
  insTrafficMini: string;
  insEnvironmentMini: string;
  insLivingMini: string;
  insEconomyMini: string;
  insSelectPlaceholder: string;

  reportTitle: string;
  reportFeatures: string;
  reportTerrain: string;
  reportExisting: string;
  reportChallenges: string;
  reportOpportunities: string;
  reportStrategyTitle: string;
  reportOptionPrefix: string;

  chatTitle: string;
  chatSubtitle: string;
  chatActiveStatus: string;
  chatLoadingIndicator: string;
  chatSuggestionText: string;
  chatBtnPhasing: string;
  chatPromptPhasing: string;
  chatBtnRelocation: string;
  chatPromptRelocation: string;
  chatBtnBenefits: string;
  chatPromptBenefits: string;
  chatInputPlaceholder: string;

  welcomeTitle: string;
  welcomeDesc: string;
  welcomeStep1Number: string;
  welcomeStep1Title: string;
  welcomeStep1Desc: string;
  welcomeStep2Number: string;
  welcomeStep2Title: string;
  welcomeStep2Desc: string;
  welcomeStep3Number: string;
  welcomeStep3Title: string;
  welcomeStep3Desc: string;
  welcomeBtnAnalyzeNow: string;

  footerCopyright: string;
  footerPowerPhrase: string;

  categoryGreen: string;
  categoryUtility: string;
  categoryTransport: string;
  categoryCommunity: string;
  categoryCommercial: string;
  categoryIndustrial: string;
  categoryDefault: string;

  urgencyUrgent: string;
  urgencyHigh: string;
  urgencyMedium: string;
  urgencyLow: string;

  costVeryHigh: string;
  costHigh: string;
  costMedium: string;
  costLow: string;

  cityGoalEco: string;
  cityGoalIndustrial: string;
  cityGoalDisaster: string;
  cityGoalTourism: string;
  themeLabelLight: string;
  themeLabelDark: string;
  clearChatBtn: string;
  warningDisclaimer: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  panControlsHint: string;
}

export const locales: Record<Language, LocaleSchema> = {
  vi: {
    headerUpper: "Hệ Thống Phản Biện Không Gian",
    headerTitle: "Cố Vấn Quy Hoạch Đô Thị AI",
    headerBadge: "Sẵn sàng đề xuất & Mô phỏng",
    
    col1Title: "1. Bản Đồ Khu Vực",
    selectMapLabel: "Chọn nguồn bản đồ đầu vào:",
    orDivider: "Hoặc",
    uploadMapLabel: "Tải ảnh chụp Google Maps của bạn:",
    loadedMapBadge: "Đã nạp ảnh Google Map của bạn",
    cancelAndPreset: "Hủy bỏ & dùng mẫu mặc định",
    dragDropText: "Kéo thả ảnh hoặc click để chọn ảnh",
    dragDropSub: "Chấp nhận JPG, PNG chụp màn hình vệ tinh/bản đồ",
    goalLabel: "Mục tiêu định hướng quy hoạch:",
    additionalReqLabel: "Yêu cầu đặc thù bổ sung (tùy chọn):",
    additionalReqPlaceholder: "Ví dụ: Giữ lại nhánh sông tự nhiên, cần xây dựng bệnh viện đa khoa, tránh giải tỏa dân cư đông đúc...",
    btnAnalyzeReady: "Phản Biện AI & Gợi Ý Quy Hoạch",
    btnAnalyzeLoading: "Hệ thống AI đang đọc bản đồ... (Tầm 15 giây)",

    canvasMockTitle: "HÌNH ẢNH MÔ PHỎNG KHÔNG GIAN",
    detectSuccessBadge: "Phát hiện thành công vị trí xây dựng ({n} điểm)",
    loadedRepDefault: "Không thể nạp bản đồ nền đại diện",
    canvasFooterHint: "Mẹo: Nhấp vào một điểm ghim trên ảnh bản đồ để xem chi tiết lý trình và tính tương thích vị trí.",
    canvasFooterResolution: "ĐỘ PHÂN GIẢI: VECTORIZED 1080P",

    errorBannerTitle: "Không thể phân tích ảnh thực tế tự động",
    errorBannerAction: "Bấm thử lại hoặc sử dụng các bản đồ mẫu giả lập có sẵn.",
    loadingCaption: "AI đang đo trắc địa khu vực...",
    loadingDetails: "Trí tuệ nhân tạo Gemini đang lọc biên độ địa hình, tính toán mặt bằng giao thông và xuất phương án tối ưu dựa theo chỉ mục phát triển bền vững quốc tế (LEED ND, Smart Cities Index).",

    virtualPanelTitle: "HỘI ĐỒNG THẨM ĐỊNH GIẢ LẬP",
    virtualPanelSub: "Bảng Chỉ Số Đô Thị (Sức Khỏe Kế Hoạch)",
    approvedProjectsCount: "Dự án đã duyệt đầu tư:",
    indicatorGreen: "Độ che phủ xanh",
    indicatorTraffic: "Độ mượt Giao thông",
    indicatorEconomy: "Động lực Kinh tế",
    indicatorLiving: "Tiện ích Chất lượng Sống",
    scoreInitial: "Ban đầu",
    scoreTarget: "Mục tiêu",
    aiBriefingTitle: "Bản tin phân tích đô thị của AI:",

    proposalsTitle: "Danh sách Phê duyệt & Ngân sách Quy hoạch",
    proposalsSubtitle: "Tick chọn để bật tắt mảng phân bổ",
    urgencyLabel: "Độ cấp thiết",
    budgetLabel: "Kinh phí",
    coordsLabel: "Tọa độ",

    insSidebarTitle: "KHU VỰC GIÁM SÁT CHI TIẾT",
    insUrgencyHeader: "Độ cấp bách",
    insBudgetHeader: "Chi phí đầu tư",
    insScopeHeader: "CHỨC NĂNG & QUY MÔ",
    insGeoHeader: "BIỆN PHÁP CHỈ ĐỊNH VỊ TRÍ",
    insImpactHeader: "TÁC ĐỘNG ĐẾN ĐÔ THỊ (+/- 10):",
    insTrafficMini: "Giao thông:",
    insEnvironmentMini: "Môi trường:",
    insLivingMini: "Dân sinh:",
    insEconomyMini: "Kinh tế:",
    insSelectPlaceholder: "Chọn một công trình để xem chi tiết",

    reportTitle: "Báo Cáo Đánh Giá Thực Địa Phân Loại Không Gian",
    reportFeatures: "CÁC ĐẶC TRƯNG NHẬN DIỆN TRỰC QUAN",
    reportTerrain: "PHÂN LOẠI CHỈ MỤC ĐỊA HÌNH CHÍNH",
    reportExisting: "CƠ SỞ HẠ TẦNG HIỆN HỮU QUAN SÁT THẤY",
    reportChallenges: "NHỮNG THÁCH THỨC QUY HOẠCH PHÁT HIỆN",
    reportOpportunities: "CƠ HỘI PHÁT TRIỂN & QUY ĐẤT ĐỊA LÝ",
    reportStrategyTitle: "CHIẾN LƯỢC QUY HOẠCH TỔNG QUAN TỪ KIẾN TRÚC SƯ TRƯỞNG AI",
    reportOptionPrefix: "PHƯƠNG ÁN",

    chatTitle: "Thảo Luận Chiến Lược Với Chuyên Gia Đô Thị AI",
    chatSubtitle: "Hãy hỏi chuyên gia cách cân đối đền bù đất, pháp lý hay thiết kế kỹ thuật cao...",
    chatActiveStatus: "HỆ THỐNG TRỰC LỰC",
    chatLoadingIndicator: "Chuyên gia đang tính toán giải trình luận điểm...",
    chatSuggestionText: "Gợi ý câu hỏi:",
    chatBtnPhasing: "💡 Phân kỳ nguồn vốn?",
    chatPromptPhasing: "Phân kỳ đầu tư thế nào để không thâm hụt ngân sách?",
    chatBtnRelocation: "💡 Giải tỏa đền bù vùng ven?",
    chatPromptRelocation: "Cách xử lý tái định cư khi triển khai dự án \"{name}\"?",
    chatBtnBenefits: "💡 Lợi ích cụ thể dự án đang chọn?",
    chatPromptBenefits: "Dự án \"{name}\" mang lại lợi ích cụ thể gì?",
    chatInputPlaceholder: "Hỏi thêm về giải pháp kỹ thuật, đền bù giải phóng...",

    welcomeTitle: "Sẵn Sàng Kiến Tạo Đô Thị Đổi Mới",
    welcomeDesc: "Hãy lựa chọn một trong 3 định dạng bản đồ khu vực có sẵn ở cột trái hoặc đăng tải một tấm hình tự chụp từ tinh vân Google Maps. AI sẽ tự động định danh các yếu tố cấu thố địa chất và đưa ra các dự án phát triển khả thi.",
    welcomeStep1Number: "1",
    welcomeStep1Title: "Đọc & Định danh",
    welcomeStep1Desc: "Xem nhận dạng các con sông, bãi rác phi pháp, khu đệm sinh thái trong ảnh.",
    welcomeStep2Number: "2",
    welcomeStep2Title: "Tọa độ Kiến tạo",
    welcomeStep2Desc: "Ấn định sơ đồ ghim 4-6 công trình công cộng và trung chuyển giao thoa trực quan.",
    welcomeStep3Number: "3",
    welcomeStep3Title: "Mô phỏng sức khỏe số",
    welcomeStep3Desc: "Dùng bảng chấm điểm để giả định duyệt đầu tư từng phần nhằm tối ưu ngân sách.",
    welcomeBtnAnalyzeNow: "Thử nghiệm phân tích ngay",

    footerCopyright: "© 2026 Cố vấn Quy hoạch Đô thị AI. Tích lũy tri thức quy hoạch không gian xanh và thông minh.",
    footerPowerPhrase: "Mô hình phân tích thông minh sử dụng Gemini 3.5 Flash cấu hình tối ưu hóa đồ thị.",

    categoryGreen: "Sinh thái & Cây xanh",
    categoryUtility: "Hạ tầng kỹ thuật",
    categoryTransport: "Mạng lưới Giao thông",
    categoryCommunity: "Công cộng & Xã hội",
    categoryCommercial: "Thương mại dịch vụ",
    categoryIndustrial: "Công nghệ & Logistics",
    categoryDefault: "Nhà ở & Tiện ích thông minh",

    urgencyUrgent: "Khẩn cấp",
    urgencyHigh: "Cao",
    urgencyMedium: "Trung bình",
    urgencyLow: "Thấp",

    costVeryHigh: "Rất cao",
    costHigh: "Cao",
    costMedium: "Trung bình",
    costLow: "Thấp",

    cityGoalEco: "Đô thị Sinh thái, Thông minh & Đáng sống",
    cityGoalIndustrial: "Cụm Công nghiệp Sạch & Chuỗi Vận tải Logistics",
    cityGoalDisaster: "Nâng cấp dân sinh, phòng tránh thiên tai ngập úng",
    cityGoalTourism: "Khu Phố Du lịch Văn hóa & Dịch vụ ven sông",
    themeLabelLight: "Sáng",
    themeLabelDark: "Tối",
    clearChatBtn: "Xóa lịch sử trò chuyện",
    warningDisclaimer: "Khuyến nghị cảnh báo: Ứng dụng này chỉ mang tính chất tham khảo, giả lập học thuật và hỗ trợ lên phương án ý tưởng. Hệ thống và các nhà phát triển hoàn toàn không chịu bất kỳ trách nhiệm pháp lý hay trách nhiệm trước pháp luật nào nếu người dùng quyết định áp dụng các ý kiến, khuyến nghị hoặc tọa độ đề xuất từ công cụ này vào thực địa hoặc các dự án quy hoạch thực tế.",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    resetZoom: "Đặt lại góc nhìn",
    panControlsHint: "Kéo để di chuyển • Cuộn chuột để thu phóng"
  },
  en: {
    headerUpper: "Spatial Critique & Feedback System",
    headerTitle: "AI Urban Spatial Advisor",
    headerBadge: "Ready for Proposals & Simulations",
    
    col1Title: "1. Planning Sector Map",
    selectMapLabel: "Select background map source:",
    orDivider: "Or",
    uploadMapLabel: "Upload custom Google Maps screenshot:",
    loadedMapBadge: "Custom satellite/map image loaded",
    cancelAndPreset: "Clear & use preloaded template",
    dragDropText: "Drag & drop screenshot or click to browse",
    dragDropSub: "Supports JPG, PNG satellite/map captures",
    goalLabel: "Dynamic development direction goal:",
    additionalReqLabel: "Add special custom parameters (optional):",
    additionalReqPlaceholder: "e.g., Preserving natural water margins, adding emergency medical hubs, avoiding dense zoning clearances...",
    btnAnalyzeReady: "AI Spatial Critique & Infrastructure Suggestions",
    btnAnalyzeLoading: "AI is scanning land cover elements... (Approx. 15s)",

    canvasMockTitle: "SPATIAL CO-DESIGN MAP VIEW",
    detectSuccessBadge: "Successfully identified developmental coordinates ({n} points)",
    loadedRepDefault: "Could not load background template graphics",
    canvasFooterHint: "Tip: Select any mapped pin to examine geological reasoning, capital constraints, and parameters.",
    canvasFooterResolution: "OUTPUT RESOLUTION: VECTORIZED 1080P",

    errorBannerTitle: "Failed to automatically audit geographic file",
    errorBannerAction: "Retry or use one of the interactive planning layout simulations below.",
    loadingCaption: "AI is surveying local geodetics...",
    loadingDetails: "Gemini architecture model is assessing contour barriers, factoring transportation metrics, and outputting optimal proposals using LEED ND & Smart Cities Index criteria.",

    virtualPanelTitle: "INTEGRITY REVIEW COMMITTEE",
    virtualPanelSub: "Municipal Index Dashboard (Plan Strength Status)",
    approvedProjectsCount: "Simulated Funding:",
    indicatorGreen: "Greenery & Canopy Rate",
    indicatorTraffic: "Transit Clogging Remediation",
    indicatorEconomy: "Economic Development Vitality",
    indicatorLiving: "Livability & Social Welfare",
    scoreInitial: "Initial",
    scoreTarget: "Optimal",
    aiBriefingTitle: "AI Master Analyst Dispatch:",

    proposalsTitle: "Capital Investment Projects Portfolio",
    proposalsSubtitle: "Check/uncheck elements to allocate virtual municipal funding",
    urgencyLabel: "Priority Level",
    budgetLabel: "Outlay Costs",
    coordsLabel: "Grid Coordinate",

    insSidebarTitle: "PROJECT DETAILED INSPECTION MONITOR",
    insUrgencyHeader: "Priority",
    insBudgetHeader: "Outlay Tier",
    insScopeHeader: "INTEGRATION CAPACITY SCOPE",
    insGeoHeader: "SITING FEASIBILITY EXPLANATION",
    insImpactHeader: "SIMULATED DEPLOYMENT FEEDBACK (+/- 10):",
    insTrafficMini: "Transit Flow:",
    insEnvironmentMini: "Ecology:",
    insLivingMini: "Civic Health:",
    insEconomyMini: "GDP Impact:",
    insSelectPlaceholder: "Select any development coordinate on the map to trigger deep telemetry audit.",

    reportTitle: "Geological Site Context & Terrain Analysis Report",
    reportFeatures: "RECOGNIZED NATURAL & BUILT TRAITS",
    reportTerrain: "GENERIC TOPOGRAPHY CATEGORIZATION",
    reportExisting: "OBSERVED ON-SITE INFRASTRUCTURAL STRUCTURE",
    reportChallenges: "IDENTIFIED CRITICAL PLANNING VULNERABILITIES",
    reportOpportunities: "GEOGRAPHIC GROWTH OPPORTUNITIES & VIRTUAL RESERVES",
    reportStrategyTitle: "MASTER STRATEGY OUTLINE BY AI ADVISER",
    reportOptionPrefix: "STRATEGY",

    chatTitle: "Zoning Strategy Consultation Room",
    chatSubtitle: "Discuss resettlement offsets, policy barriers, or high-level engineering details with the expert AI...",
    chatActiveStatus: "CONSULTATION ENGINE ONLINE",
    chatLoadingIndicator: "Engaging neural model for structural planning response...",
    chatSuggestionText: "Suggested inquiries:",
    chatBtnPhasing: "💡 Financing Phases?",
    chatPromptPhasing: "How can we sequence the investment phases to optimize capital returns without budget deficits?",
    chatBtnRelocation: "💡 Resettlement Policy?",
    chatPromptRelocation: "What is an equitable relocation and compensation framework when implementing \"{name}\"?",
    chatBtnBenefits: "💡 Project Value gains?",
    chatPromptBenefits: "What are the specific socio-economic benefits associated with \"{name}\"?",
    chatInputPlaceholder: "Ask about land use, feasibility, civil engineering, and environmental clearances...",

    welcomeTitle: "Empower Civic Innovations with AI-Driven Planning",
    welcomeDesc: "Choose one of the 3 templates in the regulatory panel or upload a Google Maps satellite screenshot. The system uses deep multimodal analysis to map terrain conditions and place sustainable structures.",
    welcomeStep1Number: "1",
    welcomeStep1Title: "Interpret & Segment",
    welcomeStep1Desc: "Dissects stream corridors, illegal disposal pits, and biological buffer voids.",
    welcomeStep2Number: "2",
    welcomeStep2Title: "Aesthetic Siting",
    welcomeStep2Desc: "Places 4 to 6 civic, environmental, or commercial structures with precision.",
    welcomeStep3Number: "3",
    welcomeStep3Title: "Simulate Urban Health",
    welcomeStep3Desc: "Approves investments selectively to track city scores, budgets, and green indexes.",
    welcomeBtnAnalyzeNow: "Initiate Intelligent Zoning Now",

    footerCopyright: "© 2026 AI Urban Planner Advisor. Shaping sustainable, intelligent, and green communities globally.",
    footerPowerPhrase: "Intelligent analytics executed server-side with Gemini 3.5 Flash using spatial constraints.",

    categoryGreen: "Greenery & Ecological",
    categoryUtility: "Technical Infrastructure",
    categoryTransport: "Transit Networks",
    categoryCommunity: "Civic & Community Projects",
    categoryCommercial: "Commercial & Business Services",
    categoryIndustrial: "Advanced Logistics & Tech Siting",
    categoryDefault: "Smart Residential & Amenities",

    urgencyUrgent: "Urgent",
    urgencyHigh: "High",
    urgencyMedium: "Medium",
    urgencyLow: "Low",

    costVeryHigh: "Very High",
    costHigh: "High",
    costMedium: "Medium",
    costLow: "Low",

    cityGoalEco: "Ecological, Smart & Highly Livable City",
    cityGoalIndustrial: "Clean Industrial Cluster & Advanced Trade Logistics",
    cityGoalDisaster: "Upgraded Housing Utilities & Storm/Flood Preparedness",
    cityGoalTourism: "Waterfront Cultural Tourism Promenade & River Services",
    themeLabelLight: "Light",
    themeLabelDark: "Dark",
    clearChatBtn: "Clear Chat",
    warningDisclaimer: "Disclaimer Warning: This application is for reference, academic simulation, and conceptual design assistance only. Neither the system nor its developers shall bear any legal liability or responsibility if users choose to apply or implement any suggestion, advice, or coordinate generated by this tool in actual, real-world planning or practical settings.",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    resetZoom: "Reset View",
    panControlsHint: "Drag to pan • Scroll to zoom"
  }
};
