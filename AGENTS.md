<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- AI calls go through server routes `src/routes/api/generate.ts` (tools) and `src/routes/api/chat.ts` (chat); prompts live in `src/lib/ai/prompts.server.ts` so structured prompts stay server-side.
- Chat threads are stored in browser localStorage via `src/lib/threads.ts`; each thread has its own `/chat/$threadId` URL so reloads restore it.
