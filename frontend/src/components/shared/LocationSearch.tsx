import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { locationValidationService, LocationSuggestion } from '@/src/services/locationValidationService';
import { useSettings } from '@/src/contexts/SettingsContext';
import { darkTheme, lightTheme } from '@/src/constants/theme';
import { useTranslation } from '@/src/i18n';

interface LocationSearchProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  onValidationError: (error: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  onValidationError,
  placeholder,
  initialValue = ''
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showPopularCities, setShowPopularCities] = useState(false);
  
  const { isDarkMode } = useSettings();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { t } = useTranslation();
  
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Show popular cities when input is focused and empty
  useEffect(() => {
    if (inputValue.trim() === '' && showSuggestions) {
      setShowPopularCities(true);
      setSuggestions(locationValidationService.getPopularCities());
    } else {
      setShowPopularCities(false);
    }
  }, [inputValue, showSuggestions]);

  // Debounced search for suggestions
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (inputValue.trim().length >= 2 && showSuggestions && !showPopularCities) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await locationValidationService.getCitySuggestions(inputValue.trim());
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    } else if (inputValue.trim().length < 2 && !showPopularCities) {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue, showSuggestions, showPopularCities]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    Keyboard.dismiss();
    onLocationSelect(suggestion);
  };

  const handleManualSearch = async () => {
    if (!inputValue.trim()) {
      onValidationError(t('pleaseEnterCityName') || 'Please enter a city name');
      return;
    }

    setIsValidating(true);
    try {
      const validation = await locationValidationService.validateCity(inputValue.trim());
      
      if (validation.isValid && validation.suggestion) {
        setInputValue(validation.suggestion.name);
        onLocationSelect(validation.suggestion);
      } else {
        onValidationError(validation.error || t('invalidCityName') || 'Invalid city name');
      }
    } catch (error) {
      onValidationError(t('validationError') || 'Error validating city name');
    } finally {
      setIsValidating(false);
    }
  };

  const renderSuggestionItem = ({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { 
        backgroundColor: theme.surface,
        borderBottomColor: theme.border 
      }]}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.suggestionName, { color: theme.text.primary }]}>
        {item.name}
      </ThemedText>
      <ThemedText style={[styles.suggestionDetails, { color: theme.text.secondary }]}>
        {item.region && `${item.region}, `}{item.country}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { 
            backgroundColor: theme.surface,
            color: theme.text.primary,
            borderColor: theme.border
          }]}
          placeholder={placeholder || t('searchCity')}
          placeholderTextColor={theme.text.secondary}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="search"
          onSubmitEditing={handleManualSearch}
        />
        
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: theme.primary }]} 
          onPress={handleManualSearch}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>{t('search')}</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <ThemedView style={[styles.suggestionsList, { 
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.text.primary
        }]}>
          {showPopularCities && (
            <View style={[styles.sectionHeader, { borderBottomColor: theme.border }]}>
              <ThemedText style={[styles.sectionTitle, { color: theme.text.secondary }]}>
                {t('popularCities') || 'Popular Cities'}
              </ThemedText>
            </View>
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.text.secondary }]}>
                {t('searching') || 'Searching...'}
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {suggestions.map((item) => (
                <View key={item.id}>
                  {renderSuggestionItem({ item })}
                </View>
              ))}
            </ScrollView>
          )}
        </ThemedView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    minWidth: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsList: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 300,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  flatList: {
    maxHeight: 250,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
});
