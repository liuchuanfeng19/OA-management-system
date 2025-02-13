<script setup lang="ts">
import { storeToRefs } from "pinia";
import DepartmentTree from "../../components/DepartmentTree.vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { deleteStaff, getStaffList } from "@/api/staff";
import { reactive, ref, onMounted, nextTick } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";

defineOptions({
  name: "StaffManage"
});
const { getDepartmentTree } = userDepartmentStoreHook();
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  loginName: "",
  staffName: "",
  deptId: "",
  pageIndex: 1,
  pageSize: 20
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const dialogFormRef = ref(null);
const formRef = ref<FormInstance>();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// DepartmentTree 节点点击回调
const handleNodeClick = (_deptId: string) => {
  queryForm.deptId = _deptId;
  onSearch();
};
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show();
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row);
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteStaff({ id: row.staffId });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("val", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data = {} } = await getStaffList(queryForm);
  dataList.value = data.data;
  totalPage.value = data.totalCount;
  setTimeout(() => {
    loading.value = false;
  }, 500);
}

// 重置查询条件表单
const resetForm = () => {
  formRef.value.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 230;
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main flex">
    <DepartmentTree :treeData="departmentTree" @nodeClick="handleNodeClick" />
    <div class="table-container ml-2">
      <el-form
        ref="formRef"
        :inline="true"
        :model="queryForm"
        class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
        @keyup.enter="onSearch"
      >
        <el-form-item label="姓名" prop="staffName">
          <el-input
            v-model="queryForm.staffName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="useRenderIcon('search')"
            :loading="loading"
            @click="onSearch"
          >
            查询
          </el-button>
          <el-button :icon="useRenderIcon('refresh')" @click="resetForm">
            重置
          </el-button>
        </el-form-item>
      </el-form>
      <TableProBar
        title="职工列表"
        :loading="loading"
        :dataList="dataList"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            v-auth="'StaffManage.add'"
            type="primary"
            :icon="useRenderIcon('add')"
            @click="handleAdd"
          >
            添加
          </el-button>
        </template>
        <template v-slot="{ size, checkList }">
          <el-table
            border
            :size="size"
            highlight-current-row
            :data="dataList"
            :max-header-cell-style="{ background: '#fafafa', color: '#606266' }"
            :height="tableHeight"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              v-if="checkList.includes('勾选列')"
              type="selection"
              fixed="left"
              align="center"
              width="60"
            />
            <el-table-column
              v-if="checkList.includes('序号列')"
              type="index"
              :index="getIndex"
              fixed="left"
              label="序号"
              align="center"
              width="60"
            />
            <el-table-column
              label="员工编号"
              prop="staffCode"
              width="200"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="姓名"
              prop="staffName"
              width="120"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="部门"
              prop="deptName"
              align="left"
              show-overflow-tooltip
              width="200"
            />
            <el-table-column
              label="职务"
              width="120"
              align="left"
              show-overflow-tooltip
              prop="jobTitleName"
            />
            <el-table-column
              label="职称"
              width="120"
              align="left"
              show-overflow-tooltip
              prop="jobLevel"
            />
            <el-table-column align="center" label="性别" prop="sex" />
            <el-table-column
              align="center"
              label="手机号"
              prop="mobile"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column align="center" label="短号" prop="shortNumber" />
            <el-table-column
              align="center"
              label="办公电话"
              prop="officePhone"
              width="150"
              show-overflow-tooltip
            />
            <el-table-column
              align="center"
              label="创建时间"
              prop="createTime"
              width="180"
            />
            <el-table-column
              v-auth="'StaffManage.edit|StaffManage.delete'"
              fixed="right"
              label="操作"
              width="150"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-auth="'StaffManage.edit'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-auth="'StaffManage.delete'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-table>
          <el-pagination
            v-model:page-size="queryForm.pageSize"
            v-model:current-page="queryForm.pageIndex"
            class="flex justify-end mt-4"
            :small="size === 'small' ? true : false"
            :page-sizes="[10, 20, 30, 50, 100, 200]"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalPage"
            @size-change="onSearch"
            @current-change="onSearch"
          />
        </template>
      </TableProBar>
    </div>
    <DialogForm ref="dialogFormRef" :list="departmentTree" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.table-container {
  width: calc(100% - 296px);
}
</style>
