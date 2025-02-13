<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { getMeunTree } from "@/api/menu";
import RoleList from "./components/RoleList.vue";
import { TableProBar } from "@/components/ReTable";
import MenuTree from "../../components/MenuTree.vue";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getButtonListByMenuId, deleteButton } from "@/api/button";

defineOptions({
  name: "ButtonManage"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const menuId = ref("");
const dataList = ref([]);
const loading = ref(true);
const treeData = ref([]);
const tableHeight = ref(0);
const roleListRef = ref(null);
const dialogFormRef = ref(null);

// MenuTree 节点点击回调
const handleNodeClick = (_menuId: string) => {
  menuId.value = _menuId;
  onSearch();
};

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, menuId.value);
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row);
}

// 查看角色列表
function handleRole(row) {
  roleListRef.value.show(row);
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteButton({ id: row.funcItemId });
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
  const { data = [] } = await getButtonListByMenuId({
    menuId: menuId.value ? menuId.value : undefined
  });
  dataList.value = data;
  setTimeout(() => {
    loading.value = false;
  }, 500);
}

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - 170;
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
  const { data } = await getMeunTree();
  treeData.value = data || [];
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
    <MenuTree
      :height="tableHeight + 48 + 16"
      :treeData="treeData"
      @nodeClick="handleNodeClick"
    />
    <div class="table-container ml-2">
      <TableProBar
        title="按钮列表"
        :loading="loading"
        :dataList="dataList"
        @refresh="onSearch"
      >
        <template #buttons>
          <el-button
            v-auth="'ButtonManage.add'"
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
              fixed="left"
              label="序号"
              align="center"
              width="60"
            />
            <el-table-column
              label="菜单名称"
              align="left"
              prop="menuTitle"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              label="按钮名称"
              min-width="200"
              prop="displayName"
            />
            <el-table-column label="按钮编号" min-width="200" prop="itemName" />
            <el-table-column label="分类" align="center" prop="category" />
            <el-table-column
              v-if="false"
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
              min-width="200"
              show-overflow-tooltip
              prop="remarks"
            />
            <el-table-column
              v-auth="'ButtonManage.edit|ButtonManage.delete'"
              fixed="right"
              label="操作"
              width="200"
              align="center"
            >
              <template #default="scope">
                <el-button
                  v-auth="'ButtonManage.edit'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleEdit(scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-auth="'ButtonManage.delete'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleDelete(scope.row)"
                >
                  删除
                </el-button>
                <el-button
                  v-auth="'ButtonManage.role'"
                  link
                  type="primary"
                  :size="size"
                  @click="handleRole(scope.row)"
                >
                  角色
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-table>
        </template>
      </TableProBar>
    </div>
    <DialogForm ref="dialogFormRef" :list="treeData" @search="onSearch" />
    <RoleList ref="roleListRef" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.table-container {
  width: calc(100% - 260px);
}
</style>
