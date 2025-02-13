<script setup lang="ts">
interface Props {
  width: number;
  height: number;
  columns: Array<any>;
  data: Array<any>;
}
withDefaults(defineProps<Props>(), {
  height: 400,
  width: 400,
  columns: () => [],
  data: () => []
});
</script>

<template>
  <el-table
    highlight-current-row
    :data="data"
    border
    :width="width"
    stripe
    :max-height="height"
    :style="{ width: width + 'px' }"
  >
    <el-table-column
      label="序号"
      type="index"
      width="60"
      fixed="left"
      align="center"
    />
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :label="column.label"
      :prop="column.prop"
      :min-width="column.width"
      :align="column.align"
      :fixed="column.fixed"
      :show-overflow-tooltip="column.showOverflowTooltip"
    />
  </el-table>
</template>
