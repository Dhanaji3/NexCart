<script setup lang="ts">
</script>

<template>
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="text-center">
      <span class="text-8xl font-extrabold text-slate-200 leading-none block">404</span>
      <h2 class="text-xl font-bold text-slate-900 mt-2">Page Not Found</h2>
      <p class="text-slate-500 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <div class="flex gap-3 justify-center">
        <RouterLink to="/" class="btn-primary">Go Home</RouterLink>
        <RouterLink to="/products" class="btn-outline">Browse Products</RouterLink>
      </div>
    </div>
  </div>
</template>
