export interface CityScores {
  greenRating: number;
  trafficCapacity: number;
  economyGrowth: number;
  livingStandard: number;
}

export interface UrbanProject {
  id: string;
  name: string;
  category: string; // e.g. "Green", "Utility", "Transport", "Community", "Commercial", "Industrial", "Housing"
  description: string;
  estimatedCost: string; // e.g. "Thấp", "Trung bình", "Cao", "Rất cao"
  urgency: string; // e.g. "Thấp", "Trung bình", "Cao", "Khẩn cấp"
  impact: {
    traffic: number; // -10 to +10
    environment: number; // -10 to +10
    qualityOfLife: number; // -10 to +10
    economy: number; // -10 to +10
  };
  suggestionCoordinates: {
    x: number; // horizontal % (0-100)
    y: number; // vertical % (0-100)
  };
  explanation: string;
}

export interface UrbanAdvice {
  analysis: {
    detectedFeatures: string[];
    terrainType: string;
    currentInfrastructures: string[];
    challenges: string[];
    opportunities: string[];
  };
  strategies: {
    title: string;
    description: string;
  }[];
  projects: UrbanProject[];
  cityScoreImpact: {
    initialScores: CityScores;
    potentialScores: CityScores;
    narrative: string;
  };
}
