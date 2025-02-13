vue
<script setup lang="ts">
import { ref, computed } from "vue";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", // 项目Id：eb3d03d7-1fd2-444e-8c92-6901e93fd07f
  projectFullName: "", // 项目名称：33
  projectShortName: "", // 项目简称：33立项简称
  sellContractId: "", // 销售合同Id：7e82111f-896f-46b2-9f53-16ff9589b8c1
  sellContractCode: "", // 销售合同编号：111
  sellContractType: 0, // 销售合同类型：0
  sellContractTypeName: "", // 销售合同类型名称：未知
  attachWzhtqd: "", // 附件地址：http://192.168.8.200:9093/oss-sz-1/tyOA/Qualification/物资合同清单-5.xlsx
  isWzhtqdMapping: false,
  itemsJson: "",
  fieldMappingJson: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const tableData = ref([]);
const columns = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "物资合同明细";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value = { ..._formData };
    try {
      tableData.value = JSON.parse(_formData.itemsJson);
      const column = tableData.value[0];
      if (column) {
        const columnKeys = Object.keys(column);
        columns.value = columnKeys
          .filter(item => item != "__行数__")
          .map((item, index) => {
            return { id: item, label: item, fixed: index == 0 };
          });
      }
    } catch (error) {
      tableData.value = [];
    } finally {
      console.log("tableData", tableData.value);
    }
  }
};
defineExpose({ show });

const closeDialog = () => {};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1400"
    fullscreen
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <div style="height: calc(100vh - 49px - 24px - 62px)">
      <el-table
        :data="tableData"
        border
        stripe
        class="mb-5"
        height="100%"
        highlight-current-row
      >
        <el-table-column
          v-for="col in columns"
          :key="col.id"
          :prop="col.id"
          :fixed="col.fixed"
          :label="col.label"
          :width="col.width"
          show-overflow-tooltip
        />
      </el-table>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false"> 关闭 </el-button>
    </template>
  </el-dialog>
</template>
