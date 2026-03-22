import type { ChatMessage } from "./providers";
import type { Provider } from "./providers";
import { streamOpenAI } from "./providers/openai";
import { streamAnthropic } from "./providers/anthropic";
import { getProviderConfig } from "./providers";

export { type Provider } from "./providers";

export async function streamChat(
  provider: Provider,
  messages: ChatMessage[],
  model?: string,
  providerKey?: string,
): Promise<ReadableStream<Uint8Array>> {
  const config = getProviderConfig(provider, providerKey);

  if (provider === "openai") {
    return streamOpenAI(config, messages, model);
  }
  return streamAnthropic(config, messages, model);
}
