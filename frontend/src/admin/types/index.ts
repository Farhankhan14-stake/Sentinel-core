export interface AdminUser {
  id: string;
  email: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  apiUsage: number;
  apiKeys: number;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface GlobalApiKey {
  id: string;
  userId: string;
  userEmail: string;
  prefix: string;
  usage: number;
  lastUsed: string;
  status: 'ACTIVE' | 'REVOKED' | 'DISABLED';
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  threatType: 'Prompt Injection' | 'PII Leak' | 'Malicious Code' | 'Suspicious Behavior' | 'None';
  status: 'BLOCKED' | 'REDACTED' | 'CLEAN';
  rawJson: string;
}
