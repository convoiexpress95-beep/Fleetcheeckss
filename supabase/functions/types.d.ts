// Stub minimal pour permettre au typechecker local (Node) d'ignorer les erreurs Deno.
// Ces définitions ne reflètent pas entièrement l'environnement d'exécution Supabase Edge (Deno),
// mais suffisent à supprimer les erreurs TS hors contexte.

declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

declare module 'std/http/server.ts' {
  export interface ServeInit { port?: number; }
  export type Handler = (req: Request) => Response | Promise<Response>;
  export function serve(handler: Handler, opts?: ServeInit): void;
}
