import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/Text';
import { postStore, type Post } from '@/showcase/community';
import { useColors } from '@/theme/useColors';
import { formatAgo } from '@/utils/format';
import { Avatar, OwnerBadge } from './parts';

export function toggleLike(postId: number) {
  postStore.set(0, (list) =>
    list.map((p) => (p.id === postId ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
  );
}

type Props = {
  post: Post;
  onPress?: () => void; // no feed abre o post; no detalhe não há
  large?: boolean; // texto maior no detalhe
};

// Leitor de tela: o post é lido como uma frase só, e curtir vira uma ação dele
// (o coração dentro não recebe foco separado), como no card da quadra.
export function PostCard({ post, onPress, large }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const time = formatAgo(post.at);

  const label = [
    `${post.author.name}, @${post.author.handle}, ${time}`,
    post.author.owner ? t('app_owner') : null,
    post.text,
    post.imageAlt,
    post.venue,
    t('app_community_likes', { count: post.likes }) + (post.liked ? `, ${t('app_community_liked')}` : ''),
    t('app_community_comments_count', { count: post.comments }),
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      accessible
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      accessibilityHint={onPress ? t('app_community_open_post') : undefined}
      accessibilityActions={[{ name: 'like', label: post.liked ? t('app_community_liked') : t('app_community_like') }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'like' && toggleLike(post.id)}
      onPress={onPress}
      style={({ pressed }) => [styles.post, { borderBottomColor: c.divider, opacity: pressed ? 0.85 : 1 }]}>
      <Avatar author={post.author} />
      <View style={styles.body}>
        <Text style={styles.header}>
          <Text style={[styles.name, { color: c.text }]}>{post.author.name}</Text>
          <Text style={[styles.meta, { color: c.textMuted }]}>
            {'  '}@{post.author.handle} · {time}
          </Text>
        </Text>
        {post.author.owner ? <OwnerBadge /> : null}
        {post.text ? (
          <Text style={[large ? styles.textLarge : styles.text, { color: c.text }]}>{post.text}</Text>
        ) : null}
        {post.imageUrl ? (
          <Image
            source={post.imageUrl}
            style={[styles.image, { backgroundColor: c.surface }]}
            contentFit="cover"
            accessible={false}
          />
        ) : null}
        {post.venue ? (
          <View style={[styles.venue, { backgroundColor: c.surface }]}>
            <MaterialCommunityIcons name="map-marker-outline" size={18} color={c.link} />
            <Text style={[styles.venueText, { color: c.link }]}>{post.venue}</Text>
          </View>
        ) : null}
        <View style={styles.actions}>
          <Pressable
            accessible={false}
            importantForAccessibility="no-hide-descendants"
            hitSlop={12}
            onPress={() => toggleLike(post.id)}
            style={styles.action}>
            <MaterialCommunityIcons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.liked ? c.primary : c.textMuted}
            />
            <Text style={[styles.count, post.liked ? { color: c.link, fontWeight: '700' } : { color: c.textMuted }]}>
              {post.likes}
            </Text>
          </Pressable>
          <View style={styles.action} importantForAccessibility="no-hide-descendants">
            <MaterialCommunityIcons name="comment-outline" size={22} color={c.textMuted} />
            <Text style={[styles.count, { color: c.textMuted }]}>{post.comments}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  post: { flexDirection: 'row', gap: 14, paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1 },
  body: { flex: 1, gap: 10 },
  header: { flexWrap: 'wrap' },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 14 },
  text: { fontSize: 16, lineHeight: 23 },
  textLarge: { fontSize: 18, lineHeight: 26 },
  image: { width: '100%', aspectRatio: 1.55, borderRadius: 18 },
  venue: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  venueText: { fontSize: 15, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 28, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
  count: { fontSize: 15 },
});
