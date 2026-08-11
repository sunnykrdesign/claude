import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Category, Difficulty } from '../types/term';

/** Which terms a revision session draws from. */
export type Deck =
  | { kind: 'due' }
  | { kind: 'saved' }
  | { kind: 'all' }
  | { kind: 'category'; category: Category };

export type TabParamList = {
  Search: undefined;
  Browse: { category?: Category; difficulty?: Difficulty } | undefined;
  Revise: undefined;
  Saved: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  Term: { termId: string };
  Connections: { termId: string };
  ReviseSession: { deck: Deck };
  Settings: undefined;
};

export function deckTitle(deck: Deck): string {
  switch (deck.kind) {
    case 'due':
      return 'Due today';
    case 'saved':
      return 'Saved terms';
    case 'all':
      return 'All terms';
    case 'category':
      return deck.category;
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
