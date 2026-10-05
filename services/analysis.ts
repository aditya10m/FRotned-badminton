import { api } from './api';

export interface AnalysisScores {
  overall: number;
  technique: number;
  movement: number;
  serve: number;
  consistency: number;
}

export interface BiometricMetric {
  name: string;
  value: number;
  category: string;
  unit: string;
  confidence: number;
  is_experimental: boolean;
  description: string;
}

export interface AnalysisEvent {
  event_type: string;
  timestamp_ms: number;
  description: string;
  severity: string;
}

export interface DrillItem {
  id?: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  sets?: number;
  repetitions?: number;
  difficulty?: string;
  purpose?: string;
}

export interface AnalysisRecommendation {
  category: string;
  priority: number;
  title: string;
  description?: string;
  explanation?: string;
  drills?: DrillItem[];
}

export interface AnalysisReport {
  id: string;
  status: string;
  analysis_type: string;
  scores: AnalysisScores;
  metrics: BiometricMetric[];
  events: AnalysisEvent[];
  recommendations: AnalysisRecommendation[];
  video_url?: string;
}

export interface AnalysisSummary {
  id: string;
  status: string;
  analysis_type: string;
  progress: number;
  created_at?: string;
}

export const analysisService = {
  // 1-Click Instant Biomechanical Analysis for Match Play, Training, Serve, or Forehand
  createSampleAnalysis: async (type: string = 'match'): Promise<AnalysisReport> => {
    const response = await api.post('/analyses/sample', {
      analysis_type: type.toLowerCase(),
    });
    return response.data;
  },

  // Upload video file
  uploadVideo: async (
    fileUri: string,
    filename: string = 'stroke.mp4',
    rawFile?: any
  ): Promise<{ id: string; filename: string }> => {
    const formData = new FormData();
    if (typeof window !== 'undefined' && (rawFile instanceof Blob || (typeof File !== 'undefined' && rawFile instanceof File))) {
      formData.append('file', rawFile, filename);
    } else if (typeof window !== 'undefined' && (fileUri.startsWith('blob:') || fileUri.startsWith('data:'))) {
      try {
        const res = await fetch(fileUri);
        const blob = await res.blob();
        formData.append('file', blob, filename);
      } catch {
        formData.append('file', {
          uri: fileUri,
          name: filename,
          type: 'video/mp4',
        } as any);
      }
    } else {
      formData.append('file', {
        uri: fileUri,
        name: filename,
        type: 'video/mp4',
      } as any);
    }

    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.video;
  },

  // Start CV analysis on uploaded video
  startAnalysis: async (videoId: string, type: string = 'match'): Promise<{ id: string; status: string; progress: number }> => {
    const response = await api.post('/analyses', {
      video_id: videoId,
      analysis_type: type.toLowerCase(),
    });
    return response.data;
  },

  getStatus: async (id: string): Promise<{ id: string; status: string; progress: number }> => {
    const response = await api.get(`/analyses/${id}/status`);
    return response.data;
  },

  getReport: async (id: string): Promise<AnalysisReport> => {
    const response = await api.get(`/analyses/${id}/report`);
    return response.data;
  },

  getMetrics: async (id: string): Promise<BiometricMetric[]> => {
    const response = await api.get(`/analyses/${id}/metrics`);
    return response.data;
  },

  getCoaching: async (id: string): Promise<any> => {
    const response = await api.get(`/analyses/${id}/coaching`);
    return response.data;
  },

  listAnalyses: async (): Promise<AnalysisSummary[]> => {
    const response = await api.get('/analyses');
    return response.data;
  },

  getSkeletonAnalysis: async (id: string): Promise<SkeletonAnalysisData> => {
    const response = await api.get(`/analyses/${id}/skeleton`);
    return response.data;
  },

  waitForCompletion: async (id: string, timeoutMs: number = 10 * 60 * 1000) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const status = await analysisService.getStatus(id);
      if (status.status === 'completed') return status;
      if (status.status === 'failed') throw new Error('Video analysis failed. Please try a clear video with one visible player.');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Video analysis is taking longer than expected. Please check the report again shortly.');
  },
};

export interface DataQualityInfo {
  fps: number;
  resolution: string;
  width?: number;
  height?: number;
  duration_seconds: number;
  total_video_frames: number;
  frames_processed: number;
  frames_detected: number;
  frames_failed: number;
  pose_detection_rate: number;
  avg_confidence: number;
  pose_model: string;
  keypoints_count: number;
  has_serve: boolean;
}

export interface ScoreFactorBreakdown {
  score: number | null;
  factors: Record<string, any>;
}

export interface SkeletonKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface SkeletonFrame {
  timestamp: number;
  timestamp_str: string;
  keypoints: Record<string, SkeletonKeypoint>;
  bbox?: { x1: number; y1: number; x2: number; y2: number; confidence: number };
  knee_angle?: number | null;
  elbow_angle?: number | null;
  hip_angle?: number | null;
  shoulder_rotation?: number | null;
  torso_lean?: number | null;
  stance_width?: number | null;
  hip_rotation?: number | null;
  balance?: number | null;
  movement_displacement?: number | null;
  event?: string | null;
}

export interface SkeletonEvent {
  id: string;
  name: string;
  timestamp: number;
  timestamp_str: string;
  status: 'positive' | 'warning' | 'error' | 'info';
  knee_flexion?: number | null;
  shoulder_rotation?: number | null;
  balance?: number | null;
  note?: string;
}

export interface SkeletonAnalysisData {
  is_demo: boolean;
  video_url: string;
  fps?: number;
  duration_seconds: number;
  total_frames?: number;
  width?: number;
  height?: number;
  is_portrait?: boolean;
  data_quality?: DataQualityInfo;
  events: SkeletonEvent[];
  frames: SkeletonFrame[];
  metrics?: any[];
  scores?: {
    overall: number;
    technique: number;
    movement: number;
    serve: number | null;
    consistency: number;
  };
  score_breakdown?: Record<string, ScoreFactorBreakdown>;
  has_serve?: boolean;
}
