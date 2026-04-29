export interface Tool {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters?: any;
  };
}

export interface Message {
  role: string;
  content: string | any[] | null;
  tool_calls?: {
    id: string;
    type: string;
    function: { name: string; arguments: string }
  }[];
  tool_call_id?: string;
  name?: string;
}

export interface LLMData {
  messages?: Message[];
  prompt?: string;
  model: string;
  temperature?: number;
  stream?: boolean;
  tools?: Tool[];
  top_p?: number;
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  raw_config?: Record<string, any>;
}
