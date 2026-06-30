import { Activity, Member } from '../types';

export function createActivity(user: Member, action: string, target?: string): Activity {
  return {
    id: crypto.randomUUID(),
    user,
    action,
    target,
    timestamp: 'Just now',
  };
}
