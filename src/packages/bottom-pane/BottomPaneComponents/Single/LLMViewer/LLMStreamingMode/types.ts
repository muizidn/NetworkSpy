export interface SSEChunk {
  id: string;
  event: string;
  data: string;
  content: string;
  timestamp: string;
  elapsedMs: number;
}
