<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
// import { deleteMenu } from "@/api/menu";
import { GetTree, Delete } from "@/api/asset";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "AssetCategory"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableRef = ref();
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const dialogFormRef = ref(null);

// let queryForm = ref({
//   keyword: "",
//   leaveType: "",
//   applyStatus: "",
//   startTime: "",
//   endTime: "",
//   totalDays: "",
//   pageIndex: 1,
//   pageSize: 20
// });

//新增操作
// const handleAdd = () => {
//   dialogFormRef.value.show();
// };

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//更多操作
const handleCommand = (command, row) => {
  dialogFormRef.value.show(row, command);
};

//添加子级
function handleCommand1(row) {
  dialogFormRef.value.show(row, "addChild");
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await Delete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 表格行选中回调
function handleSelectionChange(val: any) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
// async function onSearch() {
//   loading.value = true;
//   let { data, total } = await getMeunTree();
//   dataList.value = data || [];
//   totalPage.value = total;
//   loading.value = false;
// }

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data, total } = await GetTree();
  dataList.value = data || [];
  totalPage.value = total;
  loading.value = false;
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
      title="类别列表"
      :loading="loading"
      :dataList="dataList"
      :tableRef="tableRef"
      @refresh="onSearch"
    >
      <template #buttons>
        <!-- <el-button
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
          v-auth="'AssetCategory.add'"
        >
          添加
        </el-button> -->
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
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            fixed="left"
            align="center"
            width="60"
          />
          <!-- <el-table-column
            v-if="checkList.includes('序号列')"
            label="序号"
            fixed="left"
            align="center"
            prop="sequence"
          /> -->
          <!-- <el-table-column
            v-if="checkList.includes('序号列')"
            label="序号"
            fixed="left"
            align="center"
            type="index"
            width="60"
          /> -->
          <el-table-column
            label="类别名称"
            fixed="left"
            prop="name"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column
            v-auth="
              'AssetCategory.edit|AssetCategory.delete|AssetCategory.addChild'
            "
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-if="
                  scope.row.parentId == '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'AssetCategory.addChild'"
                link
                type="primary"
                :size="size"
                @click="handleCommand1(scope.row)"
              >
                添加子级
              </el-button>

              <el-button
                v-if="
                  scope.row.parentId != '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'AssetCategory.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="
                  scope.row.parentId != '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'AssetCategory.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <el-dropdown
                v-auth="'AssetCategory.addChild'"
                @command="handleCommand($event, scope.row)"
              >
                <el-button
                  v-if="
                    scope.row.parentId != '00000000-0000-0000-0000-000000000000'
                  "
                  class="ml-3"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon('more')"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-auth="'AssetCategory.addChild'"
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
                    <!-- <el-dropdown-item
                      v-auth="'AssetCategory.brother'"
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
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" :list="dataList" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
