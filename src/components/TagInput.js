// src/components/TagInput.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../styles/theme';

export default function TagInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  suggestions = [],
  error = null,
  maxLength = 1000 
}) {
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableSuggestions, setAvailableSuggestions] = useState([]);

  // Parse initial value into tags
  useEffect(() => {
    if (value && typeof value === 'string') {
      const tags = value.split(',').map(t => t.trim()).filter(t => t);
      setSelectedTags(tags);
    }
  }, []);

  // Update available suggestions based on what's already selected
  useEffect(() => {
    const filtered = suggestions.filter(s => !selectedTags.includes(s));
    setAvailableSuggestions(filtered);
  }, [selectedTags, suggestions]);

  // Update parent component with comma-separated string
  useEffect(() => {
    const newValue = selectedTags.join(', ');
    onChange(newValue);
  }, [selectedTags]);

  const addTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setInputText('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  const handleInputSubmit = () => {
    const trimmed = inputText.trim();
    if (trimmed) {
      addTag(trimmed);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
  };

  // Filter suggestions based on input text
  const filteredSuggestions = availableSuggestions.filter(s => 
    s.toLowerCase().includes(inputText.toLowerCase())
  );

  // Show suggestions when there's input text or when field is focused
  const showSuggestions = inputText.length > 0 || filteredSuggestions.length > 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Selected Tags Display */}
      <View style={[styles.tagsContainer, error && styles.inputError]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsScrollContent}
        >
          {selectedTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity 
                onPress={() => removeTag(tag)}
                style={styles.tagRemove}
              >
                <Text style={styles.tagRemoveText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        
        {/* Text Input */}
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder={selectedTags.length === 0 ? placeholder : 'Add more...'}
          placeholderTextColor="#636366"
          returnKeyType="done"
          onSubmitEditing={handleInputSubmit}
          maxLength={50}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionButton}
                onPress={() => addTag(suggestion)}
              >
                <Text style={styles.suggestionText}>
                  {suggestion} {inputText.length === 0 ? '' : '(new tag)'}
                </Text>
              </TouchableOpacity>
            ))}
            {inputText.trim() && !suggestions.includes(inputText.trim()) && (
              <TouchableOpacity
                style={[styles.suggestionButton, styles.newTagButton]}
                onPress={handleInputSubmit}
              >
                <Text style={styles.suggestionText}>
                  {inputText} (new tag) ✓
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  tagsContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.backgroundLight,
    minHeight: 56,
  },
  inputError: {
    borderColor: colors.negative,
    borderWidth: 2,
  },
  tagsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  tagRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRemoveText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 16,
    minHeight: 20,
    padding: 0,
  },
  errorText: {
    color: colors.negative,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionButton: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.backgroundCard,
  },
  newTagButton: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});