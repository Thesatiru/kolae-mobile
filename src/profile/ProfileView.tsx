import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { PostCard } from '@/community/PostCard';
import { Avatar, PreviewBanner } from '@/community/parts';
import { LogoMark } from '@/components/Logo';
import { RainbowRing } from '@/components/Rainbow';
import { Text } from '@/components/Text';
import { UserAvatar } from '@/components/UserAvatar';
import { VenueCover } from '@/components/VenueCover';
import { CircleButton } from '@/components/VenueHero';
import { coverStore, followStore, handleFor, postStore, type Author } from '@/showcase/community';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { showSoon } from '@/utils/soon';
import { CoverPattern } from './CoverPattern';

type Props = { author?: Author }; // sem author = o próprio perfil
type Tab = 'posts' | 'photos';

// Perfil (rework de 30/10). Nome e foto da própria pessoa são reais (API); capa, seguidores,
// vitórias, posts e fotos são vitrine e saem da Comunidade: sem posts, o perfil fica vazio.
export function ProfileView({ author }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('posts');

  const me = !author;
  const name = author?.name ?? user?.name ?? '';
  const handle = author?.handle ?? handleFor(name);
  const posts = postStore.useValue(0).filter((p) => p.author.handle === handle);
  const photos = posts.filter((p) => p.imageUrl);
  const followed = followStore.useValue(0);
  const following = followed.includes(handle);
  const cover = coverStore.useValue(0);

  const stats = [
    { value: me ? 0 : following ? 1 : 0, label: t('app_profile_followers') },
    { value: me ? followed.length : 0, label: t('app_profile_following') },
    { value: 0, label: t('app_profile_wins') },
  ];
  const coverHeight = width * 0.44;
  const avatarSize = width * 0.36;
  const cell = (width - 4) / 3;


  function toggleFollow() {
    followStore.set(0, (list) => (list.includes(handle) ? list.filter((h) => h !== handle) : [...list, handle]));
  }

  const share = () => Share.share({ message: t('app_profile_share_message', { name, handle }) });
  const openPost = (id: number) => router.push({ pathname: '/post/[id]', params: { id: String(id) } });

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}>
      {/* Capa: a foto escolhida (só no celular, vitrine) ou o padrão com o K do Kolae. */}
      <View style={{ height: coverHeight }}>
        {me && cover ? (
          <Image source={cover} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        ) : (
          <CoverPattern width={width} height={coverHeight} />
        )}
        <View style={[styles.coverButtons, { top: insets.top + 8 }]} pointerEvents="box-none">
          <CircleButton icon="chevron-left" label={t('app_back')} onPress={() => router.back()} />
          {me ? (
            <View style={styles.rightButtons}>
              <CircleButton icon="pencil-outline" label={t('app_edit_profile')} onPress={() => router.push('/profile/edit')} />
              <CircleButton icon="cog-outline" label={t('app_settings')} onPress={() => router.push('/settings')} />
            </View>
          ) : (
            <CircleButton icon="share-variant-outline" label={t('app_share')} onPress={share} />
          )}
        </View>
      </View>

      {/* Foto e capa se trocam em Editar perfil (o lápis do topo). */}
      <View style={[styles.avatarWrap, { width: avatarSize, height: avatarSize, marginTop: -avatarSize / 2 }]}>
        {me ? (
          <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor: c.background }]}>
            <UserAvatar user={user} size={avatarSize} />
            {c.rainbow ? <RainbowRing colors={c.rainbow} size={avatarSize} width={6} /> : null}
          </View>
        ) : (
          <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, borderColor: c.background }]}>
            <Avatar author={author} size={avatarSize} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text accessibilityRole="header" style={[styles.name, { color: c.text }]}>
          {name}
        </Text>
        <Text style={[styles.handle, { color: c.textMuted }]}>@{handle}</Text>
        {author?.bio ? <Text style={[styles.bio, { color: c.text }]}>{author.bio}</Text> : null}
        <Text accessible style={[styles.stats, { color: c.textMuted }]}>
          {stats.map((s, i) => (
            <Text key={s.label}>
              {i > 0 ? ' · ' : ''}
              <Text style={{ color: c.text, fontWeight: '700' }}>{s.value}</Text> {s.label}
            </Text>
          ))}
        </Text>
      </View>

      {me ? null : (
        <View style={styles.actions}>
          <PillButton
            label={following ? t('app_profile_following_btn') : t('app_profile_follow')}
            filled={!following}
            selected={following}
            onPress={toggleFollow}
          />
          <PillButton label={t('app_profile_message')} onPress={showSoon} />
        </View>
      )}

      <View accessibilityRole="tablist" style={[styles.tabs, { borderBottomColor: c.divider }]}>
        {(['posts', 'photos'] as Tab[]).map((key) => {
          const selected = tab === key;
          return (
            <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setTab(key)} style={styles.tab}>
              <Text style={[styles.tabText, selected ? { color: c.text, fontWeight: '700' } : { color: c.textMuted }]}>
                {key === 'posts' ? t('app_profile_posts') : t('app_profile_photos')}
              </Text>
              <View style={[styles.indicator, { backgroundColor: selected ? c.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>
      <PreviewBanner text={t('app_profile_preview')} />

      {tab === 'posts' ? (
        posts.length ? (
          posts.map((post) => <PostCard key={post.id} post={post} onPress={() => openPost(post.id)} />)
        ) : (
          <Empty text={t('app_profile_empty')} />
        )
      ) : photos.length ? (
        <View style={styles.grid}>
          {photos.map((post) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={post.imageAlt ?? t('app_community_photo')}
              accessibilityHint={t('app_community_open_post')}
              onPress={() => openPost(post.id)}>
              {/* Foto que não carrega vira o K, como a quadra sem foto. */}
              <VenueCover uri={post.imageUrl} style={{ width: cell, height: cell }} logoHeight={cell * 0.45} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Empty text={me ? t('app_profile_no_photos_me') : t('app_profile_empty')} />
      )}
    </ScrollView>
  );
}

function PillButton({
  label,
  onPress,
  filled,
  selected,
}: {
  label: string;
  onPress: () => void;
  filled?: boolean;
  selected?: boolean;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={selected !== undefined ? { selected } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        filled ? { backgroundColor: c.primary } : { borderWidth: 1.5, borderColor: c.border },
        { opacity: pressed ? 0.8 : 1 },
      ]}>
      <Text style={[styles.pillText, { color: filled ? c.onPrimary : c.text }]}>{label}</Text>
    </Pressable>
  );
}

function Empty({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={[styles.empty, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LogoMark color={c.scheme === 'dark' ? c.text : c.border} colors={c.rainbow} height={56} />
      </View>
      <Text style={[styles.emptyText, { color: c.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  coverButtons: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  rightButtons: { flexDirection: 'row', gap: 10 },
  avatarWrap: { alignSelf: 'center' },
  avatar: { borderWidth: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  info: { alignItems: 'center', paddingHorizontal: 24, marginTop: 14, gap: 6 },
  name: { fontSize: 30, fontFamily: fonts.medium, textAlign: 'center' },
  handle: { fontSize: 16 },
  bio: { fontSize: 16, textAlign: 'center' },
  stats: { fontSize: 15, textAlign: 'center', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 18 },
  pill: { flex: 1, minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  pillText: { fontSize: 16, fontWeight: '700' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: 16 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12, minHeight: 48 },
  tabText: { fontSize: 17 },
  indicator: { height: 3, width: 64, borderRadius: 2, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  empty: { alignItems: 'center', gap: 12, margin: 20, borderRadius: 20, paddingVertical: 32, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});
