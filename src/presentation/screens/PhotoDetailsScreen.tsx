import React, { useEffect, useState } from 'react';
import { StatusBar, Alert, Share, Dimensions, ScrollView, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { useThemeContext } from '../providers/ThemeProvider';
import { usePhotosEnhanced } from '../hooks/usePhotosEnhanced';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

interface ThemeProps {
  theme: {
    colors: {
      background: string;
      text: string;
      card: string;
      border: string;
      subtext: string;
      primary: string;
      success: string;
      warning: string;
    };
    spacing: (n: number) => number;
    radius: {
      md: number;
      lg: number;
    };
  };
}

const Container = styled.View`
  flex: 1;
  background: ${({theme}: ThemeProps) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  padding-top: 50px;
  background: ${({theme}: ThemeProps) => theme.colors.background};
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}: ThemeProps) => theme.colors.border};
`;

const BackButton = styled.Pressable`
  padding: ${({theme}: ThemeProps) => theme.spacing(1)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
`;

const HeaderTitle = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 18px;
  font-weight: 600;
`;

const HeaderActions = styled.View`
  flex-direction: row;
  gap: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const ActionButton = styled.Pressable`
  padding: ${({theme}: ThemeProps) => theme.spacing(1)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
`;

const ScrollContainer = styled(ScrollView)`
  flex: 1;
`;

const PhotoContainer = styled.View`
  background: ${({theme}: ThemeProps) => theme.colors.card};
  margin: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.lg}px;
  padding: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  border: 1px solid ${({theme}: ThemeProps) => theme.colors.border};
`;

const PhotoImage = styled.Image`
  width: 100%;
  height: 300px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
`;

const InfoSection = styled.View`
  background: ${({theme}: ThemeProps) => theme.colors.card};
  margin: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  margin-top: 0;
  border-radius: ${({theme}: ThemeProps) => theme.radius.lg}px;
  border: 1px solid ${({theme}: ThemeProps) => theme.colors.border};
`;

const SectionHeader = styled.View`
  padding: ${({theme}: ThemeProps) => theme.spacing(3)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}: ThemeProps) => theme.colors.border};
`;

const SectionTitle = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 18px;
  font-weight: 600;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({theme}: ThemeProps) => theme.spacing(3)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}: ThemeProps) => theme.colors.border};
`;

const InfoIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: ${({theme}: ThemeProps) => theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-right: ${({theme}: ThemeProps) => theme.spacing(3)}px;
`;

const InfoContent = styled.View`
  flex: 1;
`;

const InfoLabel = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.subtext};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
`;

const InfoValue = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 16px;
  font-weight: 400;
`;

const TechnicalInfoSection = styled.View`
  background: ${({theme}: ThemeProps) => theme.colors.card};
  margin: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  margin-top: 0;
  border-radius: ${({theme}: ThemeProps) => theme.radius.lg}px;
  border: 1px solid ${({theme}: ThemeProps) => theme.colors.border};
`;

const TechnicalGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: ${({theme}: ThemeProps) => theme.spacing(2)}px;
`;

const TechnicalItem = styled.View`
  width: 50%;
  padding: ${({theme}: ThemeProps) => theme.spacing(2)}px;
  align-items: center;
`;

const TechnicalIcon = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background: ${({theme}: ThemeProps) => theme.colors.success}20;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const TechnicalLabel = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.subtext};
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 2px;
`;

const TechnicalValue = styled.Text`
  color: ${({theme}: ThemeProps) => theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const BottomActions = styled.View`
  padding: ${({theme}: ThemeProps) => theme.spacing(3)}px;
  background: ${({theme}: ThemeProps) => theme.colors.background};
`;

const ActionButtonsRow = styled.View`
  flex-direction: row;
  gap: ${({theme}: ThemeProps) => theme.spacing(2)}px;
`;

const PrimaryButton = styled.Pressable`
  flex: 1;
  background: ${({theme}: ThemeProps) => theme.colors.primary};
  padding: ${({theme}: ThemeProps) => theme.spacing(3)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const SecondaryButton = styled.Pressable`
  flex: 1;
  background: ${({theme}: ThemeProps) => theme.colors.warning};
  padding: ${({theme}: ThemeProps) => theme.spacing(3)}px;
  border-radius: ${({theme}: ThemeProps) => theme.radius.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({theme}: ThemeProps) => theme.spacing(1)}px;
`;

const ButtonText = styled.Text`
  color: white;
  font-size: 16px;
  font-weight: 600;
`;

export default function PhotoDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { theme } = useThemeContext();
  const { photos, deletePhoto } = usePhotosEnhanced();
  const [photo, setPhoto] = useState<any>(null);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    size: number;
  } | null>(null);

  useEffect(() => {
    if (id && photos) {
      const foundPhoto = photos.find(p => p.id === id);
      setPhoto(foundPhoto);
      
      // Carregar informações técnicas da imagem
      if (foundPhoto) {
        loadImageInfo(foundPhoto.uri);
      }
    }
  }, [id, photos]);

  const loadImageInfo = async (uri: string) => {
    try {
      // Obter dimensões da imagem usando Image.getSize do React Native
      const { width, height } = await new Promise<{width: number, height: number}>((resolve, reject) => {
        Image.getSize(
          uri,
          (width, height) => {
            resolve({ width, height });
          },
          (error) => {
            reject(new Error('Falha ao carregar dimensões da imagem'));
          }
        );
      });

      setImageInfo({
        width,
        height,
        size: 0, // Tamanho não disponível via Image.getSize
      });
    } catch (error) {
      console.error('Erro ao carregar informações da imagem:', error);
      setImageInfo({
        width: 0,
        height: 0,
        size: 0,
      });
    }
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatResolution = (width: number, height: number) => {
    if (width === 0 || height === 0) return 'N/A';
    return `${width} × ${height}`;
  };

  const calculateMegapixels = (width: number, height: number) => {
    if (width === 0 || height === 0) return 'N/A';
    const megapixels = (width * height) / 1000000;
    return megapixels.toFixed(1) + ' MP';
  };

  const getAspectRatio = (width: number, height: number) => {
    if (width === 0 || height === 0) return 'N/A';
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}:${height / divisor}`;
  };

  const handleShare = async () => {
    if (!photo) return;

    try {
      console.log('Iniciando compartilhamento...');
      
      // Criar texto com informações da foto
      let message = `📸 ${photo.title || 'Foto'}\n`;
      message += `📅 ${formatDate(photo.timestamp)}\n`;
      
      if (imageInfo) {
        message += `📐 ${formatResolution(imageInfo.width, imageInfo.height)}\n`;
        message += `💾 ${formatFileSize(imageInfo.size)}\n`;
      }
      
      if (photo.location) {
        message += `📍 ${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}`;
      }

      console.log('Mensagem preparada:', message);

      // Primeira tentativa: Usar expo-sharing com dialogTitle como legenda
      if (await Sharing.isAvailableAsync()) {
        try {
          console.log('Tentando compartilhar com expo-sharing...');
          await Sharing.shareAsync(photo.uri, {
            mimeType: 'image/jpeg',
            dialogTitle: message,
          });
          console.log('Compartilhamento com expo-sharing bem-sucedido');
          return;
        } catch (sharingError) {
          console.log('Erro com expo-sharing:', sharingError);
        }
      }

      // Segunda tentativa: Share nativo com url e message
      try {
        console.log('Tentando compartilhar com Share nativo...');
        const result = await Share.share({
          message: message,
          url: photo.uri,
        });
        
        if (result.action === Share.sharedAction) {
          console.log('Compartilhamento com Share nativo bem-sucedido');
          return;
        }
      } catch (shareError) {
        console.log('Erro com Share nativo:', shareError);
      }

      // Terceira tentativa: Apenas texto com informação da imagem
      try {
        console.log('Tentando compartilhar apenas texto...');
        await Share.share({
          message: `${message}\n\nImagem: ${photo.uri}`,
        });
        console.log('Compartilhamento de texto bem-sucedido');
      } catch (textError) {
        console.log('Erro ao compartilhar texto:', textError);
        Alert.alert('Erro', 'Não foi possível compartilhar a imagem');
      }
    } catch (error) {
      console.error('Erro geral no compartilhamento:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a foto');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Deletar Foto',
      'Tem certeza que deseja deletar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Deletar', 
          style: 'destructive',
          onPress: () => {
            if (photo) {
              deletePhoto(photo.id);
              router.back();
            }
          }
        }
      ]
    );
  };

  if (!photo) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </BackButton>
          <HeaderTitle>Foto não encontrada</HeaderTitle>
          <HeaderActions />
        </Header>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <Header>
        <BackButton onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </BackButton>
        <HeaderTitle>Detalhes da foto</HeaderTitle>
        <HeaderActions>
          <ActionButton onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={theme.colors.text} />
          </ActionButton>
        </HeaderActions>
      </Header>

      <ScrollContainer showsVerticalScrollIndicator={false}>
        <PhotoContainer>
          <PhotoImage 
            source={{ uri: photo.uri }} 
            resizeMode="contain"
          />
        </PhotoContainer>

        <InfoSection>
          <SectionHeader>
            <SectionTitle>Informações Gerais</SectionTitle>
          </SectionHeader>
          
          <InfoRow>
            <InfoIcon>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>Data e Hora</InfoLabel>
              <InfoValue>{formatDate(photo.timestamp)}</InfoValue>
            </InfoContent>
          </InfoRow>

          {photo.title && (
            <InfoRow>
              <InfoIcon>
                <Ionicons name="text" size={20} color={theme.colors.primary} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Título</InfoLabel>
                <InfoValue>{photo.title}</InfoValue>
              </InfoContent>
            </InfoRow>
          )}

          {photo.location && (
            <InfoRow style={{ borderBottomWidth: 0 }}>
              <InfoIcon>
                <Ionicons name="location" size={20} color={theme.colors.primary} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Localização</InfoLabel>
                <InfoValue>
                  {photo.location.address || 
                    `${photo.location.latitude.toFixed(6)}, ${photo.location.longitude.toFixed(6)}`
                  }
                </InfoValue>
              </InfoContent>
            </InfoRow>
          )}
        </InfoSection>

        {imageInfo && (
          <TechnicalInfoSection>
            <SectionHeader>
              <SectionTitle>Informações Técnicas</SectionTitle>
            </SectionHeader>
            
            <TechnicalGrid>
              <TechnicalItem>
                <TechnicalIcon>
                  <Ionicons name="resize" size={24} color={theme.colors.success} />
                </TechnicalIcon>
                <TechnicalLabel>Resolução</TechnicalLabel>
                <TechnicalValue>{formatResolution(imageInfo.width, imageInfo.height)}</TechnicalValue>
              </TechnicalItem>

              <TechnicalItem>
                <TechnicalIcon>
                  <Ionicons name="camera" size={24} color={theme.colors.success} />
                </TechnicalIcon>
                <TechnicalLabel>Megapixels</TechnicalLabel>
                <TechnicalValue>{calculateMegapixels(imageInfo.width, imageInfo.height)}</TechnicalValue>
              </TechnicalItem>

              <TechnicalItem>
                <TechnicalIcon>
                  <Ionicons name="document" size={24} color={theme.colors.success} />
                </TechnicalIcon>
                <TechnicalLabel>Tamanho</TechnicalLabel>
                <TechnicalValue>{formatFileSize(imageInfo.size)}</TechnicalValue>
              </TechnicalItem>

              <TechnicalItem>
                <TechnicalIcon>
                  <Ionicons name="crop" size={24} color={theme.colors.success} />
                </TechnicalIcon>
                <TechnicalLabel>Proporção</TechnicalLabel>
                <TechnicalValue>{getAspectRatio(imageInfo.width, imageInfo.height)}</TechnicalValue>
              </TechnicalItem>
            </TechnicalGrid>
          </TechnicalInfoSection>
        )}
      </ScrollContainer>

      <BottomActions>
        <ActionButtonsRow>
          <PrimaryButton onPress={handleShare}>
            <Ionicons name="share" size={20} color="white" />
            <ButtonText>Compartilhar</ButtonText>
          </PrimaryButton>
          
          <SecondaryButton onPress={handleDelete}>
            <Ionicons name="trash" size={20} color="#FF4444" />
            <ButtonText>Excluir</ButtonText>
          </SecondaryButton>
        </ActionButtonsRow>
      </BottomActions>
    </Container>
  );
}
