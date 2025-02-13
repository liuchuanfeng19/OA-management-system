<script setup lang="ts">
import { watch, ref } from "vue";
const props = defineProps({
  tableData: {
    type: [],
    default: () => []
  }
});
watch(
  () => props.tableData,
  val => {
    if (val) {
      initAuditList(val);
    }
  }
);

const auditList = ref([]);

function initAuditList(val) {
  auditList.value = val[0].reviewers.map(item => {
    return {
      nodeName: item.nodeName,
      children: [
        {
          prop: "reviewerName",
          label: "审核人",
          with: 100,
          align: "center",
          showOverflowTooltip: true
        },
        {
          prop: "approveStatus",
          label: "审核状态",
          with: 100,
          align: "center",
          showOverflowTooltip: true
        },
        {
          prop: "comment",
          label: "审核意见",
          with: 200,
          align: "left",
          showOverflowTooltip: true
        },
        {
          prop: "approveTime",
          label: "审核时间",
          with: 150,
          align: "center",
          showOverflowTooltip: true
        }
      ]
    };
  });
}
</script>

<template>
  <el-table-column
    v-for="(col, index) in auditList"
    :key="index"
    :label="col.nodeName"
    :width="col.width"
    align="center"
  >
    <el-table-column
      v-for="_col in col.children"
      :key="_col.prop"
      :prop="_col.prop"
      :label="_col.label"
      :width="_col.with"
      :align="_col.align"
      :showOverflowTooltip="_col.showOverflowTooltip"
    >
      <template #default="{ row }">{{
        row.reviewers[index][_col.prop]
      }}</template>
    </el-table-column>
  </el-table-column>
</template>
