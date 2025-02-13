<script setup lang="ts">
import { ref, onMounted } from "vue";

import TextList from "./TextList.vue";
// import { getAlarmNoticeHome } from "@/api/alarmNotice";

// const params = reactive({
//   pageIndex: 1,
//   pageSize: 20
// });
// const listData = ref([]);
const loading = ref<boolean>(false);
const textActive = ref("news1");

// function getDatas() {
//   getAlarmNoticeHome(params)
//     .then(({ data }) => {
//       listData.value = data || [];
//       if (listData.value.length > 0) {
//         textActive.value = listData.value[0].noticeType;
//       }
//     })
//     .catch(() => {
//       listData.value = [];
//     })
//     .finally(() => {
//       loading.value = false;
//     });
// }

onMounted(() => {
  // getDatas();
});
</script>

<template>
  <el-card
    shadow="hover"
    :style="{
      height: '420px'
    }"
  >
    <el-tabs v-model="textActive" tab-position="top" @tab-click="() => null">
      <el-tab-pane label="通知公告" name="news1">
        <el-skeleton animated :rows="7" :loading="loading">
          <template #default>
            <TextList key="notice" listType="notice" />
          </template>
        </el-skeleton>
      </el-tab-pane>
      <el-tab-pane label="规章制度" name="news2">
        <el-skeleton animated :rows="7" :loading="loading">
          <template #default>
            <TextList key="rules" listType="rules" />
          </template>
        </el-skeleton>
      </el-tab-pane>
      <el-tab-pane label="知识库" name="news3">
        <el-skeleton animated :rows="7" :loading="loading">
          <template #default>
            <TextList key="knowledge" listType="knowledge" />
          </template>
        </el-skeleton>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__item) {
  --el-calendar-cell-width: 36px;
  padding: 0 20px;
  height: var(--el-tabs-header-height);
  box-sizing: border-box;
  line-height: inherit;
  // line-height: var(--el-tabs-header-height);
  display: inline-block;
  list-style: none;
  font-size: var(--el-font-size-medium);
  font-weight: 500;
  color: var(--el-text-color-primary);
  position: relative;
}

:deep(.el-tabs__nav-wrap::after) {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background-color: var(--el-border-color-light);
  z-index: var(--el-index-normal);
}
</style>
