<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { getListByRoleNameNew } from "@/api/user";
import { removeUserRole } from "@/api/userRole";

const columns = [
  { id: "departmentName", label: "部门名称", width: "" },
  { id: "userName", label: "用户名称", width: "" },
  { id: "staffName", label: "职工名称", width: "" }
];

const dialogVisible = ref(false);
const tableData = ref([]);
const formData = ref({
  roleName: "",
  roleId: ""
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "用户列表-" + formData.value.roleName;
});

const show = row => {
  formData.value = { ...row };
  getUserList(row);
  dialogVisible.value = true;
};
defineExpose({ show });

const getUserList = async ({ roleName }) => {
  const { data } = await getListByRoleNameNew({ roleName });
  tableData.value = data || [];
};

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await removeUserRole({
        roleId: formData.value.roleId,
        userId: row.userId
      });
      if (code == 0) {
        ElMessage.success(message);
        getUserList({ ...formData.value });
      }
    })
    .catch(() => {});
}

const handleClose = done => {
  console.log("handleClose");
  done();
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :before-close="handleClose"
    :title="dialogTitle"
    width="50%"
  >
    <el-table
      border
      :data="tableData"
      stripe
      :height="400"
      highlight-current-row
    >
      <el-table-column label="序号" type="index" width="60" />
      <el-table-column
        v-for="col in columns"
        :key="col.id"
        :label="col.label"
        :prop="col.id"
        :width="col.width"
      />
      <el-table-column label="操作" align="center" width="100">
        <template #default="{ row }">
          <el-button
            v-auth="'RoleManage.delete'"
            link
            type="primary"
            @click="handleDelete(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <span>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
