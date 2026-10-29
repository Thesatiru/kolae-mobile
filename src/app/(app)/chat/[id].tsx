import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
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

import type { VenueDetail } from '@/api/types';
import { getVenue } from '@/api/venues';
import { Text, useInputFont } from '@/components/Text';
import { VenueCover } from '@/components/VenueCover';
import { AUTO_REPLY_DELAY_MS, chatStore, type ChatMessage } from '@/showcase/chat';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { formatTime } from '@/utils/format';
import { mapsUrl } from '@/utils/maps';
import { showSoon } from '@/utils/soon';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

function VenueAvatar({ venue, size }: { venue: VenueDetail | undefined; size: number }) {
  return (
    <VenueCover
      uri={venue?.cover_image_url}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      logoHeight={size * 0.6}
    />
  );
}

function IconButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={styles.iconButton}>
      <MaterialCommunityIcons name={icon} size={24} color={c.text} />
    </Pressable>
  );
}

function Bubble({ message, venue, showAvatar }: { message: ChatMessage; venue: VenueDetail; showAvatar: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const mine = message.from === 'me';
  const time = formatTime(message.at);
  const author = mine ? t('app_chat_you') : venue.name;

  if (message.kind === 'location') {
    return (
      <View style={[styles.messageRow, styles.left]}>
        <View style={styles.avatarSlot} />
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t('app_a11y_message', { author, time, text: t('app_chat_location') })}
          accessibilityHint={t('app_open_maps')}
          onPress={() => Linking.openURL(mapsUrl(venue))}
          style={[styles.locationCard, { backgroundColor: c.surface }, contrastOutline(c)]}>
          <View style={[styles.locationMap, { borderColor: c.divider }]}>
            <MaterialCommunityIcons name="map-marker" size={40} color={c.primary} />
          </View>
          <View style={styles.locationFooter}>
            <Text style={[styles.locationText, { color: c.link }]}>{t('app_open_maps')}</Text>
            <Text style={[styles.time, { color: c.textMuted }]}>{time}</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={t('app_a11y_message', { author, time, text: message.text })}
      style={[styles.messageRow, mine ? styles.right : styles.left]}>
      {!mine ? <View style={styles.avatarSlot}>{showAvatar ? <VenueAvatar venue={venue} size={36} /> : null}</View> : null}
      <View
        style={[
          styles.bubble,
          mine
            ? [styles.bubbleMine, { backgroundColor: c.primary }]
            : [styles.bubbleTheirs, { backgroundColor: c.surface }, contrastOutline(c)],
        ]}>
        <Text style={[styles.messageText, { color: mine ? c.onPrimary : c.text }]}>{message.text}</Text>
        <Text style={[styles.time, { color: mine ? c.onPrimary : c.textMuted }]}>{time}</Text>
      </View>
    </View>
  );
}

// Vitrine: chat com a quadra. As mensagens ficam só no celular e a resposta é automática.
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venueId = Number(id);
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);
  const venue = useQuery({ queryKey: ['venue', venueId], queryFn: () => getVenue(venueId) }).data;
  const messages = chatStore.useValue(venueId);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);

  function send() {
    const text = draft.trim();
    if (!text || !venue) return;
    setDraft('');
    chatStore.set(venueId, (list) => [
      ...list,
      { id: `me-${Date.now()}`, from: 'me', kind: 'text', text, at: new Date().toISOString() },
    ]);

    // Resposta automática de demonstração, anunciada para quem usa leitor de tela.
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply = t('app_chat_auto_reply');
      chatStore.set(venueId, (list) => [
        ...list,
        { id: `venue-${Date.now()}`, from: 'venue', kind: 'text', text: reply, at: new Date().toISOString() },
      ]);
      setTyping(false);
      AccessibilityInfo.announceForAccessibility(`${venue.name}: ${reply}`);
    }, AUTO_REPLY_DELAY_MS);
  }

  // Lista invertida: a mensagem mais nova fica embaixo, perto do campo de escrever.
  const reversed = [...messages].reverse();
  const canSend = draft.trim().length > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.flex, { backgroundColor: c.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <IconButton icon="chevron-left" label={t('app_back')} onPress={() => router.back()} />
          <View style={styles.headerCenter}>
            <VenueAvatar venue={venue} size={72} />
            <Text accessibilityRole="header" style={[styles.venueName, { color: c.text }]} numberOfLines={1}>
              {venue?.name ?? ''}
            </Text>
          </View>
          {venue?.owner.whatsapp ? (
            <IconButton
              icon="whatsapp"
              label={t('app_chat_whatsapp')}
              onPress={() => Linking.openURL(`https://wa.me/${venue.owner.whatsapp}`)}
            />
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        <View style={[styles.notice, { backgroundColor: c.surface }, contrastOutline(c)]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={c.textMuted} />
          <Text style={[styles.noticeText, { color: c.textMuted }]}>{t('app_chat_preview_notice')}</Text>
        </View>

        {venue ? (
          <FlatList
            inverted
            data={reversed}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              // avatar só na primeira mensagem de uma sequência da quadra (a de cima)
              const previous = reversed[index + 1];
              const showAvatar = item.from === 'venue' && (!previous || previous.from !== 'venue');
              return <Bubble message={item} venue={venue} showAvatar={showAvatar} />;
            }}
            ListHeaderComponent={
              typing ? (
                <View style={[styles.messageRow, styles.left]}>
                  <View style={styles.avatarSlot} />
                  <View style={[styles.bubble, styles.bubbleTheirs, { backgroundColor: c.surface }]}>
                    <Text style={[styles.messageText, { color: c.textMuted }]}>{t('app_chat_typing')}</Text>
                  </View>
                </View>
              ) : undefined
            }
          />
        ) : (
          <View style={styles.flex} />
        )}

        <View style={[styles.composer, { borderColor: c.border, backgroundColor: c.background }]}>
          <TextInput
            accessibilityLabel={t('app_chat_ph')}
            placeholder={t('app_chat_ph')}
            placeholderTextColor={c.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            style={[styles.input, { color: c.text }, inputFont]}
          />
          <View style={styles.composerActions}>
            <IconButton icon="image-outline" label={t('app_chat_attach_photo')} onPress={showSoon} />
            <IconButton icon="microphone-outline" label={t('app_chat_voice')} onPress={showSoon} />
            <View style={styles.flex} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('app_chat_send')}
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              onPress={send}
              style={[styles.send, { backgroundColor: canSend ? c.primary : c.divider }]}>
              <MaterialCommunityIcons name="arrow-up" size={22} color={canSend ? c.onPrimary : c.textMuted} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingTop: 8 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 6 },
  venueName: { fontSize: 20, fontWeight: '600' },
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
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  left: { justifyContent: 'flex-start', paddingRight: 48 },
  right: { justifyContent: 'flex-end', paddingLeft: 64 },
  avatarSlot: { width: 36 },
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6, flexShrink: 1 },
  bubbleMine: { borderBottomRightRadius: 6 },
  bubbleTheirs: { borderBottomLeftRadius: 6 },
  messageText: { fontSize: 16 },
  time: { fontSize: 11, alignSelf: 'flex-end', marginTop: 2 },
  locationCard: { width: 240, borderRadius: 20, overflow: 'hidden' },
  locationMap: { height: 130, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1 },
  locationFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, gap: 8 },
  locationText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', flexShrink: 1 },
  composer: { marginHorizontal: 16, marginBottom: 8, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
  input: { minHeight: 40, maxHeight: 120, textAlignVertical: 'top', padding: 0 },
  composerActions: { flexDirection: 'row', alignItems: 'center' },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
