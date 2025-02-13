<script setup lang="ts">
import { PropType } from "vue";
import { ListItem } from "./data";
import NoticeItem from "./noticeItem.vue";

const props = defineProps({
  typeIndex: {
    type: Number,
    default: 0
  },
  list: {
    type: Array as PropType<Array<ListItem>>,
    default: () => []
  }
});

const emits = defineEmits(["close"]);

function onClose() {
  emits("close");
}
</script>

<template>
  <div v-if="props.list.length">
    <NoticeItem
      v-for="(item, index) in props.list"
      :key="index"
      :noticeItem="item"
      :typeIndex="typeIndex"
      @close="onClose"
    />
  </div>
  <el-empty v-else description="暂无数据" :image-size="60" />
</template>
