import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listConversations } from '@/api/chat';
import { MOCK_CHAT } from '@/api/client';
import type { Conversation } from '@/api/types';
import { ChatAvatar } from '@/chat/parts';
import { conversationsKey, LIST_POLL_MS } from '@/chat/useChatThread';
import { PageHeader } from '@/components/PageHeader';
import { usePullToRefresh } from '@/components/PullToRefresh';
import { QueryState } from '@/components/QueryState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { formatAgo } from '@/utils/format';

// Conversas com as quadras (docs/proposta-chat.md), a mais recente primeiro. Consulta a cada
// 30 s enquanto a tela está aberta, para o número de não lidas acompanhar.
export default function MessagesScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const query = useQuery({ queryKey: conversationsKey, queryFn: listConversations, refetchInterval: LIST_POLL_MS });
  const conversations = query.data ?? [];
  const refreshControl = usePullToRefresh(query.refetch);

  return (
    <Screen contentStyle={styles.content} refreshControl={refreshControl}>
      <PageHeader title={t('app_messages_title')} />
      {MOCK_CHAT ? (
        <View style={[styles.notice, { backgroundColor: c.surface }, contrastOutline(c)]}>
          <Text style={[styles.noticeText, { color: c.textMuted }]}>{t('app_chat_preview_notice')}</Text>
        </View>
      ) : null}
      <QueryState
        loading={query.isPending}
        error={query.error}
        empty={conversations.length === 0}
        emptyText={t('app_messages_empty')}
        onRetry={query.refetch}
        minHeight={300}>
        <View style={styles.list}>
          {conversations.map((conversation) => (
            <ConversationRow key={conversation.id} conversation={conversation} />
          ))}
        </View>
      </QueryState>
    </Screen>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  const c = useColors();
  const { t } = useTranslation();
  const { venue, last_message: last, unread_count: unread, blocked } = conversation;
  const preview = last ? (last.mine ? t('app_messages_you', { text: last.body }) : last.body) : t('app_messages_no_messages');
  const when = last ? formatAgo(last.created_at) : '';
  const hasUnread = unread > 0;

  // Um elemento só no leitor de tela, com a frase completa.
  const label = [
    venue.name,
    hasUnread ? t('app_messages_unread', { count: unread }) : null,
    blocked ? t('app_messages_blocked') : null,
    preview,
    when,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(venue.id) } })}
      style={({ pressed }) => [styles.row, { backgroundColor: c.surface, opacity: pressed ? 0.6 : 1 }, contrastOutline(c)]}>
      <ChatAvatar venue={venue} size={52} />
      <View style={styles.texts}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={[styles.when, { color: hasUnread ? c.link : c.textMuted }]}>{when}</Text>
        </View>
        <View style={styles.titleRow}>
          {blocked ? (
            <MaterialCommunityIcons name="lock-outline" size={14} color={c.textMuted} />
          ) : null}
          <Text
            style={[styles.preview, { color: hasUnread ? c.text : c.textMuted, fontWeight: hasUnread ? '700' : '400' }]}
            numberOfLines={1}>
            {blocked ? t('app_messages_blocked') : preview}
          </Text>
          {hasUnread ? (
            <View style={[styles.badge, { backgroundColor: c.text }]}>
              <Text style={[styles.badgeText, { color: c.background }]}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16 },
  notice: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  noticeText: { fontSize: 13, textAlign: 'center' },
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, padding: 12 },
  texts: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flex: 1, fontSize: 16, fontWeight: '700' },
  when: { fontSize: 12 },
  preview: { flex: 1, fontSize: 14 },
  badge: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
