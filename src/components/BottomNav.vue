<template>
  <nav class="bottom-nav">
    <div class="flex items-center justify-around py-3">
      <button v-for="tab in tabs" :key="tab.id" class="nav-item flex flex-col items-center gap-1" :class="{ active: activeTab === tab.id }" @click="$emit('navigate', tab.id)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="tab.icon"></svg>
        <span style="font-size:10px;">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup>
defineProps({
  activeTab: String,
  tabs: Array
})
defineEmits(['navigate'])
</script>
