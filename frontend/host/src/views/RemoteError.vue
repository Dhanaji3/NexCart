<script setup lang="ts">
</script>

<template>
  <div class="flex justify-center items-center min-h-[50vh]">
    <div class="text-center bg-white rounded-xl p-10 shadow-elevated max-w-md">
      <span class="text-5xl block mb-4">⚠️</span>
      <h2 class="text-xl font-bold text-slate-900 mb-2">Module Unavailable</h2>
      <p class="text-slate-500 mb-6 leading-relaxed">This section is temporarily unavailable. The micro-frontend service may be down.</p>
      <div class="flex gap-3 justify-center">
        <button @click="$router.go(0)" class="btn-primary">Retry</button>
        <RouterLink to="/" class="btn-outline">Go Home</RouterLink>
      </div>
    </div>
  </div>
</template>
