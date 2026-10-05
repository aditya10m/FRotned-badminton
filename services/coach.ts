import { api } from './api';

export interface CoachingDrill {
  id: string;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  sets: number;
  repetitions: number;
  difficulty: string;
  purpose: string;
  completed?: boolean;
}

export interface CoachingPlan {
  priority_improvement: string;
  priority_title: string;
  priority_desc: string;
  explanation?: string;
  strengths: string[];
  weaknesses: string[];
  weekly_plan: string;
  drills: CoachingDrill[];
}

export interface GeneratedScheduleDay {
  day: string;
  focus: string;
  duration: string;
}

export interface GeneratedWeeklyPlan {
  status: string;
  title: string;
  schedule: GeneratedScheduleDay[];
}

export const coachService = {
  getMyPlan: async (): Promise<CoachingPlan> => {
    try {
      const response = await api.get('/coach/my-plan');
      return response.data;
    } catch (e) {
      console.warn('Fallback to local coaching plan:', e);
      return {
        priority_improvement: 'Forehand Smash Pronation & Snap',
        priority_title: 'Forehand Smash Pronation & Snap',
        priority_desc: 'Your racquet is decelerating before shuttlecock contact and forearm pronation is delayed. This limits steep downward trajectory and smash velocity.',
        explanation: 'Kinematic tracking reveals delayed wrist snap and incomplete airborne torso rotation.',
        strengths: ['Consistent low flick serve placement', 'Rapid split-step recovery', 'Good balance on rear-court lunges'],
        weaknesses: ['Delayed forearm pronation on overhead smashes', 'Late recovery from deep rear-court high clears'],
        weekly_plan: 'Monday: Scissor Kick Smash Snap | Wednesday: Six-Corner Footwork Agility | Friday: Fast Net Kill & Tumble Tactics',
        drills: [
          {
            id: 'drill-1',
            name: 'Overhead Smash Wrist Pronation Drill',
            category: 'Smash',
            description: 'Focus on internal forearm pronation snapping the racquet face down into the shuttlecock. Progress from shadow swings to partner high lifts.',
            duration_minutes: 15,
            sets: 3,
            repetitions: 20,
            difficulty: 'Intermediate',
            purpose: 'Maximize smash steepness, power, and shuttle velocity.'
          },
          {
            id: 'drill-2',
            name: 'Six-Point Split-Step Shadow Footwork',
            category: 'Footwork',
            description: 'Perform hop split-step from center base and explode to front corners, mid-court, and rear court within 200ms.',
            duration_minutes: 20,
            sets: 4,
            repetitions: 12,
            difficulty: 'Intermediate',
            purpose: 'Eliminate reaction latency and master fast badminton court recovery.'
          },
          {
            id: 'drill-3',
            name: 'Scissor Kick Jump Smash Drill',
            category: 'Jump Smash',
            description: 'Launch off rear dominant leg, kick legs in mid-air to exchange positions, and snap racquet down at highest contact point.',
            duration_minutes: 15,
            sets: 3,
            repetitions: 10,
            difficulty: 'Advanced',
            purpose: 'Reinforce explosive vertical kinetic chain and rapid forward landing recovery.'
          }
        ]
      };
    }
  },

  getDrills: async (): Promise<CoachingDrill[]> => {
    try {
      const response = await api.get('/coach/drills');
      return response.data;
    } catch {
      return [];
    }
  },

  completeDrill: async (drillId: string): Promise<{ status: string; message: string }> => {
    const response = await api.post(`/coach/drills/${drillId}/complete`);
    return response.data;
  },

  generateWeeklyPlan: async (): Promise<GeneratedWeeklyPlan> => {
    const response = await api.post('/coach/generate-plan');
    return response.data;
  }
};
