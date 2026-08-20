export type Branch = 'article' | 'enrichment';

export interface GenerateInput {
  keyword: string;
  intent: string;
  client: string;
  site: string;
}

export interface RunResult {
  id: string;
  keyword: string;
  branch: Branch;
  markdown: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
}
