<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  showType: {
    require: true,
    type: String
  },
  reviewers: {
    require: true,
    default: () => [],
    type: Array
  }
});

const approverData = ref([]); //审批人员

watch(
  () => props.reviewers,
  newVal => {
    if (newVal) {
      approverData.value = newVal.map((item: any) => {
        item.result =
          !item.isStarter && item.hasApproved
            ? item.isApproved
              ? "通过"
              : item.isReturnBack
                ? "退回"
                : "拒绝"
            : "待审核";
        return item;
      });
    }
  }
);
</script>

<template>
  <el-form label-width="92px">
    <template v-for="(item, i) in approverData" :key="i">
      <p
        v-if="
          !item.isStarter &&
          ((item.isCurrentReviewer && item.isCurrent) || item.hasApproved)
        "
        class="font-medium mb-1"
      >
        {{ item.reviewerName }}审核
      </p>
      <el-row
        v-if="
          !item.isStarter &&
          ((item.isCurrentReviewer && item.isCurrent) || item.hasApproved)
        "
        :gutter="20"
      >
        <el-col :span="12" :offset="0">
          <el-form-item label="审核结果">
            <el-input v-model="item.result" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="审核时间">
            <el-date-picker
              v-model="item.approveTime"
              readonly
              type="datetime"
              format="YYYY-MM-DD HH:mm"
              placeholder=""
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="
            (props.showType == 'read' && item.comment) ||
            (props.showType == 'audit' && !item.isCurrentReviewer)
          "
          :span="24"
          :offset="0"
        >
          <el-form-item label="审核意见">
            <el-input
              v-model="item.comment"
              type="textarea"
              :rows="2"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>
  </el-form>
</template>
