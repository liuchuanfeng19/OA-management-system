<script setup lang="ts">
import { ref, watch } from "vue";
import dayjs from "dayjs";
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
      console.log("approverData.value", approverData.value);
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<template>
  <div class="mb-4">
    <div v-for="(item, i) in approverData" :key="i">
      <el-descriptions
        v-if="
          !item.isStarter &&
          ((item.isCurrentReviewer && item.isCurrent) || item.hasApproved)
        "
        :title="
          !item.isStarter &&
          ((item.isCurrentReviewer && item.isCurrent) || item.hasApproved)
            ? `${item.reviewerName}审核`
            : ''
        "
        :column="2"
        border
      >
        <el-descriptions-item
          label="审核结果"
          label-align="center"
          align="center"
          width="150px"
          >{{ item.result }}</el-descriptions-item
        >
        <el-descriptions-item
          label="审核时间"
          label-align="center"
          align="center"
          width="150px"
          >{{
            item.approveTime != null &&
            item.approveTime != "" &&
            item.approveTime != "1900-01-01 00:00:00" &&
            item.approveTime != "0001-01-01 00:00:00"
              ? dayjs(item.approveTime).format("YYYY-MM-DD HH:mm")
              : "---"
          }}</el-descriptions-item
        >
        <el-descriptions-item
          v-if="
            (props.showType == 'read' && item.comment) ||
            (props.showType == 'audit' && !item.isCurrentReviewer)
          "
          label="审核意见"
          label-align="center"
          align="center"
          width="150px"
          >{{ item.comment }}</el-descriptions-item
        >
      </el-descriptions>
    </div>
    <el-form v-if="false" label-width="92px">
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
  </div>
</template>
