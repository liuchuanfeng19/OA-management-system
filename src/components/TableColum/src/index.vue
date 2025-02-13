<script setup lang="ts">
import { PropType } from "vue";

import { TableColumAudit } from "@/components/TableColumAudit";

defineOptions({
  name: "TableColum"
});
const eimts = defineEmits(["operation"]);
const props = defineProps({
  tableData: {
    type: [],
    default: () => []
  },
  checkList: {
    type: Array<String>,
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
  queryParams: {
    type: Object,
    default: () => ({})
  },
  selectable: {
    type: Function as PropType<(row: any, index: number) => boolean>
  },
  hasAuditColumns: {
    type: Boolean,
    default: false
  }
});

/**
 *操作按钮事件
 * @param operation
 */
function handleOperation(operation: String, row?) {
  eimts("operation", operation, row);
}
</script>

<template>
  <el-table-column
    v-if="checkList.includes('勾选列')"
    type="selection"
    align="center"
    width="42"
    :selectable="selectable"
  />
  <el-table-column
    v-if="checkList.includes('序号列')"
    fixed="left"
    type="index"
    :index="
      index =>
        queryParams.pageIndex && queryParams.pageSize
          ? (queryParams.pageIndex - 1) * queryParams.pageSize + index + 1
          : index + 1
    "
    label="序号"
    align="center"
    width="60"
  />
  <template v-for="column in columns" :key="column.prop">
    <el-table-column
      v-if="column.children && column.children.length > 0"
      :label="column.label"
      :width="column.width"
    >
      <el-table-column
        v-for="_column in column.children"
        :key="_column.prop"
        :align="_column.align"
        :label="_column.label"
        :prop="_column.prop"
        :show-overflow-tooltip="_column.showOverflowTooltip"
        :min-width="_column.width"
        :fixed="_column.fixed"
        :formatter="_column.formatter"
      >
        <template #default="{ row }">
          <template v-if="_column.tableColumnSlot">
            <component :is="_column.tableColumnSlot(row)" />
          </template>
          <template v-else-if="_column.formatter">
            {{ _column.formatter(row) }}
          </template>
          <template v-else>
            {{ row[_column.prop] }}
          </template>
        </template>
      </el-table-column>
    </el-table-column>

    <template v-else>
      <el-table-column
        v-if="!column.hideColumn && column.read"
        :label="column.label"
        :prop="column.prop"
        :align="column.align"
        :width="column.fixedWidth ? column.width : ''"
        :min-width="column.fixedWidth ? '' : column.width"
        :fixed="column.fixed"
        :show-overflow-tooltip="column.showOverflowTooltip"
      >
        <template #default="{ row }">
          <el-text
            v-if="!isSelect"
            type="primary"
            class="cursor-pointer"
            @click="handleOperation('handleRead', row)"
          >
            <template v-if="column.formatter">
              {{ column.formatter(row) }}
            </template>
            <template v-else>
              {{ row[column.prop] }}
            </template>
          </el-text>
          <template v-else>
            {{ row[column.prop] }}
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="!column.hideColumn"
        :align="column.align"
        :label="column.label"
        :prop="column.prop"
        :show-overflow-tooltip="column.showOverflowTooltip"
        :width="column.fixedWidth ? column.width : ''"
        :min-width="column.fixedWidth ? '' : column.width"
        :fixed="column.fixed"
        :formatter="column.formatter"
      >
        <template #default="{ row }">
          <template v-if="column.tableColumnSlot">
            <component :is="column.tableColumnSlot(row)" />
          </template>
          <template v-else-if="column.formatter">
            {{ column.formatter(row) }}
          </template>
          <template v-else>
            {{ row[column.prop] }}
          </template>
        </template>
      </el-table-column>
    </template>
  </template>
  <TableColumAudit
    v-if="hasAuditColumns && tableData && tableData.length > 0"
    :tableData="tableData"
  />
</template>
