export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface PlayerProfile {
  id: string;
  userId: string;
  playingHand: 'Right' | 'Left';
  backhand: 'One-Handed' | 'Two-Handed';
  skillLevel: string;
  surface: string;
  height: number;
  age: number;
  matchesAnalyzed: number;
  averageScore: number;
  bestScore: number;
  improvementRate: number;
}

export interface CoachProfile {
  id: string;
  userId: string;
  specialty: string;
  experienceYears: number;
}

export type AnalysisType = 'Match' | 'Training' | 'Serve' | 'Forehand' | 'Backhand' | 'Footwork';

export type AnalysisStatus = 'uploading' | 'processing' | 'detecting' | 'analyzing' | 'complete' | 'failed';

export interface Video {
  id: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
}

export interface Analysis {
  id: string;
  userId: string;
  videoId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  createdAt: string;
  scores: {
    overall: number;
    technique: number;
    movement: number;
    serve: number;
    consistency: number;
    matchIntelligence?: number;
  };
}

export interface Metric {
  id: string;
  category: string;
  name: string;
  value: number;
  score: number;
  confidence: 'High' | 'Medium' | 'Low';
  isExperimental: boolean;
}

export interface Event {
  id: string;
  timestamp: number;
  type: string;
  description: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  sets: number;
  reps: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface CoachingReport {
  id: string;
  analysisId: string;
  strengths: string[];
  weaknesses: string[];
  priorityImprovement: string;
  explanation: string;
  drills: Drill[];
  weeklyPlan: string;
}

export interface ProgressSnapshot {
  date: string;
  overall: number;
  technique: number;
  movement: number;
  serve: number;
  consistency: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ScoresResponse {
  overall: number;
  technique: number;
  movement: number;
  serve: number;
  consistency: number;
  previousScores?: {
    overall: number;
    technique: number;
    movement: number;
    serve: number;
    consistency: number;
  };
}
