import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { VenueDetail } from '@/api/types';
import { Text } from '@/components/Text';
import { VenueCover } from '@/components/VenueCover';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Botões brancos sobre a foto: o branco fixo garante contraste em qualquer foto e tema.
// Também usados sobre a capa do perfil.
export function CircleButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.circleButton}>
      <MaterialCommunityIcons name={icon} size={22} color="#111111" />
    </Pressable>
  );
}

function Photos({ urls, height, name }: { urls: string[]; height: number; name: string }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  return (
    <>
      <FlatList
        data={urls}
        keyExtractor={(url) => url}
        renderItem={({ item, index: i }) => (
          <VenueCover
            uri={item}
            style={{ width, height }}
            logoHeight={height * 0.45}
            accessibilityLabel={t('app_a11y_photo', { index: i + 1, total: urls.length, name })}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      />
      {urls.length > 1 ? (
        <View style={styles.counter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.counterText}>
            {index + 1} / {urls.length}
          </Text>
        </View>
      ) : null}
    </>
  );
}

/**
 * Topo das telas da quadra (informações e agenda): fotos, voltar, compartilhar e favoritar.
 * Fica atrás da folha branca, que começa em `height - 24`.
 */
export function VenueHero({ venueId, venue, height }: { venueId: number; venue: VenueDetail | undefined; height: number }) {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(venueId);

  return (
    <View style={[styles.imageBox, { height, backgroundColor: c.surface }]}>
      <StatusBar style="light" />
      {venue ? (
        venue.images.length ? (
          <Photos urls={venue.images} height={height} name={venue.name} />
        ) : (
          // Sem foto: a logo no lugar, um pouco acima do centro (a folha de baixo cobre a base).
          <VenueCover uri={null} style={[StyleSheet.absoluteFill, styles.noPhoto]} logoHeight={height * 0.4} />
        )
      ) : null}
      <View style={[styles.headerButtons, { top: insets.top + 8 }]} pointerEvents="box-none">
        <CircleButton icon="chevron-left" label={t('app_back')} onPress={() => router.back()} />
        {venue ? (
          <View style={styles.rightButtons}>
            <CircleButton
              icon="share-variant-outline"
              label={t('app_share')}
              onPress={() => Share.share({ message: t('app_share_message', { name: venue.name }) })}
            />
            <CircleButton
              icon={favorite ? 'heart' : 'heart-outline'}
              label={favorite ? t('app_unfavorite') : t('app_favorite')}
              onPress={() => toggle(venueId)}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBox: { position: 'absolute', top: 0, left: 0, right: 0 },
  noPhoto: { paddingBottom: 24 },
  headerButtons: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  rightButtons: { flexDirection: 'row', gap: 10 },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  counter: {
    position: 'absolute',
    right: 16,
    bottom: 36,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  counterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
