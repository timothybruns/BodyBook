// src/storage/entries.js - Enhanced with full CRUD operations
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const STORAGE_KEY = '@body_book_entries';

// CREATE - Add new entry
export async function createEntry(entry) {
  try {
    const entries = await loadEntries();
    
    // Check if entry already exists for this date
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    if (existingIndex >= 0) {
      throw new Error('Entry already exists for this date. Use updateEntry instead.');
    }
    
    // Add timestamp
    entry.timestamp = new Date().toISOString();
    
    entries.push(entry);
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return { success: true, entry };
  } catch (error) {
    console.error('Error creating entry:', error);
    return { success: false, error: error.message };
  }
}

// READ - Get all entries
export async function loadEntries() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading entries:', error);
    return [];
  }
}

// READ - Get single entry by date
export async function getEntryByDate(date) {
  try {
    const entries = await loadEntries();
    const entry = entries.find(e => e.date === date);
    return entry || null;
  } catch (error) {
    console.error('Error getting entry:', error);
    return null;
  }
}

// READ - Get entries in date range
export async function getEntriesInRange(startDate, endDate) {
  try {
    const entries = await loadEntries();
    return entries.filter(e => {
      const entryDate = new Date(e.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  } catch (error) {
    console.error('Error getting entries in range:', error);
    return [];
  }
}

// UPDATE - Update existing entry
export async function updateEntry(date, updatedFields) {
  try {
    const entries = await loadEntries();
    const existingIndex = entries.findIndex(e => e.date === date);
    
    if (existingIndex < 0) {
      throw new Error('Entry not found. Use createEntry instead.');
    }
    
    // Merge existing entry with updates
    entries[existingIndex] = {
      ...entries[existingIndex],
      ...updatedFields,
      date, // Ensure date doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return { success: true, entry: entries[existingIndex] };
  } catch (error) {
    console.error('Error updating entry:', error);
    return { success: false, error: error.message };
  }
}

// UPDATE or CREATE - Upsert entry (your current implementation)
export async function saveEntry(entry) {
  try {
    const entries = await loadEntries();
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    
    if (existingIndex >= 0) {
      // Update existing
      entries[existingIndex] = {
        ...entry,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Create new
      entry.timestamp = new Date().toISOString();
      entries.push(entry);
    }
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    
    return { success: true, entry };
  } catch (error) {
    console.error('Error saving entry:', error);
    return { success: false, error: error.message };
  }
}

// DELETE - Delete entry by date
export async function deleteEntry(date) {
  try {
    const entries = await loadEntries();
    const filteredEntries = entries.filter(e => e.date !== date);
    
    if (filteredEntries.length === entries.length) {
      throw new Error('Entry not found');
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return { success: true, date };
  } catch (error) {
    console.error('Error deleting entry:', error);
    return { success: false, error: error.message };
  }
}

// DELETE - Delete multiple entries
export async function deleteEntries(dates) {
  try {
    const entries = await loadEntries();
    const filteredEntries = entries.filter(e => !dates.includes(e.date));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return { success: true, deletedCount: entries.length - filteredEntries.length };
  } catch (error) {
    console.error('Error deleting entries:', error);
    return { success: false, error: error.message };
  }
}

// DELETE - Clear all entries
export async function clearAllEntries() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing entries:', error);
    return { success: false, error: error.message };
  }
}

// UTILITY - Duplicate entry with new date
export async function duplicateEntry(originalDate, newDate) {
  try {
    const entry = await getEntryByDate(originalDate);
    if (!entry) {
      throw new Error('Original entry not found');
    }
    
    const newEntry = {
      ...entry,
      date: newDate,
      timestamp: new Date().toISOString(),
    };
    
    delete newEntry.updatedAt; // Remove update timestamp
    
    return await createEntry(newEntry);
  } catch (error) {
    console.error('Error duplicating entry:', error);
    return { success: false, error: error.message };
  }
}

// UTILITY - Export all entries (for backup)
export async function exportEntries() {
  try {
    const entries = await loadEntries();
    return {
      success: true,
      data: entries,
      exportDate: new Date().toISOString(),
      count: entries.length,
    };
  } catch (error) {
    console.error('Error exporting entries:', error);
    return { success: false, error: error.message };
  }
}

// UTILITY - Import entries (for restore)
export async function importEntries(importedEntries, mergeStrategy = 'replace') {
  try {
    if (mergeStrategy === 'replace') {
      // Replace all existing entries
      const sorted = importedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
      return { success: true, count: sorted.length };
    } else if (mergeStrategy === 'merge') {
      // Merge with existing, keeping newest version of duplicates
      const existing = await loadEntries();
      const existingMap = new Map(existing.map(e => [e.date, e]));
      
      importedEntries.forEach(entry => {
        const existingEntry = existingMap.get(entry.date);
        if (!existingEntry || new Date(entry.timestamp) > new Date(existingEntry.timestamp)) {
          existingMap.set(entry.date, entry);
        }
      });
      
      const merged = Array.from(existingMap.values());
      merged.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return { success: true, count: merged.length };
    }
  } catch (error) {
    console.error('Error importing entries:', error);
    return { success: false, error: error.message };
  }
}

// LEGACY - Keep your original functions for backward compatibility
export async function saveEntries(entries) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entries:', error);
    Alert.alert('Error', 'Failed to save entry');
  }
}