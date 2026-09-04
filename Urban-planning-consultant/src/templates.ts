export interface MapTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  cityGoal: string;
  cityGoalEn: string;
  additionalNotes: string;
  additionalNotesEn: string;
  svgHtml: string;
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: "riverside-empty-zone",
    name: "Vùng Ven Sông Hoang Sơ (Riverside Outskirts)",
    nameEn: "Riverside Outskirts (Unmanaged Land)",
    description: "Khu vực đất bán sơn địa bên sông, có dòng chảy uốn khúc, chưa có hạ tầng kiên cố, sẵn sàng phát triển sinh thái.",
    descriptionEn: "A semi-elevated natural site next to a winding river. No permanent infrastructure exists, making it ready for ecological planning.",
    cityGoal: "Đô thị Sinh thái, Thông minh & Đáng sống",
    cityGoalEn: "Đô thị Sinh thái, Thông minh & Đáng sống", // Matches state values
    additionalNotes: "Cần chú trọng mảng xanh ven sông, chống sạt lở bờ kè và tích hợp cầu đi bộ kết nối.",
    additionalNotesEn: "Focus on waterfront greenery, continuous embankment reinforcing, and building localized footbridges.",
    svgHtml: `<svg viewBox="0 0 800 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Background (Land) -->
      <rect width="800" height="600" fill="#E8ECE9" />
      
      <!-- Forest / Green Patches -->
      <path d="M 50,50 Q 150,80 180,200 Q 200,350 120,400 Z" fill="#C5D3C1" opacity="0.8" />
      <path d="M 600,100 Q 750,50 780,250 Q 800,450 710,500 Z" fill="#C5D3C1" opacity="0.6" />
      
      <!-- Unfinished/Proposed grid streets (Beige/Yellowish lines) -->
      <path d="M 10,250 L 790,250" stroke="#F4F3F0" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 1" />
      <path d="M 400,10 L 400,590" stroke="#F4F3F0" stroke-width="12" stroke-linecap="round" stroke-dasharray="1 1" />
      
      <!-- Natural river crossing diagonally (Blue curvy body) -->
      <path d="M -20,550 Q 300,480 420,380 T 820,150" fill="none" stroke="#A5C9EB" stroke-width="85" stroke-linecap="round" />
      <path d="M -20,550 Q 300,480 420,380 T 820,150" fill="none" stroke="#71AEE2" stroke-width="6" stroke-linecap="round" stroke-dasharray="15 20" />
      
      <!-- Dirt roads/Footpaths (Greyish lines) -->
      <path d="M 220,100 L 250,500" stroke="#DDD7CD" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M 150,300 C 250,320 450,280 650,350" stroke="#DDD7CD" stroke-width="3" fill="none" stroke-linecap="round" />
      
      <!-- Land plots of agricultural vegetation -->
      <rect x="520" y="320" width="90" height="110" rx="4" fill="#D3D9CF" stroke="#B8C4B2" stroke-width="2" />
      <rect x="630" y="310" width="110" height="80" rx="4" fill="#D3D9CF" stroke="#B8C4B2" stroke-width="2" />
      <rect x="500" y="450" width="130" height="120" rx="4" fill="#D9E0D4" stroke="#B8C4B2" stroke-width="2" />
      
      <!-- Little empty housing footprints or structures -->
      <rect x="350" y="120" width="40" height="30" fill="#CCD1C9" stroke="#9FA69B" stroke-width="1" />
      <rect x="300" y="80" width="30" height="25" fill="#CCD1C9" stroke="#9FA69B" stroke-width="1" />

      <!-- Map Elements Text -->
      <text x="35" y="580" font-family="sans-serif" font-size="12" fill="#5F8BB4" font-weight="bold">SÔNG ĐỒNG NAI / RIVER FORK</text>
      <text x="70" y="110" font-family="sans-serif" font-size="11" fill="#758272">FORESTRY ZONE / RỪNG PHÒNG HỘ</text>
      <text x="540" y="350" font-family="sans-serif" font-size="11" fill="#758272">AGRICULTURAL PLOT</text>
      <text x="310" y="270" font-family="sans-serif" font-size="10" fill="#999">DIRT TRACK / ĐƯỜNG MÒN ĐẤT</text>
    </svg>`
  },
  {
    id: "urban-density-clog",
    name: "Nút Giao Nội Đô Quá Tải (Densely Populated Junction)",
    nameEn: "Overloaded Urban Junction (Densely Populated)",
    description: "Một khu dân cư lâu năm mật độ cao, giao lộ lớn thường ngập úng và kẹt xe, thiếu thốn hoàn toàn tiện ích cây xanh và công cộng tập trung.",
    descriptionEn: "Highly congested junction surrounded by aged residential clusters. High flood risks, heavy transit gridlock, and severe lack of civic parks.",
    cityGoal: "Nâng cấp Hạ tầng dân sinh, phòng tránh thiên tai",
    cityGoalEn: "Nâng cấp Hạ tầng dân sinh, phòng tránh thiên tai", // Matches state values
    additionalNotes: "Ưu tiên thiết lập mảng xanh giảm rung bụi, xây công trình y tế/cấp cứu phản ứng nhanh và hồ điều tiết ngầm.",
    additionalNotesEn: "Prioritize layout of sound/dust filtering buffer screens, reactive healthcare hubs, and sub-surface detention bays.",
    svgHtml: `<svg viewBox="0 0 800 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Background (A bit darker ash urban concrete) -->
      <rect width="800" height="600" fill="#E2E3E2" />
      
      <!-- Gray Blocks for Dense Townhouses Layout -->
      <rect x="30" y="30" width="130" height="150" fill="#CCD1CE" stroke="#ADB5B0" stroke-width="2" />
      <rect x="180" y="30" width="120" height="150" fill="#CCD1CE" stroke="#ADB5B0" stroke-width="2" />
      <rect x="30" y="200" width="220" height="120" fill="#CCD1CE" stroke="#ADB5B0" stroke-width="2" />
      
      <rect x="520" y="30" width="240" height="150" fill="#CCD1CE" stroke="#ADB5B0" stroke-width="2" />
      <rect x="550" y="200" width="210" height="220" fill="#CCD1CE" stroke="#ADB5B0" stroke-width="2" />

      <!-- Major Yellow Intersecting Highway Grid -->
      <rect x="0" y="440" width="800" height="45" fill="#FFEBB2" />
      <line x1="0" y1="462" x2="800" y2="462" stroke="#FFF" stroke-dasharray="10 10" stroke-width="2" />
      
      <rect x="320" y="0" width="55" height="440" fill="#FFEBB2" />
      <line x1="347" y1="0" x2="347" y2="440" stroke="#FFF" stroke-dasharray="10 10" stroke-width="2" />

      <rect x="320" y="440" width="55" height="160" fill="#FFEBB2" />
      <line x1="347" y1="440" x2="347" y2="600" stroke="#FFF" stroke-dasharray="10 10" stroke-width="2" />

      <!-- Small Roads (Gray lanes) -->
      <rect x="490" y="195" width="280" height="20" fill="#F4F4F4" />
      <rect x="170" y="195" width="150" height="20" fill="#F4F4F4" />
      
      <!-- Deserted empty area in bottom left - potential development site -->
      <path d="M 30,340 C 90,340 120,350 200,340 C 270,330 280,380 280,410 C 280,430 150,430 30,430 Z" fill="#DDDDCF" stroke="#B1B3A3" stroke-width="3" />
      <text x="80" y="390" font-family="sans-serif" font-size="12" fill="#888F80" font-weight="bold">EMPTY LOT / ĐẤT TRỐNG</text>
      
      <!-- Map Labels -->
      <text x="390" y="485" font-family="sans-serif" font-size="11" fill="#B38A3F" font-weight="bold">CONGESTION INTERSECT / ĐẠI LỘ</text>
      <text x="210" y="110" font-family="sans-serif" font-size="12" fill="#6A6C69">NORTH SECTOR RESIDENTIAL</text>
      <text x="610" y="290" font-family="sans-serif" font-size="12" fill="#6A6C69">LEGACY RETAIL MARKET</text>
    </svg>`
  },
  {
    id: "highway-economic-hub",
    name: "Quỹ Đất Logistics Ven Đại Lộ (Highway Economic Hub)",
    nameEn: "Highway Trade Corridor (Logistics Land Reserve)",
    description: "Khu đất bằng phẳng nằm kề trục cao tốc liên tỉnh xương sống, thuận tiện lưu thông nhưng đang bị bỏ trống, cách xa nguồn điện lưới sạch.",
    descriptionEn: "Highly connected flatland abutting a multi-state arterial expressway. Features perfect logistics access but currently empty with zero localized grid ties.",
    cityGoal: "Cụm Công nghiệp Sạch, Vận tải thông suốt",
    cityGoalEn: "Cụm Công nghiệp Sạch, Vận tải thông suốt", // Matches state values
    additionalNotes: "Thiết kế tích hợp năng lượng tái tạo (điện mặt trời), bãi đỗ container thông minh và trạm dịch vụ trung chuyển tích hợp.",
    additionalNotesEn: "Integrate renewable solar harvesting fields, intelligent heavy-duty cargo vehicle parks, and cross-docking bays.",
    svgHtml: `<svg viewBox="0 0 800 600" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <!-- Background (Light beige flat sand/gravel) -->
      <rect width="800" height="600" fill="#ECE8DD" />
      
      <!-- Huge Expressway cutting across -->
      <rect x="0" y="80" width="800" height="70" fill="#5A5C5E" />
      <line x1="0" y1="115" x2="800" y2="115" stroke="#FFE135" stroke-width="3" />
      <line x1="0" y1="90" x2="800" y2="90" stroke="#FFF" stroke-dasharray="20 15" stroke-width="2" />
      <line x1="0" y1="140" x2="800" y2="140" stroke="#FFF" stroke-dasharray="20 15" stroke-width="2" />

      <!-- Side access ramp -->
      <path d="M 120,600 C 120,400 130,280 200,150" fill="none" stroke="#FCE8D3" stroke-width="12" />
      <path d="M 120,600 C 120,400 130,280 200,150" fill="none" stroke="#E67E22" stroke-width="2" stroke-dasharray="5 5" />
      
      <!-- Massive blank plots -->
      <rect x="250" y="180" width="220" height="150" rx="8" fill="#DFD8C4" stroke="#BFB7A3" stroke-width="2" />
      <rect x="490" y="180" width="250" height="280" rx="8" fill="#DFD8C4" stroke="#BFB7A3" stroke-width="2" />
      <rect x="250" y="350" width="220" height="220" rx="8" fill="#E4DEC9" stroke="#BFB7A3" stroke-width="2" />
      
      <!-- Power lines grid overlay -->
      <line x1="20" y1="200" x2="220" y2="580" stroke="#7F8C8D" stroke-width="1.5" stroke-dasharray="8 6" />
      <circle cx="20" cy="200" r="4" fill="#7F8C8D" />
      <circle cx="120" cy="390" r="4" fill="#7F8C8D" />
      <circle cx="220" cy="580" r="4" fill="#7F8C8D" />
      
      <text x="30" y="190" font-family="sans-serif" font-size="10" fill="#7F8C8D">GRID CORRIDOR / HÀNH LANG ĐIỆN 110KV</text>
      <text x="450" y="70" font-family="sans-serif" font-size="11" fill="#D35400" font-weight="bold">STATE EXPRESSWAY / QUỐC LỘ 1A</text>
      <text x="310" y="260" font-family="sans-serif" font-size="12" fill="#7F8C8D">UNUSED LOGISTICS LOT A</text>
      <text x="540" y="320" font-family="sans-serif" font-size="12" fill="#7F8C8D">DISTRIBUTION POINT B</text>
    </svg>`
  }
];
