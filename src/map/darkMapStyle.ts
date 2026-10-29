import type { MapStyleElement } from 'react-native-maps';

// Mapa do Google (Android) no modo escuro, nas cores do tema escuro do app (fundo #121417,
// superfície #1D2025). No iOS o Apple Maps escurece sozinho com userInterfaceStyle.
// Os pinos e os cards continuam com as cores de status de sempre por cima.
export const darkMapStyle: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1D2025' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A0A4AB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121417' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3A3F47' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#C3C7CD' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#181B1F' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#20242A' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7D828A' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#18291F' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6B8F78' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2C3036' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#121417' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8A8F96' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#3A3F47' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1D2025' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#C3C7CD' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2A2E34' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#8A8F96' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0B1A2A' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4D6B8A' }] },
];
