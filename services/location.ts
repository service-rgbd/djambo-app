export type ResolvedCurrentLocation = {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  label: string;
};

const getCurrentPosition = () => new Promise<GeolocationPosition>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('La geolocalisation n est pas disponible sur cet appareil.'));
    return;
  }

  navigator.geolocation.getCurrentPosition(resolve, reject, {
    enableHighAccuracy: true,
    timeout: 12000,
    maximumAge: 0,
  });
});

const buildAddressLabel = (payload: Record<string, string | undefined>) => {
  const parts = [
    payload.road,
    payload.suburb,
    payload.city || payload.town || payload.village,
    payload.state,
    payload.country,
  ].filter(Boolean);

  return parts.join(', ');
};

export const resolveCurrentLocation = async (): Promise<ResolvedCurrentLocation> => {
  const position = await getCurrentPosition();
  const latitude = Number(position.coords.latitude.toFixed(6));
  const longitude = Number(position.coords.longitude.toFixed(6));

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`);
  if (!response.ok) {
    throw new Error('Impossible de convertir la position en adresse pour le moment.');
  }

  const payload = await response.json() as {
    display_name?: string;
    address?: Record<string, string | undefined>;
  };

  const city = payload.address?.city || payload.address?.town || payload.address?.village || payload.address?.state || '';
  const label = buildAddressLabel(payload.address || {});

  return {
    address: label || payload.display_name || `${latitude}, ${longitude}`,
    city,
    latitude,
    longitude,
    label: label || payload.display_name || `${latitude}, ${longitude}`,
  };
};