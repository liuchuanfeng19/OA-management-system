<script setup lang="ts">
interface Column {
  /**标签文本*/
  label?: string;
  /**标签字段名*/
  prop?: string;
  /**内容*/
  value?: string;
  /**列的数量*/
  span?: number;
  /**列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容）*/
  width?: number | string;
  /**列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容）*/
  minWidth?: number | string;
  /**列的内容对齐方式（如无 border，对标签和内容均生效）*/
  align: "left" | "center" | "right";
  /**列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数）*/
  labelAlign: "left" | "center" | "right";
  /**用来格式化内容*/
  formatter: Function;
  /**内容渲染函数*/
  tableColumnSlot: Function;
  /**v-if 条件 箭头函数*/
  condition: Function;
}

interface Props {
  /**是否带有边框 */
  border?: boolean;
  /**一行 Descriptions Item 的数量*/
  column?: number;
  /**排列的方向*/
  direction?: "vertical" | "horizontal";
  /**列表的尺寸*/
  size?: "" | "large" | "default" | "small";
  /**标题文本，显示在左上方*/
  title?: string;
  /**操作区文本，显示在右上方*/
  extra?: string;
  /**列的数量*/
  span?: number;
  /**对话框宽度*/
  width?: number | string;
  /**列的宽度，不同行相同列的宽度按最大值设定（如无 border ，宽度包含标签与内容）*/
  itemWidth?: number | string;
  /**列的最小宽度，与 width 的区别是 width 是固定的，min-width 会把剩余宽度按比例分配给设置了 min-width 的列（如无 border，宽度包含标签与内容）*/
  itemMinWidth?: number | string;
  /**列的内容对齐方式（如无 border，对标签和内容均生效）*/
  itemAlign: "left" | "center" | "right";
  /**列的标签对齐方式，若不设置该项，则使用内容的对齐方式（如无 border，请使用 align 参数）*/
  itemLabelAlign: "left" | "center" | "right";
  /**表格列数据*/
  columnData: Array<Column>;
  /**表格行数据*/
  rowData: any;
}

const props = withDefaults(defineProps<Props>(), {
  border: true,
  column: 2,
  direction: "horizontal",
  size: "",
  title: "",
  extra: "",
  span: 1,
  width: "",
  itemWidth: "",
  itemMinWidth: 160,
  itemAlign: "left",
  itemLabelAlign: "center",
  columnData: () => [],
  rowData: () => null
});
</script>

<template>
  <el-descriptions v-bind="props">
    <template v-for="item in columnData" :key="item.prop">
      <el-descriptions-item
        v-if="!item.condition || (item.condition && item.condition(rowData))"
        :label="item.label"
        :span="item.span ? item.span : span"
        :min-width="item.minWidth ? item.minWidth : itemMinWidth"
        :align="item.align ? item.align : itemAlign"
        :label-align="item.labelAlign ? item.labelAlign : itemLabelAlign"
      >
        <template v-if="item.tableColumnSlot">
          <component :is="item.tableColumnSlot(rowData)" />
        </template>
        <template v-else-if="item.formatter">
          {{ item.formatter(rowData) }}
        </template>
        <template v-else>
          {{ item.value }}
        </template>
      </el-descriptions-item>
    </template>
  </el-descriptions>
</template>
<style lang="scss" scoped>
:deep() {
  .el-descriptions__label.el-descriptions__cell.is-bordered-label {
    width: 150px !important;
  }
}
</style>
