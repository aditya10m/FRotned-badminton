import { api } from './api';

export interface PlayerProfileData {
  id?: string;
  userId?: string;
  fullName?: string;
  email?: string;
  playingHand?: string;
  backhand?: string;
  skillLevel?: string;
  surface?: string;
  height?: number;
  age?: number;
  country?: string;
  matchesAnalyzed?: number;
  bestScore?: number;
  averageScore?: number;
}

export const playerService = {
  getProfile: async (): Promise<PlayerProfileData> => {
    const response = await api.get('/players/me');
    const data = response.data;
    return {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name || '',
      email: data.email || '',
      playingHand: data.playing_hand === 'left' ? 'Left' : 'Right',
      backhand: data.backhand_type === 'one_handed' ? 'One-Handed' : 'Two-Handed',
      skillLevel: data.skill_level ? (data.skill_level.charAt(0).toUpperCase() + data.skill_level.slice(1)) : 'Intermediate',
      surface: data.preferred_surface || 'Hard',
      height: data.height_cm || 180,
      age: data.age || 25,
      country: data.country || 'USA',
      matchesAnalyzed: data.statistics?.matches_count || 12,
      bestScore: data.statistics?.best_score || 88,
      averageScore: data.statistics?.average_score || 81,
    };
  },

  updateProfile: async (data: Partial<PlayerProfileData>): Promise<PlayerProfileData> => {
    // Map to backend snake_case
    const payload: Record<string, any> = {};
    if (data.fullName !== undefined) payload.full_name = data.fullName;
    if (data.playingHand !== undefined) payload.playing_hand = data.playingHand.toLowerCase();
    if (data.backhand !== undefined) {
      payload.backhand_type = data.backhand.toLowerCase().includes('one') ? 'one_handed' : 'two_handed';
    }
    if (data.skillLevel !== undefined) payload.skill_level = data.skillLevel.toLowerCase();
    if (data.surface !== undefined) payload.preferred_surface = data.surface;
    if (data.height !== undefined) payload.height_cm = Number(data.height);
    if (data.age !== undefined) payload.age = Number(data.age);
    if (data.country !== undefined) payload.country = data.country;

    const response = await api.put('/players/me', payload);
    const res = response.data;
    return {
      id: res.id,
      userId: res.user_id,
      fullName: res.full_name || data.fullName,
      email: res.email,
      playingHand: res.playing_hand === 'left' ? 'Left' : 'Right',
      backhand: res.backhand_type === 'one_handed' ? 'One-Handed' : 'Two-Handed',
      skillLevel: res.skill_level ? (res.skill_level.charAt(0).toUpperCase() + res.skill_level.slice(1)) : 'Intermediate',
      surface: res.preferred_surface || 'Hard',
      height: res.height_cm || 180,
      age: res.age || 25,
      country: res.country || 'USA',
    };
  }
};
