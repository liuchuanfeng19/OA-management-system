<script setup lang="ts">
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ref, computed, reactive, watch } from "vue";
import { ElMessage, FormInstance, ElTree } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DepartmentTree from "@/views/system/components/DepartmentTree.vue";

import { getStaffList } from "@/api/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["select"]);

const { getDepartmentTree } = userDepartmentStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "选择人员";
});
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  loginName: "",
  staffName: "",
  deptId: ""
});

const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// DepartmentTree 节点点击回调
const handleNodeClick = (_deptId: string) => {
  queryForm.deptId = _deptId;
  onSearch();
};

const filterText = ref("");
const treeRef = ref<InstanceType<typeof ElTree>>();

const multipleSelection = ref([]);
const tableData = ref([]);
const selectData = ref([]);
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
// 子组件暴露给父组件调用的方法
const show = async _selectData => {
  dialogVisible.value = true;
  tableData.value = [];
  selectData.value = Object.assign([], _selectData);
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  onSearch();
};
defineExpose({ show });

// 获取表格数据
async function onSearch() {
  requestLoading.value = true;
  tableData.value = [];
  getStaffList(queryForm)
    .then(({ data }) => {
      tableData.value = data.data || [];
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}
watch(filterText, val => {
  treeRef.value!.filter(val);
});

function handleSelectionChange(val) {
  multipleSelection.value = val;
}
// 提交表单
const submitForm = _.debounce(() => {
  if (multipleSelection.value.length > 0) {
    emit("select", multipleSelection.value);
    dialogVisible.value = false;
  } else {
    ElMessage.warning("请选择人员");
  }
  console.log("multipleSelection.value", multipleSelection.value);
}, 300);

//关闭对话框
const closeDialog = () => {
  selectData.value = [];
  tableData.value = [];
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1030"
    draggable
    append-to-body
    @close="closeDialog"
  >
    <el-row :gutter="20">
      <el-col :span="6">
        <DepartmentTree
          :treeData="departmentTree"
          @nodeClick="handleNodeClick"
        />
      </el-col>
      <el-col :span="18" :offset="0">
        <el-form
          ref="queryFormRef"
          :inline="true"
          :model="queryForm"
          class="bg-bg_color w-100/100 pl-2 mb-2"
          @keyup.enter="onSearch"
          @submit.prevent
        >
          <el-form-item label="姓名" prop="staffName">
            <el-input
              v-model.trim="queryForm.staffName"
              placeholder="人员姓名"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="useRenderIcon('search')"
              :loading="requestLoading"
              @click="onSearch"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
        <el-table
          border
          :height="420"
          highlight-current-row
          :data="tableData"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="60" />
          <el-table-column
            fixed="left"
            type="index"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="姓名"
            prop="staffName"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="公司"
            prop="companyName"
            align="left"
            show-overflow-tooltip
            width="200"
          />

          <el-table-column
            label="部门"
            prop="deptName"
            align="left"
            show-overflow-tooltip
            width="150"
          />

          <el-table-column
            align="center"
            label="手机号"
            prop="mobile"
            width="150"
            show-overflow-tooltip
          />

          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="loading"
        @click="submitForm()"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<style>
.tree {
  box-sizing: border-box;
  height: 420px;
  margin-top: 10px;
  overflow: hidden;
}
</style>
