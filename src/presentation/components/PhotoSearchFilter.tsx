import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeContext } from '../providers/ThemeProvider';

export interface FilterOptions {
  searchText: string;
  dateFrom?: Date;
  dateTo?: Date;
  hasLocation?: boolean;
}

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  title?: string;
}

interface PhotoSearchFilterProps {
  photos: Photo[];
  onFiltersChange: (filters: FilterOptions) => void;
}

export const PhotoSearchFilter: React.FC<PhotoSearchFilterProps> = ({
  photos,
  onFiltersChange,
}) => {
  const { theme } = useThemeContext();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>({
    searchText: '',
    dateFrom: undefined,
    dateTo: undefined,
    hasLocation: undefined,
  });
  
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const filterButtonScale = useRef(new Animated.Value(1)).current;

  const handleSearchTextChange = (text: string) => {
    const newFilters = { ...tempFilters, searchText: text };
    setTempFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const openModal = () => {
    setShowAdvancedFilters(true);
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAdvancedFilters(false);
    });
  };

  const handleFilterButtonPress = () => {
    Animated.sequence([
      Animated.timing(filterButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(filterButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
    openModal();
  };

  const handleApplyAdvancedFilters = () => {
    onFiltersChange(tempFilters);
    closeModal();
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      searchText: '',
      dateFrom: undefined,
      dateTo: undefined,
      hasLocation: undefined,
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    closeModal();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const handleDateFromChange = (event: any, selectedDate?: Date) => {
    setShowDateFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempFilters(prev => ({ ...prev, dateFrom: selectedDate }));
    }
  };

  const handleDateToChange = (event: any, selectedDate?: Date) => {
    setShowDateToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTempFilters(prev => ({ ...prev, dateTo: selectedDate }));
    }
  };

  const openDateFromPicker = () => {
    setShowDateFromPicker(true);
  };

  const openDateToPicker = () => {
    setShowDateToPicker(true);
  };

  const hasActiveFilters = tempFilters.dateFrom || tempFilters.dateTo || tempFilters.hasLocation !== undefined;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.searchBg, borderColor: theme.colors.searchBorder }]}>
          <Ionicons name="search" size={20} color={theme.colors.subtext} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Buscar por título..."
            value={tempFilters.searchText}
            onChangeText={handleSearchTextChange}
            placeholderTextColor={theme.colors.subtext}
          />
        </View>
        
        <TouchableOpacity
          onPress={handleFilterButtonPress}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.filterButton, 
              { 
                backgroundColor: theme.colors.searchBg, 
                borderColor: theme.colors.searchBorder,
                transform: [{ scale: filterButtonScale }],
              },
              hasActiveFilters && { borderColor: theme.colors.primary, backgroundColor: theme.colors.filterActive }
            ]}
          >
            <Ionicons 
              name="filter" 
              size={20} 
              color={hasActiveFilters ? theme.colors.primary : theme.colors.subtext} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAdvancedFilters}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { 
              backgroundColor: theme.colors.modalOverlay,
              opacity: modalOpacity,
            }
          ]}
        >
          <TouchableOpacity 
            style={{ flex: 1 }}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContent,
              { 
                backgroundColor: theme.colors.card,
                transform: [{
                  translateY: modalSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                }],
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filtros Avançados</Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.subtext} />
              </TouchableOpacity>
            </View>

            <View style={[styles.filterSection, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={[styles.dateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={openDateFromPicker}
                >
                  <Text style={[styles.dateButtonText, { color: theme.colors.subtext }]}>
                    De: {tempFilters.dateFrom ? formatDate(tempFilters.dateFrom) : 'Selecionar'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.dateButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={openDateToPicker}
                >
                  <Text style={[styles.dateButtonText, { color: theme.colors.subtext }]}>
                    Até: {tempFilters.dateTo ? formatDate(tempFilters.dateTo) : 'Selecionar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.filterSection, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Localização</Text>
              <View style={styles.locationContainer}>
                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                    tempFilters.hasLocation === true && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setTempFilters(prev => ({ 
                    ...prev, 
                    hasLocation: prev.hasLocation === true ? undefined : true 
                  }))}
                >
                  <Text style={[
                    styles.locationOptionText,
                    { color: theme.colors.subtext },
                    tempFilters.hasLocation === true && { color: 'white' }
                  ]}>
                    Com localização
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.locationOption,
                    { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                    tempFilters.hasLocation === false && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => setTempFilters(prev => ({ 
                    ...prev, 
                    hasLocation: prev.hasLocation === false ? undefined : false 
                  }))}
                >
                  <Text style={[
                    styles.locationOptionText,
                    { color: theme.colors.subtext },
                    tempFilters.hasLocation === false && { color: 'white' }
                  ]}>
                    Sem localização
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={handleClearFilters}
              >
                <Text style={[styles.clearButtonText, { color: theme.colors.subtext }]}>Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleApplyAdvancedFilters}
              >
                <Text style={styles.applyButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {showDateFromPicker && (
        <DateTimePicker
          value={tempFilters.dateFrom || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateFromChange}
        />
      )}

      {showDateToPicker && (
        <DateTimePicker
          value={tempFilters.dateTo || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateToChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    borderColor: '#F6CD63', // Amarelo
    backgroundColor: '#FFF9E6', // Fundo amarelo claro
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  filterSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateContainer: {
    gap: 12,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#666',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  locationOptionActive: {
    backgroundColor: '#F6CD63', // Amarelo
    borderColor: '#F6CD63', // Amarelo
  },
  locationOptionText: {
    fontSize: 14,
    color: '#666',
  },
  locationOptionTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#F6CD63', // Amarelo
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});