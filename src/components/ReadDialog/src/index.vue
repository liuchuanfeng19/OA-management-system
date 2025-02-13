<script setup lang="ts">
import { ref, computed } from "vue";
import ReadDescriptions from "@/components/ReadDescriptions";

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
}

interface DescriptionsProps extends Props {
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
  width: 804,
  itemWidth: "",
  itemMinWidth: 150,
  itemAlign: "left",
  itemLabelAlign: "center"
});

const dialogTitle = computed(() => {
  return "查看" + props.title;
});
const dialogVisible = ref(false);
const descriptionsData = ref<DescriptionsProps>();

/**
 * 子组件暴露给父组件调用的方法
 * @param _id
 * @param _auditType
 */
const show = (rowData, _tableColumnData) => {
  dialogVisible.value = true;
  const tableColumnData = _tableColumnData.filter(item => item.isFormItem);
  tableColumnData.forEach(item => {
    item.value = rowData[item.prop];
  });
  descriptionsData.value = {
    ...props,
    title: "",
    columnData: tableColumnData,
    rowData
  };
};
/**
 * 子组件暴露给父组件调用的方法
 */

defineExpose({ show });

/**
 * 关闭对话框
 */
const closeDialog = () => {};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    destroy-on-close
    :title="dialogTitle"
    :width="width"
    draggable
    @close="closeDialog"
  >
    <ReadDescriptions v-bind="descriptionsData" />
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
