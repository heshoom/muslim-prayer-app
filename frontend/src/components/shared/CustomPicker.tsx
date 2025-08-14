import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  title: string;
  theme: any;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  selectedValue,
  onValueChange,
  items,
  title,
  theme,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.pickerButton, { 
          backgroundColor: theme.surface,
          borderColor: theme.border 
        }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.selectedText, { color: theme.text.primary }]}>
          {selectedItem?.label || 'Select...'}
        </Text>
        <FontAwesome5 
          name="chevron-down" 
          size={14} 
          color={theme.text.secondary} 
        />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable 
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
          />
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <SafeAreaView>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                  {title}
                </Text>
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.doneText, { color: theme.primary }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.optionsContainer}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.optionItem,
                      { borderBottomColor: theme.border },
                      selectedValue === item.value && { backgroundColor: theme.primary + '10' }
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: theme.text.primary },
                      selectedValue === item.value && { color: theme.primary, fontWeight: '600' }
                    ]}>
                      {item.label}
                    </Text>
                    {selectedValue === item.value && (
                      <FontAwesome5 
                        name="check" 
                        size={16} 
                        color={theme.primary} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 8,
    minHeight: 48,
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
  },
  optionsContainer: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontSize: 17,
    flex: 1,
  },
});
