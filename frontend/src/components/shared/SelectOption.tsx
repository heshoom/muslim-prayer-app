import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSettings } from '@/src/contexts/SettingsContext';

interface Option {
  label: string;
  value: string | number;
}

interface SelectOptionProps {
  value: string | number;
  options: Option[];
  onChange: (value: string | number) => void;
  title: string;
  description?: string;
}

export const SelectOption: React.FC<SelectOptionProps> = ({
  value,
  options,
  onChange,
  title,
  description,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useSettings();
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsVisible(false);
  };

  const styles = getStyles(isDarkMode);

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setIsVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.selectedText}>
            {selectedOption?.label || 'Select an option'}
          </Text>
          <FontAwesome5 name="chevron-down" size={12} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <FontAwesome5 name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView bounces={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionItem,
                    option.value === value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.selectedOptionText,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <FontAwesome5 name="check" size={16} color="#2980b9" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const getStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    title: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 4,
    },
    description: {
      fontSize: 13,
      color: isDarkMode ? '#aaa' : '#666',
      marginBottom: 8,
    },
    selectButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#333' : '#f5f5f5',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
      marginHorizontal: 20,
    },
    selectedText: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: isDarkMode ? '#1c1c1e' : '#fff',
      borderRadius: 12,
      maxHeight: '80%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        },
        android: {
          elevation: 5,
        },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#eee',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#000',
    },
    optionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#eee',
    },
    selectedOption: {
      backgroundColor: isDarkMode ? '#2c2c2e' : '#f8f9fa',
    },
    optionText: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
    },
    selectedOptionText: {
      color: '#2980b9',
      fontWeight: '500',
    },
  });
