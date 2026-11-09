import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { VenueDetail } from '@/api/types';
import { darkMapStyle } from '@/map/darkMapStyle';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { hasCoordinates } from '@/utils/geo';
import { mapsUrl } from '@/utils/maps';

type Props = { venue: Pick<VenueDetail, 'latitude' | 'longitude' | 'address'> };

// Zoom de bairro: dá para ver as ruas em volta da quadra.
const DELTA = 0.008;

/**
 * Mapa pequeno no detalhe da quadra. É só para olhar: tocar abre o Google Maps.
 * No Android usa o modo leve (imagem do mapa), que carrega rápido e não briga com a rolagem.
 * Sem coordenadas, mostra o quadro com o pino, como antes.
 * Fica fora do leitor de tela: o link "Abrir no Google Maps", logo abaixo, faz o mesmo.
 */
export function VenueMiniMap({ venue }: Props) {
  const c = useColors();
  const open = () => Linking.openURL(mapsUrl(venue));

  if (!hasCoordinates(venue)) {
    return (
      <Pressable
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        onPress={open}
        style={[styles.box, styles.center, { backgroundColor: c.surface }, contrastOutline(c)]}>
        <MaterialCommunityIcons name="map-marker" size={44} color={c.primary} />
      </Pressable>
    );
  }

  const coordinate = { latitude: venue.latitude, longitude: venue.longitude };
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.box, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <MapView
        style={StyleSheet.absoluteFill}
        liteMode
        initialRegion={{ ...coordinate, latitudeDelta: DELTA, longitudeDelta: DELTA }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterests={false}
        userInterfaceStyle={c.scheme}
        customMapStyle={c.scheme === 'dark' ? darkMapStyle : []}
        pointerEvents="none">
        <Marker coordinate={coordinate} pinColor={c.primary} />
      </MapView>
      {/* Camada por cima: o toque vai para o Google Maps, não para o mapa. */}
      <Pressable onPress={open} style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 170, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  center: { alignItems: 'center', justifyContent: 'center' },
});
