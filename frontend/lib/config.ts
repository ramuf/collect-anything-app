// Runtime configuration helper
// This allows API URL to be configured at container runtime instead of build time

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      NEXT_PUBLIC_API_URL?: string;
    };
  }
}

export function getApiUrl(): string {
  // Try runtime config first (for Docker deployments)
  if (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.NEXT_PUBLIC_API_URL) {
    return window.__RUNTIME_CONFIG__.NEXT_PUBLIC_API_URL;
  }
  
  // Fall back to build-time env var
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
}
