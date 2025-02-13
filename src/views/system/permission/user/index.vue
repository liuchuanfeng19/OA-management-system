<script setup lang="ts">
import dayjs from "dayjs";
import { Layer } from "./types";
import { storeToRefs } from "pinia";
import { reactive, ref, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  deleteUser,
  resetPassword,
  resetAllPassword,
  getList
} from "@/api/user";
import RoleList from "./components/RoleList.vue";
import { TableProBar } from "@/components/ReTable";
import Authorize from "../components/Authorize.vue";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DepartmentTree from "../../components/DepartmentTree.vue";
import { userDepartmentStoreHook } from "@/store/modules/department";

const layerList: Layer[] = [
  { label: "最高级", value: 10 },
  { label: "第一级", value: 1 },
  { label: "第二级", value: 2 },
  { label: "第三级", value: 3 },
  { label: "第四级", value: 4 },
  { label: "第五级", value: 5 },
  { label: "第六级", value: 6 },
  { label: "第七级", value: 7 },
  { label: "第八级", value: 8 },
  { label: "第九级", value: 9 }
];
const { getDepartmentTree } = userDepartmentStoreHook();
defineOptions({
  name: "UserManage"
});

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
const user = ref({
  userId: ""
});
const tableHeight = ref(0);
const dialogFormRef = ref(null);
const roleListVisible = ref(false);
const authorizeVisible = ref(false);
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
      const { code, message } = await deleteUser({ id: row.userId });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//更多操作
const handleCommand = (command, row) => {
  if (command == "password") {
    handleResetPassword(row);
  } else if (command == "role") {
    user.value = { ...row };
    roleListVisible.value = true;
  } else if (command == "permission") {
    user.value = { ...row };
    authorizeVisible.value = true;
  }
};

// 重置密码
const handleResetPassword = _user => {
  ElMessageBox.confirm("您确定要重置该用户密码吗", "提示" || "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    type: "warning",
    draggable: true,
    lockScroll: false
  })
    .then(() => {
      console.log("resetPassword", _user.userId);
      resetPassword({ id: _user.userId }).then(res => {
        ElMessage.success(res.message || "操作成功");
      });
    })
    .catch(() => {});
};

//一键重置密码
function handleResetAll() {
  ElMessageBox.confirm("您确定要重置所有用户密码吗", "提示" || "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    closeOnClickModal: false,
    type: "warning",
    draggable: true,
    lockScroll: false
  })
    .then(() => {
      resetAllPassword().then(res => {
        ElMessage.success(res.message || "操作成功");
      });
    })
    .catch(() => {});
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange val", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data = {} } = await getList(queryForm);
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

// 格式化级别列
const layerFormatter = ({ layer }) => {
  const _layer = layerList.find(item => item.value === layer) || {};
  return _layer.label;
};

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 230;
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  nextTick(() => {
    setTableHeight();
  });
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
        <el-form-item label="用户名" prop="loginName">
          <el-input
            v-model="queryForm.loginName"
            placeholder="请输入"
            clearable
          />
        </el-form-item>
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
        title="用户列表"
        :loading="loading"
        :dataList="dataList"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            v-auth="'UserManage.add'"
            type="primary"
            :icon="useRenderIcon('add')"
            @click="handleAdd"
          >
            添加
          </el-button>
          <el-button
            v-auth="'UserManage.resetPassword'"
            type="primary"
            :icon="useRenderIcon('reset')"
            @click="handleResetAll"
          >
            一键重置密码
          </el-button>
        </template>
        <template v-slot="{ size, checkList }">
          <el-table
            border
            :size="size"
            :data="dataList"
            highlight-current-row
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
              width="160"
              label="用户名"
              prop="loginName"
              show-overflow-tooltip
            />
            <el-table-column
              width="140"
              label="姓名"
              prop="staffName"
              show-overflow-tooltip
            />
            <el-table-column
              width="100"
              label="级别"
              align="center"
              prop="layer"
              :formatter="layerFormatter"
            />
            <el-table-column
              label="所属部门"
              prop="deptName"
              width="200"
              show-overflow-tooltip
            />
            <el-table-column
              label="允许登录开始时间"
              align="center"
              width="180"
              prop="allowStartTime"
              :formatter="
                ({ allowStartTime }) => {
                  return dayjs(allowStartTime).format('YYYY-MM-DD HH:mm:ss');
                }
              "
            />
            <el-table-column
              label="允许登录结束时间"
              align="center"
              width="180"
              prop="allowEndTime"
              :formatter="
                ({ allowEndTime }) => {
                  return dayjs(allowEndTime).format('YYYY-MM-DD HH:mm:ss');
                }
              "
            />
            <el-table-column
              label="锁定登录开始时间"
              align="center"
              width="180"
              prop="lockStartDate"
              :formatter="
                ({ allowStartTime }) => {
                  return dayjs(allowStartTime).format('YYYY-MM-DD HH:mm:ss');
                }
              "
            />
            <el-table-column
              label="锁定登录结束时间"
              align="center"
              width="180"
              prop="lockEndDate"
              :formatter="
                ({ allowEndTime }) => {
                  return dayjs(allowEndTime).format('YYYY-MM-DD HH:mm:ss');
                }
              "
            />
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
              label="备注"
              :min-width="200"
              prop="remarks"
              show-overflow-tooltip
            />
            <el-table-column
              v-auth="
                'UserManage.delete|UserManage.edit|UserManage.resetPassword|UserManage.assignRoles|UserManage.assignButtons'
              "
              fixed="right"
              label="操作"
              width="150"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-auth="'UserManage.edit'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-auth="'UserManage.delete'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-dropdown
                  v-auth="
                    'UserManage.resetPassword|UserManage.assignRoles|UserManage.assignButtons'
                  "
                  @command="handleCommand($event, scope.row)"
                >
                  <el-button
                    class="ml-3"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon('more')"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-auth="'UserManage.resetPassword'"
                        command="password"
                      >
                        <el-button
                          class="reset-margin !h-20px !text-gray-500"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon('password')"
                        >
                          重置密码
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-auth="'UserManage.assignRoles'"
                        command="role"
                      >
                        <el-button
                          class="reset-margin !h-20px !text-gray-500"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon('role')"
                        >
                          分配角色
                        </el-button>
                      </el-dropdown-item>
                      <!-- <el-dropdown-item
                        v-auth="'UserManage.assignButtons'"
                        command="permission"
                      >
                        <el-button
                          class="reset-margin !h-20px !text-gray-500"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon('role')"
                        >
                          分配按钮
                        </el-button>
                      </el-dropdown-item> -->
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
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
    <DialogForm
      ref="dialogFormRef"
      :list="departmentTree"
      :layerList="layerList"
      @search="onSearch"
    />
    <RoleList
      v-model:visible="roleListVisible"
      :userId="user.userId"
      :list="departmentTree"
      @search="onSearch"
    />
    <Authorize v-model:visible="authorizeVisible" :user="user" />
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
