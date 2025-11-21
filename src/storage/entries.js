// src/storage/entries.js - Enhanced with crash prevention
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEY = '@body_book_entries';
const BACKUP_KEY = '@body_book_entries_backup';

// Validate entry data structure
function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Invalid entry: must be an object');
  }
  
  if (!entry.date || typeof entry.date !== 'string') {
    throw new Error('Invalid entry: date is required and must be a string');
  }
  
  // Date format validation (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(entry.date)) {
    throw new Error('Invalid entry: date must be in YYYY-MM-DD format');
  }
  
  // Validate score is a number
  if (entry.score !== undefined && typeof entry.score !== 'number') {
    throw new Error('Invalid entry: score must be a number');
  }
  
  return true;
}

// Validate array of entries
function validateEntries(entries) {
  if (!Array.isArray(entries)) {
    throw new Error('Invalid data: entries must be an array');
  }
  
  entries.forEach((entry, index) => {
    try {
      validateEntry(entry);
    } catch (error) {
      throw new Error(`Invalid entry at index ${index}: ${error.message}`);
    }
  });
  
  return true;
}

// Safe JSON parse with fallback
function safeJSONParse(data, fallback = []) {
  if (!data) return fallback;
  
  try {
    const parsed = JSON.parse(data);
    validateEntries(parsed);
    return parsed;
  } catch (error) {
    console.error('Failed to parse stored data:', error);
    return fallback;
  }
}

// Create backup before saving
async function createBackup(entries) {
  try {
    await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(entries));
    return true;
  } catch (error) {
    console.error('Failed to create backup:', error);
    return false;
  }
}

// Restore from backup
async function restoreFromBackup() {
  try {
    const backup = await AsyncStorage.getItem(BACKUP_KEY);
    if (backup) {
      const entries = safeJSONParse(backup, []);
      await AsyncStorage.setItem(STORAGE_KEY, backup);
      return entries;
    }
    return [];
  } catch (error) {
    console.error('Failed to restore from backup:', error);
    return [];
  }
}

// Save entries with validation and backup
export async function saveEntries(entries) {
  try {
    // Validate before saving
    validateEntries(entries);
    
    // Create backup of current data before overwriting
    const currentData = await AsyncStorage.getItem(STORAGE_KEY);
    if (currentData) {
      await createBackup(safeJSONParse(currentData, []));
    }
    
    // Save new data
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return { success: true };
  } catch (error) {
    console.error('Error saving entries:', error);
    
    // User-friendly error messages
    if (error.message.includes('quota')) {
      Alert.alert(
        'Storage Full',
        'Your device storage is full. Please free up some space and try again.'
      );
    } else if (error.message.includes('Invalid')) {
      Alert.alert(
        'Invalid Data',
        'The entry data is invalid. Please check your inputs and try again.'
      );
    } else {
      Alert.alert(
        'Save Failed',
        'Failed to save entry. Your data has been backed up and will be restored.'
      );
    }
    
    return { success: false, error: error.message };
  }
}

// Load entries with error recovery
export async function loadEntries() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return [];
    }
    
    const entries = safeJSONParse(data, null);
    
    // If parsing failed, try to restore from backup
    if (entries === null) {
      console.log('Corrupted data detected, attempting to restore from backup...');
      const restored = await restoreFromBackup();
      
      if (restored.length > 0) {
        Alert.alert(
          'Data Restored',
          'We detected corrupted data and restored from backup.'
        );
      }
      
      return restored;
    }
    
    return entries;
  } catch (error) {
    console.error('Error loading entries:', error);
    
    // Try to restore from backup
    console.log('Attempting to restore from backup...');
    const restored = await restoreFromBackup();
    
    if (restored.length > 0) {
      Alert.alert(
        'Data Restored',
        'We encountered an error loading your data and restored from backup.'
      );
    } else {
      Alert.alert(
        'Load Failed',
        'Failed to load entries. Starting with empty data.'
      );
    }
    
    return restored;
  }
}

// Get single entry with error handling
export async function getEntryByDate(date) {
  try {
    if (!date || typeof date !== 'string') {
      throw new Error('Date must be a valid string');
    }
    
    const entries = await loadEntries();
    return entries.find(e => e.date === date) || null;
  } catch (error) {
    console.error('Error getting entry:', error);
    return null;
  }
}

// Delete entry with validation
export async function deleteEntry(date) {
  try {
    if (!date || typeof date !== 'string') {
      throw new Error('Date must be a valid string');
    }
    
    const entries = await loadEntries();
    const filteredEntries = entries.filter(e => e.date !== date);
    
    if (filteredEntries.length === entries.length) {
      return { success: false, error: 'Entry not found' };
    }
    
    const result = await saveEntries(filteredEntries);
    return result.success 
      ? { success: true, date }
      : { success: false, error: result.error };
  } catch (error) {
    console.error('Error deleting entry:', error);
    return { success: false, error: error.message };
  }
}

// Clear all data (for testing/reset)
export async function clearAllEntries() {
  try {
    // Create backup before clearing
    const entries = await loadEntries();
    if (entries.length > 0) {
      await createBackup(entries);
    }
    
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing entries:', error);
    return { success: false, error: error.message };
  }
}

// Check storage health
export async function checkStorageHealth() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const backup = await AsyncStorage.getItem(BACKUP_KEY);
    
    return {
      hasData: !!data,
      hasBackup: !!backup,
      dataValid: data ? safeJSONParse(data, null) !== null : true,
      backupValid: backup ? safeJSONParse(backup, null) !== null : true,
    };
  } catch (error) {
    console.error('Error checking storage health:', error);
    return {
      hasData: false,
      hasBackup: false,
      dataValid: false,
      backupValid: false,
      error: error.message,
    };
  }
}