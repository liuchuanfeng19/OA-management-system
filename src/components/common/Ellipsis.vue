<script setup lang="ts">
defineOptions({
  name: "Ellipsis"
});
defineProps({
  row: {
    type: Number,
    default: 1
  },
  hoverTip: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <div
    class="eeee"
    :class="{ line: row === 1, lines: row > 1 }"
    :title="hoverTip ? content : null"
    :style="{ '--row': row }"
  >
    <slot name="pre" />
    {{ content }}
  </div>
</template>

<style lang="scss" scoped>
.line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lines {
  display: -webkit-box;
  word-break: break-all;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: var(--row);
  -webkit-box-orient: vertical;
}
</style>
