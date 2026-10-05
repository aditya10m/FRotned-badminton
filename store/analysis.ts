import { create } from 'zustand';
import { Analysis } from '../types';

interface AnalysisState {
  currentAnalysis: Analysis | null;
  analyses: Analysis[];
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setAnalyses: (analyses: Analysis[]) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  currentAnalysis: null,
  analyses: [],
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setAnalyses: (analyses) => set({ analyses }),
}));
