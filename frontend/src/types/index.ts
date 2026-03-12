export type ThreatType = 'PROMPT_INJECTION' | 'DATA_LEAK' | 'MALICIOUS_CODE' | 'PII_EXPOSURE' | 'NONE';
export type LogStatus = 'CLEAN' | 'BLOCKED' | 'REDACTED';

export interface SecurityLog {
  id: string;
  timestamp: string;
  api_key_id: string;
  status: LogStatus;
  threat_type: ThreatType;
  tokens_used: number;
  sanitized_content?: string;
  raw_prompt?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  last_used: string | null;
  status: 'active' | 'revoked';
  usage_count: number;
}

export interface Analytics {
  totalThreatsBlocked: number;
  promptInjectionsDetected: number;
  dataLeaksPrevented: number;
  apiRequestsToday: number;
  securityScore: number;
  threatsOverTime: { date: string; clean: number; blocked: number }[];
  usageVsLimit: { used: number; limit: number };
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS';
}
