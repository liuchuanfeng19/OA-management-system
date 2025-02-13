<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { get1StMenuList, get1StSubMenuListById, deleteMenu } from "@/api/menu";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "MenuManage"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableRef = ref();
const maps = ref(new Map());
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const dialogFormRef = ref(null);

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show();
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//更多操作
const handleCommand = (command, row) => {
  dialogFormRef.value.show(row, command);
};

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteMenu({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        const { parentId } = row;
        if (parentId && parentId != "00000000-0000-0000-0000-000000000000") {
          const { tree, treeNode, resolve } = maps.value.get(parentId) || {}; //根据pid取出对应的节点数据
          tableRef.value.store.states.lazyTreeNodeMap.value[parentId] = [];
          if (tree) {
            load(tree, treeNode, resolve);
          } else {
            const parent = findDataById(dataList.value, parentId);
            if (parent) {
              tableRef.value.store.loadOrToggle(parent);
            }
          }
        } else {
          onSearch();
        }
      }
    })
    .catch(() => {});
}
// 表格树加载孩子数据
const load = async (tree, treeNode, resolve) => {
  maps.value.set(tree.id, { tree, treeNode, resolve }); //将当前选中节点数据存储到maps中
  const { data } = await get1StSubMenuListById({ menuId: tree.id });
  if (data && data.length > 0) {
    tree.children = data;
    tree.hasChildren = true;
  } else {
    tree.children = [];
    tree.hasChildren = false;
  }
  if (resolve) {
    resolve(data || []);
  }
};

const refreshData = async parentId => {
  if (parentId && parentId != "00000000-0000-0000-0000-000000000000") {
    const { tree, treeNode, resolve } = maps.value.get(parentId) || {}; //根据pid取出对应的节点数据
    tableRef.value.store.states.lazyTreeNodeMap.value[parentId] = [];
    if (tree) {
      load(tree, treeNode, resolve);
    } else {
      const parent = findDataById(dataList.value, parentId);
      if (parent) {
        load(parent, treeNode, resolve);
      }
    }
  } else {
    onSearch();
  }
};
function findDataById(datas, id) {
  for (let index = 0; index < datas.length; index++) {
    const item = datas[index];
    if (item.id == id) {
      return item;
    } else {
      if (item.children) {
        const data = findDataById(item.children, id);
        return data;
      }
    }
  }
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data, total } = await get1StMenuList();
  const list = data || [];
  dataList.value = resetData(list);
  totalPage.value = total;
  loading.value = false;
}

function resetData(data) {
  return data.map(item => {
    if (item.children) {
      item.children = resetData(item.children);
    }
    return item;
  });
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
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <TableProBar
      title="菜单列表"
      :loading="loading"
      :dataList="dataList"
      :tableRef="tableRef"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'MenuManage.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          :size="size"
          :height="tableHeight"
          highlight-current-row
          :data="dataList"
          :default-expand-all="false"
          row-key="id"
          lazy
          :load="load"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
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
            label="序号"
            fixed="left"
            align="center"
            prop="sequence"
            width="100"
          />
          <el-table-column
            label="菜单标题"
            fixed="left"
            prop="title"
            width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.title }}
            </template>
          </el-table-column>
          <el-table-column
            label="菜单名称"
            prop="name"
            width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="应用系统"
            prop="platform"
            width="200"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{
                row.platform == "OAWeb"
                  ? "业务端"
                  : row.platform == "bfw"
                    ? "管理端"
                    : row.platform == "app"
                      ? "手机端"
                      : ""
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="路由地址"
            width="300"
            prop="path"
            show-overflow-tooltip
          />
          <el-table-column
            width="300"
            label="组件路径"
            prop="component"
            show-overflow-tooltip
          />
          <el-table-column
            label="重定向"
            width="300"
            prop="redirect"
            show-overflow-tooltip
          />
          <el-table-column
            v-if="false"
            label="显示顺序"
            align="center"
            prop="sequence"
            width="90"
          />
          <el-table-column align="center" label="菜单图标" width="90">
            <template #default="{ row }">
              <span v-if="row.icon">
                <div v-show="row.icon" :class="['el-icon', row.icon]">
                  <component :is="useRenderIcon(row && row.icon)" />
                </div>
              </span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="菜单徽标" width="90">
            <template #default="{ row }">
              <span>
                {{ row.badge }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            label="是否隐藏"
            width="90"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>
                {{ row.isHiddenMenu ? "是" : "否" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="是否隐藏节点"
            width="110"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>
                {{ row.isHiddenNode ? "是" : "否" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="是否固定" align="center" width="90">
            <template #default="{ row }">
              <span>
                {{ row.isFixed ? "是" : "否" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="是否缓存" align="center" width="90">
            <template #default="{ row }">
              <span>
                {{ row.isKeepAlive ? "是" : "否" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-auth="
              'MenuManage.edit|MenuManage.delete|MenuManage.brother|MenuManage.addChild'
            "
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'MenuManage.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'MenuManage.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-dropdown
                v-auth="'MenuManage.addBrother|MenuManage.addChild'"
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
                      v-auth="'MenuManage.addChild'"
                      command="addChild"
                    >
                      <el-button
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                      >
                        添加子级
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item
                      v-auth="'MenuManage.brother'"
                      command="addBrother"
                    >
                      <el-button
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                      >
                        添加同级
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" :list="dataList" @search="refreshData" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
