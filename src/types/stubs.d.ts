// Stub modules for missing external packages to satisfy TypeScript until installed or removed.
declare module 'lovable-tagger' {
  const plugin: any;
  export default plugin;
}

// Deno specific globals for Supabase edge functions (excluded from app bundle)
// If edge functions TS is included in root tsconfig, these avoid compile errors.
// They can be refined by adding a reference to deno types in a separate tsconfig.
declare const Deno: any;
