import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Location as LocationType } from '../../domain/photo/Photo';

interface UseLocationReturn {
  location: LocationType | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationType | null>;
  hasPermission: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Erro ao verificar permissões de localização:', err);
      setError('Erro ao verificar permissões');
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Erro ao solicitar permissões de localização:', err);
      setError('Erro ao solicitar permissões');
      return false;
    }
  };

  const requestLocation = async (): Promise<LocationType | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se tem permissão, se não, solicitar
      let permission = hasPermission;
      if (!permission) {
        permission = await requestPermissions();
      }

      if (!permission) {
        setError('Permissão de localização negada');
        return null;
      }

      // Obter localização atual
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      const newLocation: LocationType = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      // Tentar obter endereço (geocoding reverso)
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          newLocation.address = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        }
      } catch (geocodeError) {
        console.warn('Erro ao obter endereço:', geocodeError);
        // Continua sem o endereço
      }

      setLocation(newLocation);
      return newLocation;
    } catch (err) {
      console.error('Erro ao obter localização:', err);
      setError('Erro ao obter localização');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    isLoading,
    error,
    requestLocation,
    hasPermission,
  };
};