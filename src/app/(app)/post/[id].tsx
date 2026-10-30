import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { PostCard } from '@/community/PostCard';
import { Avatar, PreviewBanner } from '@/community/parts';
import { useOpenProfile } from '@/community/useOpenProfile';
import { PageHeader } from '@/components/PageHeader';
import { Text, useInputFont } from '@/components/Text';
import { commentStore, handleFor, hasLink, postStore, type Comment } from '@/showcase/community';
import { useColors } from '@/theme/useColors';
import { formatAgo } from '@/utils/format';

const FIRST_COMMENTS = 3;

// Post com os comentários (vitrine). Respostas são só de texto: sem fotos e sem links.
export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = Number(id);
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const inputFont = useInputFont(16);
  const post = postStore.useValue(0).find((p) => p.id === postId);
  const comments = commentStore.useValue(postId);
  const [showAll, setShowAll] = useState(false);
  const [reply, setReply] = useState('');

  const linkError = hasLink(reply);
  const visible = showAll ? comments : comments.slice(0, FIRST_COMMENTS);
  const hidden = comments.length - visible.length;
  const me = { name: user?.name ?? '', tone: 'primary' as const };

  function send() {
    const text = reply.trim();
    if (!text || linkError || !user) return;
    commentStore.set(postId, (list) => [
      ...list,
      {
        id: `mine-${Date.now()}`,
        author: { ...me, handle: handleFor(user.name) },
        text,
        at: new Date().toISOString(),
        likes: 0,
        liked: false,
      },
    ]);
    postStore.set(0, (list) => list.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
    setReply('');
    setShowAll(true); // a resposta nova fica à vista, no fim da lista
  }

  function toggleCommentLike(commentId: string) {
    commentStore.set(postId, (list) =>
      list.map((cm) => (cm.id === commentId ? { ...cm, liked: !cm.liked, likes: cm.likes + (cm.liked ? -1 : 1) } : cm)),
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.divider }]}>
        <PageHeader title={t('app_community_post_title')} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <PreviewBanner />
          {post ? <PostCard post={post} large /> : null}

          <Text accessibilityRole="header" style={[styles.commentsTitle, { color: c.text }]}>
            {t('app_community_comments')}
            <Text style={{ color: c.textMuted, fontWeight: '400' }}> · {comments.length}</Text>
          </Text>

          {visible.map((comment) => (
            <CommentRow key={comment.id} comment={comment} onLike={() => toggleCommentLike(comment.id)} />
          ))}

          {hidden > 0 ? (
            <Text accessibilityRole="button" onPress={() => setShowAll(true)} style={[styles.more, { color: c.link }]}>
              {t('app_community_more_comments', { count: hidden })}
            </Text>
          ) : null}
        </ScrollView>

        <View style={[styles.composer, { borderTopColor: c.divider }]}>
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.rules, { color: linkError ? c.danger : c.textMuted }]}>
            {linkError ? t('app_community_reply_links') : t('app_community_reply_rules')}
          </Text>
          <View style={styles.replyRow}>
            <Avatar author={me} size={40} />
            <TextInput
              accessibilityLabel={t('app_community_reply_ph')}
              placeholder={t('app_community_reply_ph')}
              placeholderTextColor={c.textMuted}
              value={reply}
              onChangeText={setReply}
              maxLength={280}
              returnKeyType="send"
              onSubmitEditing={send}
              style={[styles.replyInput, { color: c.text, borderColor: linkError ? c.danger : c.border }, inputFont]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('app_community_send')}
              accessibilityState={{ disabled: !reply.trim() || linkError }}
              disabled={!reply.trim() || linkError}
              onPress={send}
              style={[styles.send, { backgroundColor: c.primary, opacity: !reply.trim() || linkError ? 0.4 : 1 }]}>
              <MaterialCommunityIcons name="arrow-right" size={24} color={c.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CommentRow({ comment, onLike }: { comment: Comment; onLike: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  const time = formatAgo(comment.at);
  const openProfile = useOpenProfile();
  return (
    <View style={styles.comment}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('app_a11y_open_profile', { name: comment.author.name })}
        hitSlop={6}
        onPress={() => openProfile(comment.author.handle)}>
        <Avatar author={comment.author} size={38} />
      </Pressable>
      <View accessible accessibilityLabel={`${comment.author.name}, ${time}: ${comment.text}`} style={styles.flex}>
        <Text>
          <Text style={[styles.commentName, { color: c.text }]}>{comment.author.name}</Text>
          <Text style={{ color: c.textMuted, fontSize: 14 }}> · {time}</Text>
        </Text>
        <Text style={[styles.commentText, { color: c.text }]}>{comment.text}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${comment.liked ? t('app_community_liked') : t('app_community_like')}, ${t('app_community_likes', { count: comment.likes })}`}
        accessibilityState={{ selected: comment.liked }}
        hitSlop={10}
        onPress={onLike}
        style={styles.commentLike}>
        <MaterialCommunityIcons
          name={comment.liked ? 'heart' : 'heart-outline'}
          size={20}
          color={comment.liked ? c.primary : c.textMuted}
        />
        <Text style={{ color: comment.liked ? c.link : c.textMuted, fontSize: 13 }}>{comment.likes}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 12, paddingBottom: 6, borderBottomWidth: 1 },
  content: { paddingBottom: 24 },
  commentsTitle: { fontSize: 18, fontWeight: '700', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 6 },
  comment: { flexDirection: 'row', gap: 12, paddingHorizontal: 18, paddingVertical: 10 },
  commentName: { fontSize: 15, fontWeight: '700' },
  commentText: { fontSize: 15, lineHeight: 22, marginTop: 2 },
  commentLike: { alignItems: 'center', gap: 2, minWidth: 32, paddingTop: 4 },
  more: { fontSize: 16, fontWeight: '600', paddingHorizontal: 18, paddingVertical: 12 },
  composer: { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 10, gap: 8 },
  rules: { fontSize: 13, textAlign: 'center' },
  replyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  replyInput: { flex: 1, borderWidth: 1.5, borderRadius: 26, paddingHorizontal: 18, minHeight: 50 },
  send: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
});
