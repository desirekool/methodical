import { describe, it, expect } from 'vitest';
import { createActivity } from '../activity';
import { Member } from '../../types';

const mockUser: Member = {
  id: 'test-1',
  name: 'Test User',
  avatar: 'https://example.com/avatar.png',
  role: 'user',
  email: 'test@example.com',
};

describe('createActivity', () => {
  it('returns an activity with the given user, action, and timestamp', () => {
    const activity = createActivity(mockUser, 'updated description');

    expect(activity.user).toEqual(mockUser);
    expect(activity.action).toBe('updated description');
    expect(activity.timestamp).toBe('Just now');
    expect(activity.target).toBeUndefined();
  });

  it('includes the target when provided', () => {
    const activity = createActivity(mockUser, 'moved to', 'Done');

    expect(activity.target).toBe('Done');
  });

  it('generates a unique id', () => {
    const a1 = createActivity(mockUser, 'action');
    const a2 = createActivity(mockUser, 'action');

    expect(a1.id).toBeDefined();
    expect(a1.id).not.toBe(a2.id);
  });
});
