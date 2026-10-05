import { api } from './api';

export interface ProgressSnapshotItem {
  date: string;
  overall_score: number;
  technique_score: number;
  movement_score: number;
  serve_score: number;
  consistency_score: number;
}

export interface ProgressDataResponse {
  period: string;
  snapshots: ProgressSnapshotItem[];
}

export const progressService = {
  getProgress: async (period: '7d' | '30d' | '90d' | 'all' = '30d'): Promise<ProgressSnapshotItem[]> => {
    try {
      const response = await api.get<ProgressDataResponse>(`/players/me/progress?period=${period}`);
      return response.data?.snapshots || [];
    } catch (e) {
      console.error('Failed to fetch progress from backend:', e);
      return [];
    }
  }
};
