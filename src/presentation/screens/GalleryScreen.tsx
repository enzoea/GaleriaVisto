/// <reference path="../theme/styled.d.ts" />
import React, { useState } from "react";
import { FlatList, Pressable, Image, ActivityIndicator, Alert, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import { Link, useRouter } from "expo-router";
import { usePhotosEnhanced } from "../hooks/usePhotosEnhanced";
import { usePhotoFilters } from "../hooks/usePhotoFilters";
import { PhotoSearchFilter } from "../components/PhotoSearchFilter";
import { useThemeContext } from "../providers/ThemeProvider";
import { ThemeToggle } from "../components/ThemeToggle";
import { AnimatedPhotoCard } from "../components/AnimatedPhotoCard";
import { PhotoComparisonModal } from "../components/PhotoComparisonModal";

import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';

interface ThemeProps {
  theme: {
    colors: {
      background: string;
      card: string;
      text: string;
      border: string;
    };
    spacing: (n: number) => number;
    radius: {
      md: number;
    };
  };
}

const Wrapper = styled.View`
  flex: 1;
  background: ${({theme}: ThemeProps) => theme.colors.background};
  padding: ${({theme}: ThemeProps) => theme.spacing(2)}px;
`;

const Card = styled.View`
  background: ${({theme}: ThemeProps) => theme.colors.card};
  border: 1px solid ${({theme}: ThemeProps) => theme.colors.border};
  padding: ${({theme}: ThemeProps) => theme.spacing(1)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
  margin-bottom: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const EmptyCard = styled(Card)`
  align-items: center;
  justify-content: center;
  min-height: 120px;
`;

const PhotoCard = styled(Card)`
  position: relative;
`;

const PhotoImage = styled(Image)`
  width: 100%;
  height: 200px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
  margin-bottom: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const PhotoInfo = styled.View`
  flex: 1;
`;

const PhotoInfoRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}: ThemeProps) => theme.spacing(0.5)}px;
`;

const Title = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

const PhotoDate = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 12px;
  opacity: 0.7;
`;

const LocationText = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 11px;
  opacity: 0.6;
  margin-top: 2px;
`;

const DeleteButton = styled.Pressable`
  background: #ff4444;
  padding: ${({theme}: ThemeProps) => theme.spacing(0.5)}px ${({theme}: ThemeProps) => theme.spacing(1)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
`;

const DeleteText = styled.Text`
  color: white;
  font-size: 12px;
  font-weight: 600;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const FilterSummary = styled.View`
  padding: 12px 16px;
  background: #f0f8ff;
  border-left-width: 4px;
  border-left-color: #007AFF;
  margin-bottom: 8px;
`;

const FilterSummaryText = styled.Text`
  color: #007AFF;
  font-size: 12px;
  font-weight: 500;
`;

const PhotoCounter = styled.View`
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  align-items: center;
`;

const CounterText = styled.Text`
  color: #666;
  font-size: 12px;
`;

const CompareButton = styled(TouchableOpacity)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #007AFF;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  justify-content: center;
  align-items: center;
  elevation: 5;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  padding-horizontal: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const HeaderTitle = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 24px;
  font-weight: bold;
`;

const AddPhotoButton = styled.Pressable`
  background: #007AFF;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  justify-content: center;
  align-items: center;
  elevation: 3;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.15;
  shadow-radius: 2px;
`;

const AddPhotoIcon = styled.Text`
  color: white;
  font-size: 24px;
  font-weight: bold;
`;

const PhotoGridItem = styled.View`
  flex: 1;
  margin: ${({theme}: ThemeProps) => theme.spacing(0.5)}px;
  max-width: 48%;
`;

export default function GalleryScreen() {
  const { theme } = useThemeContext();
  const router = useRouter();
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const { photos, loading, error, deletePhoto, refreshPhotos } = usePhotosEnhanced();
  const { 
    filters, 
    filteredPhotos, 
    updateFilters, 
    hasActiveFilters,
    filteredCount,
    totalPhotos,
    getFilterSummary
  } = usePhotoFilters(photos);

  // Removido useFocusEffect que estava causando loops infinitos
  // As fotos são carregadas automaticamente pelo PhotoContext

  const handleDeletePhoto = (id: string) => {
    // A confirmação agora é feita no AnimatedPhotoCard
    deletePhoto(id);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Wrapper>
        <LoadingContainer>
          <ActivityIndicator size="large" />
          <Title style={{ marginTop: 16 }}>Carregando fotos...</Title>
        </LoadingContainer>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, marginBottom: 16 }}>
        <Title style={{ fontSize: 18, fontWeight: 'bold' }}>Galeria</Title>
        <ThemeToggle />
      </View>
      
      <PhotoSearchFilter
        photos={photos}
        onFiltersChange={updateFilters}
      />
      
      {hasActiveFilters && (
        <FilterSummary>
          <FilterSummaryText>
            {getFilterSummary()}
          </FilterSummaryText>
        </FilterSummary>
      )}
      
      <PhotoCounter>
        <CounterText>
          {totalPhotos > 0 
            ? filteredPhotos.length !== totalPhotos 
              ? `${filteredPhotos.length} de ${totalPhotos} fotos`
              : `${totalPhotos} fotos`
            : 'Nenhuma foto encontrada'
          }
        </CounterText>
      </PhotoCounter>
      
      <FlatList
        data={filteredPhotos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyCard>
            <Title style={{ color: theme.colors.text }}>
              {hasActiveFilters 
                ? 'Nenhuma foto encontrada com os filtros aplicados'
                : 'Nenhuma foto encontrada'
              }
            </Title>
            {hasActiveFilters ? (
              <Pressable 
                style={{ 
                  backgroundColor: theme.colors.card, 
                  padding: theme.spacing(1), 
                  borderRadius: theme.radius.md,
                  marginTop: 8 
                }}
                onPress={() => updateFilters({
                   searchText: '',
                   dateFrom: undefined,
                   dateTo: undefined,
                   hasLocation: undefined,
                 })}
              >
                <PhotoDate style={{ color: theme.colors.text }}>Limpar filtros</PhotoDate>
              </Pressable>
            ) : (
              <Link href="/camera" asChild>
                <Pressable>
                  <PhotoDate style={{ marginTop: 8, color: theme.colors.text }}>Toque para capturar</PhotoDate>
                </Pressable>
              </Link>
            )}
          </EmptyCard>
        }
        renderItem={({item, index}) => (
          <PhotoGridItem>
            <AnimatedPhotoCard
              photo={item}
              index={index}
              onDelete={handleDeletePhoto}
              onPress={() => router.push(`/photo-details/${item.id}`)}
            />
          </PhotoGridItem>
        )}
        ListHeaderComponent={() => (
          filteredPhotos.length > 0 ? (
            <HeaderContainer>
              <HeaderTitle>Suas Fotos ({filteredPhotos.length})</HeaderTitle>
              <Link href="/camera" asChild>
                <AddPhotoButton>
                  <AddPhotoIcon>+</AddPhotoIcon>
                </AddPhotoButton>
              </Link>
            </HeaderContainer>
          ) : null
        )}
        numColumns={filteredPhotos.length > 0 ? 2 : 1}
        key={filteredPhotos.length > 0 ? 'grid' : 'list'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing(2),
          paddingBottom: theme.spacing(2),
        }}
      />
      
      {filteredPhotos.length > 1 && (
        <CompareButton onPress={() => setShowComparisonModal(true)}>
          <Ionicons name="git-compare" size={24} color="white" />
        </CompareButton>
      )}
      
      <PhotoComparisonModal
        visible={showComparisonModal}
        photos={filteredPhotos}
        onClose={() => setShowComparisonModal(false)}
      />
    </Wrapper>
  );
}
