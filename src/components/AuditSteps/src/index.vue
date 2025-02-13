<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  reviewers: {
    require: true,
    default: () => [],
    type: Array
  },
  marginWidth: {
    require: false,
    default: 15,
    type: Number
  }
});
const stepActive = ref(-1);
const approverData = ref([]); //审批人员
const stepStatus = ref<"wait" | "success" | "error" | "process" | "finish">(
  "wait"
);
/** 通过状态获取颜色 */
function getThemeColor(item) {
  if (item.isStarter || (!item.isStarter && item.isApproved)) {
    return "#67c23a";
  } else if (
    (!item.isStarter &&
      !item.isReturnBack &&
      !item.isApproved &&
      item.hasApproved) ||
    (!item.isStarter &&
      item.isReturnBack &&
      !item.isApproved &&
      item.hasApproved)
  ) {
    return "#f56c6c";
  } else {
    return "#a8abb2";
  }
}
function getThemeIcon(item) {
  if (item.isStarter || (!item.isStarter && item.isApproved)) {
    return "checkbox-circle-line";
  } else if (
    (!item.isStarter &&
      !item.isReturnBack &&
      !item.isApproved &&
      item.hasApproved) ||
    (!item.isStarter &&
      item.isReturnBack &&
      !item.isApproved &&
      item.hasApproved)
  ) {
    return "close-circle-line";
  } else {
    return "checkbox-circle-line";
  }
}
watch(
  () => props.reviewers,
  newVal => {
    if (newVal) {
      approverData.value = newVal.map((item: any) => {
        item.result =
          !item.isStarter && item.isApproved
            ? "通过"
            : !item.isStarter &&
                !item.isReturnBack &&
                !item.isApproved &&
                item.hasApproved
              ? "拒绝"
              : !item.isStarter &&
                  item.isReturnBack &&
                  !item.isApproved &&
                  item.hasApproved
                ? "拒绝"
                : item.isStarter
                  ? "通过"
                  : "待审核";
        return item;
      });
      console.log("approverData.value", approverData.value);
      const index = approverData.value.findIndex(item => !item.hasApproved);
      stepActive.value = index == -1 ? -1 : index - 1;
      const currentReviewer =
        stepActive.value == -1
          ? approverData.value[approverData.value.length - 1]
          : approverData.value[stepActive.value];

      stepStatus.value = currentReviewer?.hasApproved
        ? currentReviewer?.isApproved
          ? stepActive.value == -1
            ? "success"
            : "success"
          : "error"
        : stepActive.value == 0
          ? "process"
          : "wait"; //wait / process / finish / error / success
      console.log("stepStatus.value", stepStatus.value);
      console.log("stepActive.value", stepActive.value);
    }
  },
  {
    immediate: true
  }
);
</script>

<template>
  <!-- <el-steps
    :active="stepActive == -1 ? approverData.length - 1 : stepActive"
    align-center
    simple
    finish-status="success"
    :process-status="stepStatus"
    class="mb-1"
  >
    <el-step v-for="(item, i) in approverData" :key="i">
      <template #title>
        <span>{{ item.reviewerName }}</span>
      </template>
    </el-step>
  </el-steps> -->
  <el-scrollbar class="scroll">
    <div
      v-show="
        approverData != null &&
        approverData != undefined &&
        approverData.length > 0
      "
      class="auditSteps"
    >
      <div v-for="(item, idx) in approverData" :key="item" class="step">
        <el-icon size="20" :color="getThemeColor(item)">
          <IconifyIconOffline :icon="getThemeIcon(item)" />
        </el-icon>
        <span
          :style="{
            color: getThemeColor(item),
            'font-size': '14px',
            'margin-left': '10px'
          }"
          >{{ item.reviewerName }}</span
        >
        <el-icon
          v-show="idx < approverData.length - 1"
          :style="{ margin: `0 ${props.marginWidth}px` }"
          size="20"
          :color="getThemeColor(item)"
        >
          <IconifyIconOffline icon="arrow-right-s-line" />
        </el-icon>
      </div>
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.scroll {
  background-color: var(--el-fill-color-light);
}

.auditSteps {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 5px;
  margin-left: 20px;
  border-radius: 4px;

  .step {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-radius: 4px;
  }
}
</style>
