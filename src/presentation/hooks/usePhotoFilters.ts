import { useState, useMemo } from 'react';
import { Photo } from '../../domain/photo/Photo';
import { FilterOptions } from '../components/PhotoSearchFilter';

export const usePhotoFilters = (photos: Photo[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    dateFrom: undefined,
    dateTo: undefined,
    hasLocation: undefined,
  });

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Filtro por texto (título)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const titleMatch = photo.title?.toLowerCase().includes(searchLower);
        if (!titleMatch) return false;
      }

      // Filtro por data
      if (filters.dateFrom || filters.dateTo) {
        const photoDate = new Date(photo.timestamp);
        
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (photoDate < fromDate) return false;
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (photoDate > toDate) return false;
        }
      }

      // Filtro por localização
      if (filters.hasLocation !== undefined) {
        const hasLocation = photo.location !== undefined && photo.location !== null;
        if (filters.hasLocation !== hasLocation) return false;
      }

      return true;
    });
  }, [photos, filters]);

  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      searchText: '',
      dateFrom: undefined,
      dateTo: undefined,
      hasLocation: undefined,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchText !== '' ||
      filters.dateFrom !== undefined ||
      filters.dateTo !== undefined ||
      filters.hasLocation !== undefined
    );
  }, [filters]);

  const getFilterSummary = () => {
    const summary: string[] = [];
    
    if (filters.searchText) {
      summary.push(`Título: "${filters.searchText}"`);
    }
    
    if (filters.dateFrom || filters.dateTo) {
      if (filters.dateFrom && filters.dateTo) {
        summary.push(`Data: ${filters.dateFrom.toLocaleDateString('pt-BR')} - ${filters.dateTo.toLocaleDateString('pt-BR')}`);
      } else if (filters.dateFrom) {
        summary.push(`A partir de: ${filters.dateFrom.toLocaleDateString('pt-BR')}`);
      } else if (filters.dateTo) {
        summary.push(`Até: ${filters.dateTo.toLocaleDateString('pt-BR')}`);
      }
    }
    
    if (filters.hasLocation === true) {
      summary.push('Com localização');
    } else if (filters.hasLocation === false) {
      summary.push('Sem localização');
    }
    
    return summary;
  };

  return {
    filters,
    filteredPhotos,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    getFilterSummary,
    totalPhotos: photos.length,
    filteredCount: filteredPhotos.length,
  };
};