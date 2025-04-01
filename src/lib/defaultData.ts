// Default data for testing

// Initialize localStorage with default room IDs if they don't exist
export const initDefaultData = () => {
  // Create default rooms
  if (!localStorage.getItem('roomIds')) {
    const defaultRoomIds = ['meeting123', 'meeting456', 'meeting789'];
    localStorage.setItem('roomIds', JSON.stringify(defaultRoomIds));
  }

  // Create default room creators
  if (!localStorage.getItem('roomCreators')) {
    const defaultRoomCreators = {
      'meeting123': 'test-user-id',
      'meeting456': 'test-user-id',
      'meeting789': 'test-user-id',
    };
    localStorage.setItem('roomCreators', JSON.stringify(defaultRoomCreators));
  }
};

// Initialize localStorage with test user data
export const setTestUser = () => {
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  // Save to localStorage
  localStorage.setItem(`user_${testUser.id}`, testUser.name);
  
  return testUser;
}; 