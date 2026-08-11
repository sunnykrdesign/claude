/**
 * Connections — a term's neighbourhood.
 *
 * The cross-links are the real value of a dictionary like this, so they get
 * their own view: what this term points at, what points back at it, and what
 * sits beside it in the same category.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { SectionList, View } from 'react-native';

import { AppText } from '../components/AppText';
import { EmptyState } from '../components/EmptyState';
import { Divider, Screen, ScreenHeader } from '../components/Screen';
import { TermRow } from '../components/TermRow';
import type { RootStackParamList } from '../navigation/types';
import { useLibrary } from '../store/library';
import { useTheme } from '../theme/useTheme';
import type { TermSummary } from '../types/term';

type Props = NativeStackScreenProps<RootStackParamList, 'Connections'>;

/**
 * Splits a term's neighbours into outbound links, inbound links and category
 * siblings, with each term appearing in only the strongest section it belongs to.
 */
export function buildConnections(index: TermSummary[], termId: string) {
  const byId = new Map(index.map((term) => [term.id, term]));
  const subject = byId.get(termId);
  if (!subject) return null;

  const outbound = subject.relatedIds
    .map((id) => byId.get(id))
    .filter((term): term is TermSummary => term != null);

  const outboundIds = new Set(outbound.map((term) => term.id));

  const inbound = index.filter(
    (term) =>
      term.id !== termId && term.relatedIds.includes(termId) && !outboundIds.has(term.id),
  );

  const claimed = new Set([termId, ...outboundIds, ...inbound.map((term) => term.id)]);
  const categories = new Set(subject.categories);

  const siblings = index.filter(
    (term) => !claimed.has(term.id) && term.categories.some((category) => categories.has(category)),
  );

  return { subject, outbound, inbound, siblings };
}

export function ConnectionsScreen({ route, navigation }: Props) {
  const { termId } = route.params;
  const { space } = useTheme();
  const index = useLibrary((state) => state.index);

  const connections = useMemo(() => buildConnections(index, termId), [index, termId]);

  if (!connections) {
    return (
      <Screen edges={['left', 'right']}>
        <EmptyState
          title="That term is not here"
          action={{ label: 'Go back', onPress: () => navigation.goBack() }}
        />
      </Screen>
    );
  }

  const { subject, outbound, inbound, siblings } = connections;

  const sections = [
    {
      title: 'Links to',
      caption: `Terms ${subject.term} points at`,
      data: outbound,
    },
    {
      title: 'Linked from',
      caption: `Terms that point back at ${subject.term}`,
      data: inbound,
    },
    {
      title: 'Nearby',
      // Capped: the point is the neighbourhood, not the whole category.
      caption: 'Same category, not directly linked',
      data: siblings.slice(0, 12),
    },
  ].filter((section) => section.data.length > 0);

  const degree = outbound.length + inbound.length;

  return (
    <Screen edges={['left', 'right']}>
      <ScreenHeader
        title={subject.term}
        subtitle={`${degree} direct ${degree === 1 ? 'connection' : 'connections'}`}
      />

      <SectionList
        sections={sections}
        keyExtractor={(term) => term.id}
        stickySectionHeadersEnabled={false}
        renderItem={({ item }) => (
          <TermRow
            term={item}
            onPress={(id) => navigation.replace('Term', { termId: id })}
            showCategory={false}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingTop: space.lg,
              paddingBottom: space.xs,
              gap: space.xxs,
            }}
          >
            <AppText variant="label" tone="faint" accessibilityRole="header">
              {section.title}
            </AppText>
            <AppText variant="caption" tone="faint">
              {section.caption}
            </AppText>
          </View>
        )}
        ItemSeparatorComponent={() => <Divider inset />}
        contentContainerStyle={{ paddingBottom: space.huge }}
        ListEmptyComponent={
          <EmptyState
            title="No connections yet"
            body="This term has not been cross-linked. Search or browse to find related ideas."
            action={{ label: 'Go back', onPress: () => navigation.goBack() }}
          />
        }
      />
    </Screen>
  );
}
