import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  type AlertButton,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { openConversation } from '@/api/chat';
import { MOCK_CHAT } from '@/api/client';
import { toApiError } from '@/api/errors';
import type { ChatMessage, ChatVenue } from '@/api/types';
import { getVenue } from '@/api/venues';
import { ChatAvatar, DaySeparator, MessageBubble, OutgoingBubble } from '@/chat/parts';
import { BODY_MAX, conversationKey, useChatThread, type Outgoing } from '@/chat/useChatThread';
import { LogoMark } from '@/components/Logo';
import { QueryState } from '@/components/QueryState';
import { Text, useInputFont } from '@/components/Text';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { formatMessageDay } from '@/utils/format';
import { hasLink } from '@/utils/links';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type Row =
  | { type: 'day'; key: string; label: string }
  | { type: 'message'; key: string; message: ChatMessage; showAvatar: boolean }
  | { type: 'outgoing'; key: string; item: Outgoing };

const COUNTER_FROM = BODY_MAX - 100; // o contador aparece perto do limite

function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={styles.iconButton}>
      <MaterialCommunityIcons name={icon} size={24} color={c.text} />
    </Pressable>
  );
}

/** Mensagens em ordem, com o dia entre elas; a foto da quadra só na última de cada sequência. */
function buildRows(messages: ChatMessage[], outbox: Outgoing[]): Row[] {
  const rows: Row[] = [];
  let lastDay = '';
  messages.forEach((message, i) => {
    const day = new Date(message.created_at).toDateString();
    if (day !== lastDay) {
      rows.push({ type: 'day', key: `day-${day}`, label: formatMessageDay(message.created_at) });
      lastDay = day;
    }
    const next = messages[i + 1];
    const showAvatar = !message.mine && (!next || next.mine || new Date(next.created_at).toDateString() !== day);
    rows.push({ type: 'message', key: `m-${message.id}`, message, showAvatar });
  });
  for (const item of outbox) rows.push({ type: 'outgoing', key: item.localId, item });
  return rows;
}

// Chat com o responsável pela quadra (docs/proposta-chat.md). O id da rota é o da QUADRA: a
// conversa é aberta (ou reaproveitada) pela API. O responsável responde pelo painel do site.
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venueId = Number(id);
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);

  const conversationQuery = useQuery({
    queryKey: conversationKey(venueId),
    queryFn: () => openConversation(venueId),
    staleTime: Infinity, // a conversa não muda; o que muda (mensagens) tem o seu polling
    retry: (count, err) => toApiError(err).status >= 500 && count < 1, // 404/422 não adiantam repetir
  });
  const conversation = conversationQuery.data;
  // O WhatsApp do responsável (D24) vem do detalhe da quadra, que normalmente já está no cache.
  const venueDetail = useQuery({ queryKey: ['venue', venueId], queryFn: () => getVenue(venueId) }).data;
  const venue: ChatVenue | undefined = conversation?.venue;
  const whatsapp = venueDetail?.owner.whatsapp;

  const [draft, setDraft] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const thread = useChatThread(conversation, {
    venueName: venue?.name ?? '',
    onRejected: (body, error) => {
      setDraft((current) => current || body); // devolve o texto para corrigir
      setFieldError(error.field('body') ?? error.message);
    },
  });

  function send() {
    const body = draft.trim();
    if (!body) return;
    // A API recusa links (mesma regra da Comunidade): avisa antes de enviar.
    if (hasLink(body)) {
      setFieldError(t('app_chat_no_links'));
      return;
    }
    setFieldError(null);
    setDraft('');
    thread.send(body);
  }

  function onFailedPress(item: Outgoing) {
    const buttons: AlertButton[] = [
      { text: t('app_cancel'), style: 'cancel' },
      { text: t('app_chat_discard'), style: 'destructive', onPress: () => thread.discard(item.localId) },
    ];
    // Bloqueada ou quadra desativada: reenviar não adianta, só apagar.
    if (!thread.closed) buttons.push({ text: t('app_retry'), onPress: () => thread.retry(item.localId) });
    Alert.alert(t('app_chat_failed'), item.error, buttons);
  }

  const ownVenue = toApiError(conversationQuery.error).code === 'CHAT_OWN_VENUE';
  const rows = buildRows(thread.messages, thread.outbox);
  const reversed = [...rows].reverse(); // lista invertida: a mais nova embaixo, perto do campo
  const canSend = draft.trim().length > 0;
  const nearLimit = draft.length >= COUNTER_FROM;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.flex, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <IconButton icon="chevron-left" label={t('app_back')} onPress={() => router.back()} />
          <View style={styles.headerCenter}>
            <ChatAvatar venue={venue ?? venueDetail} size={56} />
            <Text accessibilityRole="header" style={[styles.venueName, { color: c.text }]} numberOfLines={1}>
              {venue?.name ?? venueDetail?.name ?? ''}
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={1}>
              {t('app_chat_subtitle')}
            </Text>
          </View>
          {whatsapp ? (
            <IconButton icon="whatsapp" label={t('app_chat_whatsapp')} onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)} />
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        {MOCK_CHAT ? (
          // Mock ligado = a conversa não chega à quadra: aviso de Prévia (D04), como nas outras vitrines.
          <View style={[styles.notice, { backgroundColor: c.surface }, contrastOutline(c)]}>
            <MaterialCommunityIcons name="information-outline" size={18} color={c.textMuted} accessibilityElementsHidden importantForAccessibility="no" />
            <Text style={[styles.noticeText, { color: c.textMuted }]}>{t('app_chat_preview_notice')}</Text>
          </View>
        ) : null}

        {ownVenue ? (
          <CenterMessage icon="storefront-outline" title={t('app_chat_own_title')} text={t('app_chat_own_text')} />
        ) : (
          <View style={styles.flex}>
            <QueryState
              loading={conversationQuery.isPending || thread.loading}
              error={conversationQuery.error ?? thread.error}
              empty={false}
              emptyText=""
              onRetry={() => (conversationQuery.error ? conversationQuery.refetch() : thread.refetch())}
              errorVariant="screen"
              minHeight={240}>
              {venue && rows.length === 0 ? (
                <CenterMessage title={t('app_chat_empty_title')} text={t('app_chat_empty_text', { venue: venue.name })} />
              ) : venue ? (
                <FlatList
                  inverted
                  data={reversed}
                  keyExtractor={(row) => row.key}
                  contentContainerStyle={styles.list}
                  keyboardShouldPersistTaps="handled"
                  onEndReached={thread.loadOlder} // invertida: o "fim" é o topo, as mais antigas
                  onEndReachedThreshold={0.3}
                  ListFooterComponent={
                    thread.loadingOlder ? <ActivityIndicator color={c.primary} accessibilityLabel={t('app_loading')} /> : undefined
                  }
                  renderItem={({ item: row }) =>
                    row.type === 'day' ? (
                      <DaySeparator label={row.label} />
                    ) : row.type === 'message' ? (
                      <MessageBubble message={row.message} venue={venue} showAvatar={row.showAvatar} />
                    ) : (
                      <OutgoingBubble item={row.item} onPress={() => onFailedPress(row.item)} />
                    )
                  }
                />
              ) : null}
            </QueryState>
          </View>
        )}

        {ownVenue || !conversation ? null : thread.closed ? (
          <View
            accessibilityLiveRegion="polite"
            style={[styles.closed, { backgroundColor: c.surface }, contrastOutline(c)]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={c.textMuted} accessibilityElementsHidden importantForAccessibility="no" />
            <Text style={[styles.closedText, { color: c.text }]}>
              {t(thread.closed === 'blocked' ? 'app_chat_blocked' : 'app_chat_unavailable')}
            </Text>
          </View>
        ) : (
          <View style={styles.composerWrap}>
            <View
              style={[
                styles.composer,
                { borderColor: fieldError ? c.danger : c.border, backgroundColor: c.background },
                c.highContrast && styles.composerContrast,
              ]}>
              <TextInput
                accessibilityLabel={t('app_chat_ph')}
                placeholder={t('app_chat_ph')}
                placeholderTextColor={c.textMuted}
                value={draft}
                onChangeText={(text) => {
                  setDraft(text);
                  if (fieldError) setFieldError(null);
                }}
                maxLength={BODY_MAX}
                multiline
                style={[styles.input, { color: c.text }, inputFont]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('app_chat_send')}
                accessibilityState={{ disabled: !canSend }}
                disabled={!canSend}
                hitSlop={6}
                onPress={send}
                style={[styles.send, { backgroundColor: canSend ? c.primary : c.divider }]}>
                <MaterialCommunityIcons name="arrow-up" size={22} color={canSend ? c.onPrimary : c.textMuted} />
              </Pressable>
            </View>
            {fieldError || nearLimit ? (
              <View style={styles.composerInfo}>
                <Text accessibilityLiveRegion="polite" style={[styles.fieldError, { color: c.danger }]}>
                  {fieldError ?? ''}
                </Text>
                {nearLimit ? (
                  <Text style={[styles.counter, { color: c.textMuted }]}>
                    {t('app_chat_counter', { count: draft.length, max: BODY_MAX })}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CenterMessage({ icon, title, text }: { icon?: IconName; title: string; text: string }) {
  const c = useColors();
  return (
    <View style={styles.center}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {icon ? (
          <MaterialCommunityIcons name={icon} size={44} color={c.textMuted} />
        ) : (
          <LogoMark color={c.scheme === 'dark' ? c.textMuted : c.border} colors={c.rainbow} height={44} />
        )}
      </View>
      <Text accessibilityRole="header" style={[styles.centerTitle, { color: c.text }]}>
        {title}
      </Text>
      <Text style={[styles.centerText, { color: c.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingTop: 8 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 4 },
  venueName: { fontSize: 20, fontWeight: '600' },
  subtitle: { fontSize: 13 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  noticeText: { flex: 1, fontSize: 13 },
  list: { paddingHorizontal: 12, paddingVertical: 16, gap: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  centerTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  centerText: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  closed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
  },
  closedText: { flex: 1, fontSize: 14, lineHeight: 20 },
  composerWrap: { marginHorizontal: 16, marginBottom: 8, gap: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  composerContrast: { borderWidth: 2 },
  input: { flex: 1, minHeight: 40, maxHeight: 120, paddingVertical: 8, textAlignVertical: 'center' },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  composerInfo: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingHorizontal: 8 },
  fieldError: { flex: 1, fontSize: 13 },
  counter: { fontSize: 12 },
});
