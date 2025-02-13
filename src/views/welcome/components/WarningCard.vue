<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { emitter } from "@/utils/mitt";
import WarningList from "./WarningList.vue";
import { getAlarmNoticeHome } from "@/api/alarmNotice";

const emit = defineEmits(["deal"]);
const params = reactive({
  pageIndex: 1,
  pageSize: 20
});
const listData = ref([]);
const loading = ref<boolean>(true);
const warningActive = ref("personneWarning");

function getDatas() {
  getAlarmNoticeHome(params)
    .then(({ data }) => {
      listData.value = data || [];
      if (listData.value.length > 0) {
        warningActive.value = listData.value[0].noticeType;
      }
    })
    .catch(() => {
      listData.value = [];
    })
    .finally(() => {
      loading.value = false;
    });
}

//处理
function handleDeal(row: any) {
  emit("deal", row);
}

function handleRefresh() {
  getDatas();
}

onMounted(() => {
  getDatas();
});

emitter.on("onNoticeDataEmitter", () => {
  getDatas();
});
</script>

<template>
  <el-card
    shadow="hover"
    :style="{
      height: '420px'
    }"
  >
    <el-tabs v-model="warningActive" tab-position="top" @tab-click="() => null">
      <el-tab-pane
        v-for="item in listData"
        :key="item.noticeType"
        :label="
          item.count
            ? item.noticeTypeName + '(' + item.count + ')'
            : item.noticeTypeName
        "
        :name="item.noticeType"
      >
        <el-skeleton animated :rows="7" :loading="loading">
          <template #default>
            <WarningList
              :key="item.noticeType"
              :listData="item.items"
              @deal="handleDeal"
              @refresh="handleRefresh"
            />
          </template>
        </el-skeleton>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__item) {
  --el-calendar-cell-width: 36px;

  position: relative;
  box-sizing: border-box;
  // line-height: var(--el-tabs-header-height);
  display: inline-block;
  height: var(--el-tabs-header-height);
  padding: 0 20px;
  font-size: var(--el-font-size-medium);
  font-weight: 500;
  line-height: inherit;
  color: var(--el-text-color-primary);
  list-style: none;
}

:deep(.el-tabs__nav-wrap::after) {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: var(--el-index-normal);
  width: 100%;
  height: 1px;
  content: "";
  background-color: var(--el-border-color-light);
}
</style>
