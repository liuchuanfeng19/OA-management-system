<script setup lang="ts">
import WarningListItem from "./WarningListItem.vue";

defineProps({
  listData: {
    require: true,
    type: Array,
    default: () => []
  }
});
const emitts = defineEmits(["refresh", "deal"]);

//处理
function handleDeal(item: any) {
  emitts("deal", item);
}
</script>

<template>
  <el-scrollbar height="326px" :min-size="0">
    <template v-if="listData.length > 0">
      <WarningListItem
        v-for="(item, index) in listData"
        :key="index"
        :itemData="item"
        @deal="handleDeal"
      />
    </template>
    <el-empty v-else :image-size="64">
      <el-button v-if="false" type="primary" @click="emitts('refresh')"
        >刷新</el-button
      >
    </el-empty>
  </el-scrollbar>
</template>
