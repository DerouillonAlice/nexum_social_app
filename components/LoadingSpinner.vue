<template>
  <div class="flex items-center justify-center p-8" role="status" aria-live="polite" aria-label="Chargement en cours">
    <div class="flex items-center gap-1.5" aria-hidden="true">
      <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.3s]"></span>
      <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce [animation-delay:-0.15s]"></span>
      <span class="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-bounce"></span>
    </div>
    <span class="sr-only">Chargement en cours…</span>
  </div>
</template>
