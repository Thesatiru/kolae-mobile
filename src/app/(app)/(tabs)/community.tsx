import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { PostCard } from '@/community/PostCard';
import { PreviewBanner } from '@/community/parts';
import { LogoMark } from '@/components/Logo';
import { Text } from '@/components/Text';
import { postStore } from '@/showcase/community';
import { linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

type Feed = 'forYou' | 'friends';

// Comunidade (vitrine, D04): rede social do esporte com posts de exemplo. Nada chama a API.
export default function CommunityScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const [feed, setFeed] = useState<Feed>('forYou');
  const posts = postStore.useValue(0);
  const list = feed === 'friends' ? posts.filter((p) => p.friend) : posts;

  const tabs: { key: Feed; label: string }[] = [
    { key: 'forYou', label: t('app_community_for_you') },
    { key: 'friends', label: t('app_community_friends') },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={styles.logo}>
        {/* Na cor do tema (arco-íris no Orgulho); o título da aba já diz onde a pessoa está. */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LogoMark color={c.primary} colors={c.rainbow} height={40} />
        </View>
      </View>

      <View accessibilityRole="tablist" style={[styles.tabs, { borderBottomColor: c.divider }]}>
        {tabs.map((tab) => {
          const selected = feed === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setFeed(tab.key)}
              style={styles.tab}>
              <Text style={[styles.tabText, selected ? { color: c.text, fontWeight: '700' } : { color: c.textMuted }]}>
                {tab.label}
              </Text>
              <View style={[styles.indicator, { backgroundColor: selected ? c.primary : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(p) => String(p.id)}
        ListHeaderComponent={<PreviewBanner />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => router.push({ pathname: '/post/[id]', params: { id: String(item.id) } })}
          />
        )}
        ListFooterComponent={
          feed === 'friends' ? (
            <View style={styles.end}>
              <Text style={[styles.endText, { color: c.textMuted }]}>{t('app_community_friends_end')}</Text>
              <Text
                accessibilityRole="button"
                onPress={() => setFeed('forYou')}
                style={[styles.endLink, { color: c.link }, linkDecoration(c)]}>
                {t('app_community_see_for_you')}
              </Text>
            </View>
          ) : undefined
        }
        contentContainerStyle={styles.listContent}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('app_community_write')}
        onPress={() => router.push('/post/new')}
        style={({ pressed }) => [styles.fab, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
        <MaterialCommunityIcons name="pencil-outline" size={28} color={c.onPrimary} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  logo: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 12, minHeight: 48 },
  tabText: { fontSize: 17 },
  indicator: { height: 3, width: 64, borderRadius: 2, marginTop: 10 },
  listContent: { paddingBottom: 110 }, // o último post não fica embaixo do botão de escrever
  end: { alignItems: 'center', gap: 6, paddingVertical: 28, paddingHorizontal: 24 },
  endText: { fontSize: 15, textAlign: 'center' },
  endLink: { fontSize: 16, fontWeight: '700', textDecorationLine: 'underline' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
