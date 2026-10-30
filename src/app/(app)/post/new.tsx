import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Avatar, PreviewBanner } from '@/community/parts';
import { Text, useInputFont } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { handleFor, hasLink, postStore, showcaseVenues } from '@/showcase/community';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

const MAX_LENGTH = 280;

// Novo post (vitrine): vai para o topo de "Para você" só neste celular. Posts aceitam texto e
// foto, mas não links; para indicar uma quadra existe "Marcar quadra".
export default function NewPostScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  const inputFont = useInputFont(18);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [venue, setVenue] = useState<string | null>(null);
  const [choosingVenue, setChoosingVenue] = useState(false);

  const linkError = hasLink(text);
  const canPublish = (text.trim().length > 0 || !!imageUri) && !linkError;
  const author = { name: user?.name ?? '', tone: 'primary' as const };

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  }

  function publish() {
    if (!canPublish || !user) return;
    postStore.set(0, (list) => [
      {
        id: Date.now(),
        author: { ...author, handle: handleFor(user.name) },
        text: text.trim(),
        at: new Date().toISOString(),
        imageUrl: imageUri ?? undefined,
        imageAlt: imageUri ? t('app_community_photo_attached') : undefined,
        venue: venue ?? undefined,
        likes: 0,
        liked: false,
        comments: 0,
        friend: false,
      },
      ...list,
    ]);
    AccessibilityInfo.announceForAccessibility(t('app_community_posted'));
    router.back();
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.divider }]}>
        <Text accessibilityRole="button" onPress={() => router.back()} suppressHighlighting style={[styles.cancel, { color: c.text }]}>
          {t('app_cancel')}
        </Text>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t('app_community_new_post')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canPublish }}
          disabled={!canPublish}
          onPress={publish}
          style={[styles.publish, { backgroundColor: c.primary, opacity: canPublish ? 1 : 0.4 }]}>
          <Text style={[styles.publishText, { color: c.onPrimary }]}>{t('app_community_publish')}</Text>
        </Pressable>
      </View>

      <PreviewBanner />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.row}>
            <Avatar author={author} />
            <View style={styles.flex}>
              <Text style={[styles.name, { color: c.text }]}>{user?.name}</Text>
              <TextInput
                accessibilityLabel={t('app_community_post_ph')}
                placeholder={t('app_community_post_ph')}
                placeholderTextColor={c.textMuted}
                value={text}
                onChangeText={setText}
                multiline
                autoFocus
                maxLength={MAX_LENGTH}
                style={[styles.input, { color: c.text }, inputFont]}
              />
            </View>
          </View>

          {imageUri ? (
            <View style={styles.photo}>
              <Image source={imageUri} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('app_community_remove_photo')}
                hitSlop={8}
                onPress={() => setImageUri(null)}
                style={styles.removePhoto}>
                <MaterialCommunityIcons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : null}

          {venue ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${venue}, ${t('app_community_untag_venue')}`}
              onPress={() => setVenue(null)}
              style={[styles.venue, { backgroundColor: c.surface }]}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={c.link} />
              <Text style={[styles.venueText, { color: c.link }]}>{venue}</Text>
              <MaterialCommunityIcons name="close" size={16} color={c.link} />
            </Pressable>
          ) : null}

          {linkError ? (
            <View accessibilityLiveRegion="polite" style={[styles.error, { borderColor: c.danger, backgroundColor: c.surface }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={22} color={c.danger} />
              <Text style={[styles.errorText, { color: c.text }]}>
                <Text style={{ color: c.danger, fontWeight: '700' }}>{t('app_community_links_title')} </Text>
                {t('app_community_links_text', { tag: t('app_community_tag_venue') })}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.toolbar, { borderTopColor: c.divider }]}>
          <View style={styles.tools}>
            <ToolButton icon="image-outline" label={t('app_community_photo')} onPress={pickPhoto} />
            <ToolButton icon="map-marker-outline" label={t('app_community_tag_venue')} onPress={() => setChoosingVenue(true)} />
            <Text
              accessibilityLabel={`${text.length} / ${MAX_LENGTH}`}
              style={[styles.counter, { color: text.length >= MAX_LENGTH ? c.danger : c.textMuted }]}>
              {text.length} / {MAX_LENGTH}
            </Text>
          </View>
          <View style={styles.rules}>
            <MaterialCommunityIcons name="shield-outline" size={16} color={c.textMuted} />
            <Text style={[styles.rulesText, { color: c.textMuted }]}>{t('app_community_rules')}</Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={choosingVenue}
        transparent
        animationType={motionReduced ? 'none' : 'fade'}
        onRequestClose={() => setChoosingVenue(false)}>
        <Pressable accessible={false} style={styles.backdrop} onPress={() => setChoosingVenue(false)}>
          <View style={[styles.sheet, { backgroundColor: c.background }, contrastOutline(c)]}>
            <Text accessibilityRole="header" style={[styles.sheetTitle, { color: c.text }]}>
              {t('app_community_choose_venue')}
            </Text>
            {showcaseVenues.map((name, i) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                onPress={() => {
                  setVenue(name);
                  setChoosingVenue(false);
                }}
                style={[styles.venueRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.divider }]}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={c.primary} />
                <Text style={{ color: c.text, fontSize: 16 }}>{name}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function ToolButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tool, { borderColor: c.border, opacity: pressed ? 0.6 : 1 }]}>
      <MaterialCommunityIcons name={icon} size={20} color={c.text} />
      <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cancel: { fontSize: 16, padding: 8, margin: -8 },
  title: { fontSize: 19, fontWeight: '700' },
  publish: { borderRadius: 22, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  publishText: { fontSize: 16, fontWeight: '700' },
  body: { padding: 18, gap: 16 },
  row: { flexDirection: 'row', gap: 14 },
  name: { fontSize: 15, fontWeight: '700' },
  input: { minHeight: 90, textAlignVertical: 'top', paddingTop: 4 },
  photo: { width: 180, height: 140, borderRadius: 16, overflow: 'hidden', marginLeft: 58 },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  venue: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 58,
  },
  venueText: { fontSize: 15, fontWeight: '600' },
  error: { flexDirection: 'row', gap: 10, borderWidth: 1.5, borderRadius: 16, padding: 14 },
  errorText: { flex: 1, fontSize: 15, lineHeight: 22 },
  toolbar: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 46,
  },
  counter: { marginLeft: 'auto', fontSize: 14 },
  rules: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  rulesText: { flex: 1, fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
  sheet: { borderRadius: 22, paddingVertical: 8 },
  sheetTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 20, paddingVertical: 12 },
  venueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, minHeight: 52 },
});
