import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { RainbowRing } from '@/components/Rainbow';
import { Text } from '@/components/Text';
import { profileShowcase } from '@/profile/showcase';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const SOCIAL: IconName[] = ['twitter', 'instagram', 'facebook'];

function Stat({ value, label }: { value: number; label: string }) {
  const c = useColors();
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={styles.stat}>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textMuted }]}>{label}</Text>
    </View>
  );
}

// Nome e avatar são reais; PRO, redes, números e feed são vitrine (profileShowcase).
export default function ProfileScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const coverHeight = width * 0.6;
  const avatarSize = width * 0.56;

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={{ height: coverHeight, backgroundColor: c.primary }}>
        <Image source={profileShowcase.coverUrl} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        {/* Abre pelo Menu, por cima das abas: precisa do voltar. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('app_back')}
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.back, { top: insets.top + 8 }]}>
          <MaterialCommunityIcons name="chevron-left" size={32} color="#FFFFFF" style={styles.iconShadow} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('app_settings')}
          hitSlop={10}
          onPress={() => router.push('/settings')}
          style={[styles.gear, { top: insets.top + 8 }]}>
          <MaterialCommunityIcons name="cog-outline" size={28} color="#FFFFFF" style={styles.iconShadow} />
        </Pressable>
      </View>

      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('app_a11y_profile_photo', { name: user?.name ?? '' })}
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            marginTop: -avatarSize / 2,
            borderColor: c.background,
            backgroundColor: c.primary,
          },
        ]}>
        {user?.avatar_url ? (
          <Image source={user.avatar_url} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <Text style={[styles.avatarLetter, { fontSize: avatarSize * 0.4 }]}>{user?.name.charAt(0)}</Text>
        )}
        {c.rainbow ? <RainbowRing colors={c.rainbow} size={avatarSize} width={8} /> : null}
      </View>

      <View style={styles.info}>
        {profileShowcase.pro ? <Text style={styles.pro}>PRO</Text> : null}
        <Text accessibilityRole="header" style={[styles.name, { color: c.text }]}>
          {user?.name}
        </Text>
        <View style={styles.social} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {SOCIAL.map((icon) => (
            <MaterialCommunityIcons key={icon} name={icon} size={24} color={c.textMuted} />
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={profileShowcase.followers} label={t('app_profile_followers')} />
        <View style={[styles.vDivider, { backgroundColor: c.text }]} />
        <Stat value={profileShowcase.following} label={t('app_profile_following')} />
        <View style={[styles.vDivider, { backgroundColor: c.text }]} />
        <Stat value={profileShowcase.wins} label={t('app_profile_wins')} />
      </View>

      <Text accessibilityRole="header" style={[styles.feedTitle, { color: c.text }]}>{t('app_profile_feed')}</Text>
      {profileShowcase.feed.map((post) => (
        <View key={post.id} style={styles.post}>
          <Text style={[styles.postText, { color: c.text }]}>{post.text}</Text>
          <Image
            source={post.imageUrl}
            style={[styles.postImage, { backgroundColor: c.surface }]}
            contentFit="cover"
            accessible={false}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', left: 14 },
  gear: { position: 'absolute', right: 20 },
  iconShadow: { textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 4 },
  avatar: {
    alignSelf: 'center',
    borderWidth: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { color: '#FFFFFF', fontFamily: fonts.medium },
  info: { paddingHorizontal: 32, marginTop: 36 },
  pro: { color: '#F5B800', fontSize: 13, fontWeight: '800' },
  name: { fontSize: 34, fontFamily: fonts.medium, marginTop: -2 },
  social: { flexDirection: 'row', gap: 16, marginTop: 14, paddingLeft: 10 },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 36, gap: 20 },
  stat: { alignItems: 'center', minWidth: 80 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 14 },
  vDivider: { width: 1, height: 36 },
  feedTitle: { fontSize: 36, fontFamily: fonts.regular, paddingHorizontal: 28, marginTop: 44 },
  post: { paddingHorizontal: 28, marginTop: 8, gap: 12 },
  postText: { fontSize: 15, paddingHorizontal: 6 },
  postImage: { width: '100%', aspectRatio: 1.5, borderRadius: 20 },
});
