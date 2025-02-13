<script setup lang="ts">
import type { PropType } from "vue";

import TableColum from "@/components/TableColum";
import TableExtra from "@/components/TableExtra";
import { hasPermission } from "@/utils/permission";
import { PureTableBar } from "@/components/RePureTableBar";
import { useQueryFormToggle } from "@/views/hooks/useQueryFormToggle";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "TableColum"
});
const eimts = defineEmits(["operation", "selectionChange", "currentChange"]);
const props = defineProps({
  pageTitle: {
    type: String,
    default: "分页表格"
  },
  pageData: {
    type: Object as PropType<PageTableResult<any>>,
    default: () => {
      return {};
    }
  },
  checkList: {
    type: Array<String>,
    default: () => []
  },
  pageButtons: {
    type: Array<TableButton>,
    default: () => []
  },
  columns: {
    type: Array<TableColum>,
    default: () => []
  },
  isSelect: {
    type: Boolean,
    default: false
  },
  tableNumber: {
    type: Number,
    default: 1
  },
  tableHeight: {
    type: Number,
    default: 260
  },
  requesting: {
    type: Boolean,
    default: false
  },
  selectable: {
    type: Function as PropType<(row: any, index: number) => boolean>
  },
  searchFunction: {
    type: Function as PropType<() => void>
  },
  hasAuditColumns: {
    type: Boolean,
    default: false
  },
  exportUrl: {
    type: String,
    default: ""
  },
  templateUrl: {
    type: String,
    default: ""
  },
  exportBaseUrl: {
    type: String as PropType<"DOMAIN_BFW" | "DOMAIN_BUS">,
    default: ""
  },
  importFunction: {
    type: Function
  }
});

const queryParams: any = defineModel("queryParams");
const multipleSelection = defineModel("multipleSelection");

const { tableHeightMap } = useQueryFormToggle(null, [props.tableNumber]);

//有权限的按钮数组
const hasPermissionPageButtons = props.pageButtons.filter(item =>
  hasPermission(item.buttonCode)
);
//有权限的表格按钮数组
const tableButtons = hasPermissionPageButtons.filter(
  item => !item.isTableColum
);
//有权限的操作按钮数组
const tableRowButtons = hasPermissionPageButtons.filter(
  item => item.isTableColum
);
//包含更多按钮的有权限的操作按钮数组
const operationButtons = function () {
  const buttons = [];
  tableRowButtons.forEach((element, index) => {
    if (index < 3 || (index == 3 && tableRowButtons.length == 4)) {
      buttons.push({ ...element });
    } else if (tableRowButtons.length != 4 && index == 3) {
      buttons.push({
        buttonName: "更多",
        buttonCode: "",
        buttonIcon: "ep:more",
        buttonType: "primary",
        buttonClick: "",
        isTableColum: true,
        isLink: true,
        disabled: false,
        popconfirmTitle: "",
        title: "更多",
        children: [{ ...element }]
      });
    } else if (tableRowButtons.length != 4 && index > 3) {
      buttons[3].children.push({ ...element });
    }
  });
  return buttons;
};

/**
 *操作按钮事件
 * @param operation
 */
function handleOperation(operation: String, row?) {
  eimts("operation", operation, row);
}

const handleCurrentChange = val => {
  eimts("currentChange", val);
};

// 表格行选中回调
function handleSelectionChange(val) {
  multipleSelection.value = val;
  eimts("selectionChange", val);
}
</script>

<template>
  <div class="main">
    <PureTableBar
      :title="pageTitle"
      :loading="requesting"
      @refresh="searchFunction"
    >
      <template #buttons>
        <slot name="queryForm" />
        <TableExtra
          v-if="!isSelect"
          :buttons="tableButtons"
          :queryParams="queryParams"
          :pageTitle="pageTitle"
          :exportUrl="exportUrl"
          :templateUrl="templateUrl"
          :exportBaseUrl="exportBaseUrl"
          :importFunction="importFunction"
          @refresh="searchFunction"
          @operation="handleOperation"
        />
      </template>
      <template v-slot="{ size }">
        <el-table
          border
          stripe
          :size="size"
          :height="
            isSelect
              ? tableHeight
              : tableHeightMap && tableHeightMap.get(tableNumber)
                ? tableHeightMap.get(tableNumber) - 13
                : tableHeight
          "
          highlight-current-row
          :data="pageData?.data"
          @current-change="handleCurrentChange"
          @selection-change="handleSelectionChange"
        >
          <TableColum
            :checkList="checkList"
            :columns="columns"
            :isSelect="isSelect"
            :queryParams="queryParams"
            :hasAuditColumns="hasAuditColumns"
            :tableData="pageData?.data"
            :selectable="selectable"
            @operation="handleOperation"
          />
          <TableColumOperation
            v-if="!isSelect && operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryParams.pageSize"
          v-model:current-page="queryParams.pageIndex"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageData?.totalCount"
          @size-change="searchFunction"
          @current-change="searchFunction"
        />
      </template>
    </PureTableBar>
    <slot name="formDialog" />
    <slot />
  </div>
</template>
