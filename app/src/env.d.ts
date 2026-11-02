declare const __APP_VERSION__: string;

declare module 'virtual:lesson-meta' {
  const meta: Record<string, { summary: string; estimatedDuration: number; tags: string[] }>;
  export default meta;
}

declare module 'virtual:lesson-search' {
  const index: Record<string, { keyPoints: string[]; rules: { id: string; title: string; description: string; context: string }[] }>;
  export default index;
}
