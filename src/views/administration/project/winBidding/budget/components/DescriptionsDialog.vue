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
  itemMinWidth: "",
  itemAlign: "left",
  itemLabelAlign: "center"
});

const dialogTitle = computed(() => {
  return "查看" + props.title;
});
const dialogVisible = ref(false);
const descriptionsData1 = ref<DescriptionsProps>();
const descriptionsData2 = ref<DescriptionsProps>();
const descriptionsData3 = ref<DescriptionsProps>();

/**
 * 子组件暴露给父组件调用的方法
 * @param _id
 * @param _auditType
 */
const show = (
  rowData,
  _tableColumnData1,
  _tableColumnData2,
  _tableColumnData3
) => {
  dialogVisible.value = true;
  const tableColumnData1 = _tableColumnData1.filter(item => item.isFormItem);
  const tableColumnData2 = _tableColumnData2.filter(item => item.isFormItem);
  const tableColumnData3 = _tableColumnData3.filter(item => item.isFormItem);
  tableColumnData1.forEach(item => {
    item.value = rowData[item.prop];
  });
  tableColumnData2.forEach(item => {
    item.value = rowData[item.prop];
  });
  tableColumnData3.forEach(item => {
    item.value = rowData[item.prop];
  });
  descriptionsData1.value = {
    ...props,
    title: "",
    columnData: tableColumnData1,
    rowData
  };
  descriptionsData2.value = {
    ...props,
    title: "",
    columnData: tableColumnData2,
    rowData
  };
  descriptionsData3.value = {
    ...props,
    title: "",
    columnData: tableColumnData3,
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
    <el-card shadow="never" :body-style="{ padding: '0px' }" class="mb-2">
      <template #header>
        <div>
          <span>基础信息</span>
        </div>
      </template>
      <ReadDescriptions v-bind="descriptionsData1" :key="1" />
    </el-card>
    <el-card shadow="never" :body-style="{ padding: '0px' }" class="mb-2">
      <template #header>
        <div>
          <span>预算费用明细</span>
        </div>
      </template>
      <ReadDescriptions v-bind="descriptionsData2" :key="2" />
    </el-card>
    <el-card shadow="never" :body-style="{ padding: '0px' }" class="mb-1">
      <template #header>
        <div>
          <span>实际发生费用明细</span>
        </div>
      </template>
      <ReadDescriptions v-bind="descriptionsData3" :key="3" />
    </el-card>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
<style scoped lang="scss">
:deep() {
  .el-card__header {
    padding: calc(var(--el-card-padding) - 8px)
      calc(var(--el-card-padding) - 8px);
    border-bottom: 1px solid var(--el-card-border-color);
    box-sizing: border-box;
  }
}
</style>
