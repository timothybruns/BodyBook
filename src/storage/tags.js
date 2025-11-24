// src/storage/tags.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const TAGS_KEY = '@body_book_tags';

// Default suggestions for each field
const DEFAULT_TAGS = {
  diet: ['Oatmeal', 'Coffee', 'Eggs', 'Chicken', 'Rice', 'Salad', 'Protein shake', 'Fruit', 'Vegetables', 'Water'],
  exercise: ['Running', 'Pushups', 'Pullups', 'Squats', 'Cycling', 'Swimming', 'Yoga', 'Weight training', 'Walking', 'Stretching'],
  recovery: ['Stretching', 'Ice bath', 'Massage', 'Sleep', 'Meditation', 'Foam rolling', 'Rest day', 'Light walk'],
};

// Load all tags
export async function loadTags() {
  try {
    const data = await AsyncStorage.getItem(TAGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return DEFAULT_TAGS;
  } catch (error) {
    console.error('Error loading tags:', error);
    return DEFAULT_TAGS;
  }
}

// Save tags
export async function saveTags(tags) {
  try {
    await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tags));
    return { success: true };
  } catch (error) {
    console.error('Error saving tags:', error);
    return { success: false, error: error.message };
  }
}

// Add a new tag to a specific field
export async function addTag(field, tag) {
  try {
    const tags = await loadTags();
    if (!tags[field]) {
      tags[field] = [];
    }
    if (!tags[field].includes(tag)) {
      tags[field].push(tag);
      await saveTags(tags);
    }
    return { success: true };
  } catch (error) {
    console.error('Error adding tag:', error);
    return { success: false, error: error.message };
  }
}

// Update tags based on entry data (learns from user input)
export async function learnFromEntry(entry) {
  try {
    const tags = await loadTags();
    
    // Learn diet tags
    if (entry.diet) {
      const dietItems = entry.diet.split(',').map(t => t.trim()).filter(t => t);
      dietItems.forEach(item => {
        if (!tags.diet.includes(item)) {
          tags.diet.push(item);
        }
      });
    }
    
    // Learn exercise tags
    if (entry.exercise) {
      const exerciseItems = entry.exercise.split(',').map(t => t.trim()).filter(t => t);
      exerciseItems.forEach(item => {
        if (!tags.exercise.includes(item)) {
          tags.exercise.push(item);
        }
      });
    }
    
    // Learn recovery tags
    if (entry.recovery) {
      const recoveryItems = entry.recovery.split(',').map(t => t.trim()).filter(t => t);
      recoveryItems.forEach(item => {
        if (!tags.recovery.includes(item)) {
          tags.recovery.push(item);
        }
      });
    }
    
    await saveTags(tags);
    return { success: true };
  } catch (error) {
    console.error('Error learning from entry:', error);
    return { success: false, error: error.message };
  }
}