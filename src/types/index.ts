export interface Offer {
  id: string;
  name: string;
  logo: string;
  apr: number;
  minAmount: number;
  maxAmount: number;
  minPeriod: number;
  maxPeriod: number;
  decision: string;
  tags: string[];
  rating: number;
}

export interface FilterParams {
  amount: number;
  period: number;
  selectedTags: string[];
}

export type SortOption = 'apr-asc' | 'rating-desc';

export interface AnalyticsEvent {
  name: EventName;
  timestamp: number;
  params?: Record<string, unknown>;
}

export type EventName =
  | 'view_list'
  | 'filter_change'
  | 'sort_change'
  | 'expand_offer'
  | 'cta_click';

export interface EventParams {
  view_list?: {
    count: number;
  };
  filter_change?: {
    amount: number;
    period: number;
    tags?: string[];
  };
  sort_change?: {
    sortBy: SortOption;
  };
  expand_offer?: {
    offerId: string;
    offerName: string;
  };
  cta_click?: {
    offerId: string;
    offerName: string;
    apr: number;
  };
}
