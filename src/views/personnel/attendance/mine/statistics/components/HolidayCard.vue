<script setup lang="ts">
defineProps({
  holidayData: {
    required: true,
    type: Object
  }
});
</script>

<template>
  <el-card shadow="hover" :body-style="{ padding: '20px' }">
    <template #header>
      <div class="heee">
        <span>{{ holidayData.leaveTypeName }}</span>
      </div>
    </template>
    <div>
      <!-- <div class="row flex justify-between mb-[10px]">
        <span>上一年可请天数</span> <span>{{ holidayData.retainValue }}</span>
      </div>
      <div class="row flex justify-between mb-[10px]">
        <span>今年剩余天数</span> <span>{{ holidayData.leftValue }}</span>
      </div> -->
      <div class="row flex justify-between mb-[10px]">
        <span>当前可请天数</span>
        <span v-if="holidayData.isLimit == false">无限制</span>
        <span v-else>{{
          holidayData.retainValue + holidayData.leftValue
        }}</span>
      </div>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: calc(var(--el-card-padding) - 6px) var(--el-card-padding);
  border-bottom: 1px solid var(--el-card-border-color);
  box-sizing: border-box;
  background-color: var(--el-color-primary);
  // color: var(--el-text-color-primary);
  color: white;
}
</style>
