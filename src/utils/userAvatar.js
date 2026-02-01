// Utility functions for user-specific avatar storage

/**
 * Get user-specific avatar key
 * @param {string} userId - The user's ID
 * @returns {string} The localStorage key for this user's avatar
 */
export const getAvatarKey = (userId) => `userAvatar_${userId}`;

/**
 * Get user-specific avatar from localStorage
 * @param {string} userId - The user's ID
 * @returns {string|null} The avatar URL or null if not found
 */
export const getUserAvatar = (userId) => {
  if (userId) {
    return localStorage.getItem(getAvatarKey(userId)) || null;
  }
  return null;
};

/**
 * Set user-specific avatar in localStorage
 * @param {string} userId - The user's ID
 * @param {string} avatarUrl - The avatar URL to store
 */
export const setUserAvatar = (userId, avatarUrl) => {
  if (userId) {
    localStorage.setItem(getAvatarKey(userId), avatarUrl);
  }
};

/**
 * Clean up old shared avatar localStorage key
 * This removes the old non-user-specific key that caused the bug
 */
export const cleanupOldAvatarKeys = () => {
  const oldKey = 'userAvatar';
  const oldValue = localStorage.getItem(oldKey);
  if (oldValue) {
    // Remove the old shared key
    localStorage.removeItem(oldKey);
    console.log('Cleaned up old shared avatar key');
  }
};

/**
 * Initialize user avatar from legacy storage format
 * @param {string} userId - The user's ID
 * @returns {string|null} The avatar URL or null
 */
export const initializeUserAvatar = (userId) => {
  // First try to get user-specific key
  let avatar = getUserAvatar(userId);
  
  // If not found, check old shared key (for migration)
  if (!avatar) {
    const oldKey = 'userAvatar';
    const oldValue = localStorage.getItem(oldKey);
    if (oldValue) {
      // Migrate old value to user-specific key
      setUserAvatar(userId, oldValue);
      avatar = oldValue;
      // Remove old key after migration
      localStorage.removeItem(oldKey);
    }
  }
  
  return avatar;
};
