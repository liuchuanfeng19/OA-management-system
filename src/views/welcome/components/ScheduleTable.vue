<script setup lang="ts">
// import moment from "moment";

defineProps({
  listData: {
    require: true,
    type: Array,
    default: () => []
  }
});

const emitts = defineEmits(["refresh", "deal", "hidden", "jump"]);

const columns = [
  // {
  //   id: "icon",
  //   label: "图标",
  //   width: 60
  // },
  {
    id: "title1",
    label: "标题",
    width: 200,
    align: "left",
    fixed: "left",
    showOverflowTooltip: true
  },
  {
    id: "applyStaffName",
    label: "发起人",
    width: 100,
    align: "left",
    fixed: false,
    showOverflowTooltip: false
  },
  {
    id: "curReviewerName",
    label: "当前审核人",
    width: 100,
    align: "left",
    fixed: false,
    showOverflowTooltip: false
  },
  {
    id: "levelName",
    label: "紧急类型",
    width: 80,
    align: "center",
    fixed: false,
    showOverflowTooltip: false
  },
  {
    id: "applyStatusExpr",
    label: "审核状态",
    width: 80,
    align: "center",
    fixed: false,
    showOverflowTooltip: false
  },
  {
    id: "applyDeptName",
    label: "所在部门",
    width: 100,
    align: "left",
    fixed: false,
    showOverflowTooltip: false
  },
  {
    id: "createTime",
    label: "创建时间",
    width: 160,
    align: "center",
    fixed: false,
    showOverflowTooltip: false
  }
];

//处理
function handleDeal(item: any, type?) {
  if (!type) {
    emitts("deal", item);
  } else {
    emitts(type, item);
  }
}
</script>

<template>
  <el-table :data="listData" stripe :height="320" highlight-current-row>
    <el-table-column
      type="index"
      label="序号"
      align="center"
      fixed="left"
      width="60"
    />
    <template v-for="col in columns" :key="col.id">
      <el-table-column
        v-if="col.id == 'levelName'"
        :showOverflowTooltip="col.showOverflowTooltip"
        :prop="col.id"
        :align="col.align"
        :fixed="col.fixed"
        :label="col.label"
        :width="col.width"
      >
        <template #default="{ row }">
          <el-tag :type="row.level == 10 ? 'danger' : 'info'">
            {{ row.levelName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        :showOverflowTooltip="col.showOverflowTooltip"
        :prop="col.id"
        :align="col.align"
        :fixed="col.fixed"
        :label="col.label"
        :width="col.width"
      />
    </template>

    <el-table-column width="150" fixed="right" label="操作">
      <template #default="{ row }">
        <el-button
          v-if="row.canAudit"
          type="primary"
          link
          size="default"
          @click="handleDeal(row)"
        >
          审核
        </el-button>
        <el-button
          v-else-if="row.canEdit"
          type="primary"
          link
          size="default"
          @click="handleDeal(row)"
        >
          编辑
        </el-button>
        <el-popconfirm
          v-else-if="row.canFinish"
          title="确定要完结吗"
          confirmButtonText="确定"
          cancelButtonText="取消"
          confirmButtonType="primary"
          cancelButtonType="text"
          @confirm="handleDeal(row)"
        >
          <template #reference>
            <el-button type="primary" link size="default"> 完结 </el-button>
          </template>
        </el-popconfirm>
        <el-button
          v-else
          type="primary"
          link
          size="default"
          @click="handleDeal(row)"
          >查看</el-button
        >
        <el-button
          type="primary"
          link
          size="default"
          @click="handleDeal(row, 'jump')"
          >办理</el-button
        >
        <el-button
          type="primary"
          link
          size="default"
          @click="handleDeal(row, 'hidden')"
          >隐藏</el-button
        >
      </template>
    </el-table-column>
  </el-table>
</template>
