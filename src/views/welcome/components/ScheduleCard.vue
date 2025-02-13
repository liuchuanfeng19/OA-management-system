<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

import { emitter } from "@/utils/mitt";
import ScheduleTable from "./ScheduleTable.vue";
import { getAuditNoticeHome } from "@/api/auditNotice";

const emit = defineEmits(["deal", "hidden", "jump"]);

const params = reactive({
  pageIndex: 1,
  pageSize: 999
});
const listData = ref([]);
const tabsActive = ref();
const loading = ref<boolean>(true);

function getDatas() {
  getAuditNoticeHome(params)
    .then(({ data }) => {
      const _data = data || [];
      listData.value = _data.map(item => {
        item.tabPaneName = item.isProcessed ? "个人已办" : "个人待办";
        return item;
      });
      if (listData.value.length > 0) {
        tabsActive.value = 0;
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
//处理
function handleHidden(row: any) {
  emit("hidden", row);
}
//跳转
function handleJump(row: any) {
  emit("jump", row);
}

function handleRefresh() {
  getDatas();
}
defineExpose({ handleRefresh });

onMounted(() => {
  getDatas();
});

emitter.on("onNoticeDataEmitter", () => {
  getDatas();
});
</script>

<template>
  <el-card shadow="hover" style="height: 420px">
    <el-tabs v-model="tabsActive" tab-position="top" @tab-click="() => null">
      <el-tab-pane
        v-for="(item, index) in listData"
        :key="index"
        :label="
          item.count
            ? item.tabPaneName + '(' + item.count + ')'
            : item.tabPaneName
        "
        :name="index"
      >
        <el-skeleton animated :rows="7" :loading="loading">
          <template #default>
            <ScheduleTable
              :key="item.noticeType"
              :listData="item.items"
              @deal="handleDeal"
              @jump="handleJump"
              @hidden="handleHidden"
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
