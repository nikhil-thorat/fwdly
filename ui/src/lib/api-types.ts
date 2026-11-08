export interface ApiURL {
  id: number;
  short_code: string;
  original_url: string;
  user_id: string | null;
  created_at: string;
  expires_at: string | null;
  clicks?: number | null;
}

export interface ApiTimeSeriesPoint {
  date: string;
  clicks: number;
}

export interface ApiReferrerPoint {
  referrer: string;
  clicks: number;
}

export interface ApiClickStats {
  total_clicks: number;
  unique_clicks: number;
  time_series: ApiTimeSeriesPoint[] | null;
  top_referrers: ApiReferrerPoint[] | null;
}

export interface ApiUser {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  google_id: string | null;
  tier: "guest" | "basic" | "pro";
  created_at: string;
}

export interface ApiSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  status: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}
