<script setup lang="ts">
import dayjs from "dayjs";
import { reactive, ref, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessageBox, ElMessage } from "element-plus";

import UserList from "./components/UserList.vue";
import DialogForm from "./components/DialogForm.vue";
import Authorize from "../components/Authorize.vue";
import { TableProBar } from "@/components/ReTable";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { saveRole, getRoleList, deleteRole } from "@/api/role";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "RoleManage"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  roleName: "",
  roleCode: "",
  pageIndex: 1,
  pageSize: 20
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableData = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const role = ref({});
const switchLoadMap = ref({});
const tableHeight = ref(0);
const authorizeDialogVisible = ref(false);

const userListRef = ref(null);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);

// 搜索获取表格数据
function onSearch() {
  loading.value = true;
  getRoleList(form)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = item.allowEdit == 0;
        item.title["handleEdit"] = item.allowEdit == 0 ? "该记录不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = item.allowDelete == 0;
        item.title["handleDelete"] =
          item.allowDelete == 0 ? "该记录不可删除" : "";
        //授权
        item.disabled["handleAuth"] = false;
        item.title["handleAuth"] = "";
        //用户
        item.disabled["handleUser"] = false;
        item.title["handleUser"] = "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
      totalPage.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    // case "handleExport":
    //   handleExport();
    //   break;
    // case "handleRead":
    //   handleRead(row);
    //   break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAuth":
      handleAuth(row);
      break;
    case "handleUser":
      handleUser(row);
      break;
  }
}
//序号列
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
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
      const { code, message } = await deleteRole({ id: row.roleId });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}
// 授权
const handleAuth = row => {
  role.value = { ...row };
  authorizeDialogVisible.value = true;
};
function handleUser(row) {
  userListRef.value.show(row);
}
// current-change 改变时触发
function handleCurrentChange(val: number) {
  console.log("handleCurrentChange val", val);
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange(val: number) {
  console.log("handleSizeChange val", val);
  onSearch();
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 状态切换事件回调
function onChange(checked, { $index, row }) {
  ElMessageBox.confirm(
    `确认要 <strong>${
      row.isEnable == 0 ? "停用" : "启用"
    } </strong><strong style='color:var(--el-color-primary)'>${
      row.roleName
    }</strong>角色吗?`,
    "系统提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(async () => {
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: true
        }
      );
      const { code, message } = await saveRole(row);
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: false
        }
      );
    })
    .catch(() => {
      row.isEnable == 1 ? (row.isEnable = 0) : (row.isEnable = 1);
    });
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
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
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="角色标识" prop="roleCode">
        <el-input v-model.trim="form.roleCode" clearable placeholder="请输入" />
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
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      title="角色列表"
      :loading="loading"
      :tableData="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="tableData"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            flex="left"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            flex="left"
            align="center"
            width="60"
          />
          <el-table-column
            label="角色名称"
            width="200"
            show-overflow-tooltip
            prop="roleName"
          />
          <el-table-column
            width="200"
            label="角色标识"
            prop="roleCode"
            show-overflow-tooltip
          />
          <el-table-column label="是否允许编辑" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.allowEdit" effect="light">是</el-tag>
              <el-tag v-else type="info" effect="light">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="是否允许删除" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.allowDelete" effect="light">是</el-tag>
              <el-tag v-else type="info" effect="light">否</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            align="center"
            width="200"
            prop="isEnable"
          >
            <template #default="scope">
              <el-switch
                v-model="scope.row.isEnable"
                :size="size === 'small' ? 'small' : 'default'"
                :loading="switchLoadMap[scope.$index]?.loading"
                :disabled="scope.row.allowEdit == 0"
                :active-value="1"
                active-text="已启用"
                inactive-text="已停用"
                :inactive-value="0"
                @change="checked => onChange(checked, scope)"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="创建时间"
            align="center"
            width="180"
            prop="createTime"
            :formatter="
              ({ createTime }) => {
                return dayjs(createTime).format('YYYY-MM-DD HH:mm:ss');
              }
            "
          />
          <el-table-column
            label="角色描述"
            min-width="200"
            show-overflow-tooltip
            prop="remarks"
          />
          <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="form.pageSize"
          v-model:current-page="form.pageIndex"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <UserList ref="userListRef" />
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <Authorize v-model:visible="authorizeDialogVisible" :role="role" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
