import { createGoMmtAdapter } from "./gommt.js";

export function getChannelAdapter(provider, account) {
  switch (provider) {
    case "gommt":
      return createGoMmtAdapter(account);
    default:
      throw new Error(`Unsupported channel provider: ${provider}`);
  }
}
