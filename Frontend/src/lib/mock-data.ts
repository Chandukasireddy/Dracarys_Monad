import { type DemoState, type UserProfile } from './types';

export const DEFAULT_USERS: UserProfile[] = [];

export function initialState(): DemoState {
  return {
    sound: true,
    joinedCodes: [],
    user: null,
    challenges: [],
    approvals: [],
  };
}
