import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { ChatMessage, ChatVenue } from '@/api/types';
import { Text } from '@/components/Text';
import { VenueCover } from '@/components/VenueCover';
import { contrastOutline, primaryForText } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { formatTime } from '@/utils/format';
import type { Outgoing } from './useChatThread';

/** Foto da quadra redonda (sem foto, o K padrão). */
export function ChatAvatar({ venue, size }: { venue: Pick<ChatVenue, 'cover_image_url'> | undefined; size: number }) {
  return (
    <VenueCover
      uri={venue?.cover_image_url}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      logoHeight={size * 0.6}
    />
  );
}

/** Balão de uma mensagem que já está na API. Um elemento só no leitor de tela. */
export function MessageBubble({
  message,
  venue,
  showAvatar,
}: {
  message: ChatMessage;
  venue: ChatVenue;
  showAvatar: boolean;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const mine = message.mine;
  const time = formatTime(message.created_at);
  const author = mine ? t('app_chat_you') : venue.name;
  const solid = primaryForText(c);

  return (
    <View
      accessible
      accessibilityLabel={t('app_a11y_message', { author, time, text: message.body })}
      style={[styles.row, mine ? styles.right : styles.left]}>
      {!mine ? <View style={styles.avatarSlot}>{showAvatar ? <ChatAvatar venue={venue} size={32} /> : null}</View> : null}
      <View
        style={[
          styles.bubble,
          mine
            ? [styles.bubbleMine, { backgroundColor: solid.background }]
            : [styles.bubbleTheirs, { backgroundColor: c.surface }, contrastOutline(c)],
        ]}>
        <Text style={[styles.body, { color: mine ? solid.text : c.text }]}>{message.body}</Text>
        <Text style={[styles.time, { color: mine ? solid.text : c.textMuted }]}>{time}</Text>
      </View>
    </View>
  );
}

/** Mensagem que ainda não chegou à API: "enviando" ou "não enviada" (tocar abre as opções). */
export function OutgoingBubble({ item, onPress }: { item: Outgoing; onPress: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  const solid = primaryForText(c);
  const failed = item.status === 'failed';
  const statusText = failed ? t('app_chat_failed') : t('app_chat_sending');

  return (
    <Pressable
      accessibilityRole={failed ? 'button' : undefined}
      accessibilityLabel={t('app_a11y_message_out', { text: item.body, status: statusText })}
      accessibilityHint={failed ? t('app_chat_failed_hint') : undefined}
      disabled={!failed}
      onPress={onPress}
      style={[styles.row, styles.right, styles.outgoing]}>
      <View style={[styles.bubble, styles.bubbleMine, { backgroundColor: solid.background, opacity: failed ? 1 : 0.7 }]}>
        <Text style={[styles.body, { color: solid.text }]}>{item.body}</Text>
      </View>
      <View style={styles.statusRow}>
        <MaterialCommunityIcons
          name={failed ? 'alert-circle-outline' : 'clock-outline'}
          size={14}
          color={failed ? c.danger : c.textMuted}
        />
        <Text style={[styles.status, { color: failed ? c.danger : c.textMuted }]}>
          {failed ? `${statusText} ${t('app_chat_failed_tap')}` : statusText}
        </Text>
      </View>
    </Pressable>
  );
}

/** "Hoje", "Ontem", "12 de novembro" entre as mensagens. */
export function DaySeparator({ label }: { label: string }) {
  const c = useColors();
  return (
    <View style={styles.day} accessibilityRole="header">
      <Text style={[styles.dayText, { color: c.textMuted, backgroundColor: c.surface }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  left: { justifyContent: 'flex-start', paddingRight: 48 },
  right: { justifyContent: 'flex-end', paddingLeft: 64 },
  outgoing: { flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  avatarSlot: { width: 32 },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6, flexShrink: 1 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6 },
  body: { fontSize: 16, lineHeight: 22 },
  time: { fontSize: 11, alignSelf: 'flex-end', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  status: { fontSize: 12 },
  day: { alignItems: 'center', paddingVertical: 6 },
  dayText: { fontSize: 12, fontWeight: '600', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' },
});
