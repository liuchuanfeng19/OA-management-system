<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { GetTreeList, deleteBuySubject } from "@/api/bidding";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "Procurement"
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
const handleAdd = () => {
  dialogFormRef.value.show();
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//更多操作
// const handleCommand = (command, row) => {
//   dialogFormRef.value.show(row, command);
// };

// function handleAdd(row) {
//   dialogFormRef.value.show(row, "addChild");
// }

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
      const { code, message } = await deleteBuySubject({ id: row.id });
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
async function onSearch() {
  loading.value = true;
  const { data, total } = await GetTreeList();
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
      title="采购主体列表"
      :loading="loading"
      :dataList="dataList"
      :tableRef="tableRef"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'Procurement.add'"
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
          <el-table-column
            v-if="checkList.includes('序号列')"
            prop="sortOrder"
            label="序号"
            fixed="left"
            align="center"
          />
          <!-- <el-table-column
            v-if="checkList.includes('序号列')"
            label="序号"
            fixed="left"
            align="center"
            type="index"
            width="60"
          /> -->
          <el-table-column
            label="采购主体名称"
            fixed="left"
            prop="subjectName"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column
            v-auth="'Procurement.edit|Procurement.delete|Procurement.addChild'"
            fixed="right"
            label="操作"
            width="210"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-if="
                  scope.row.parentSubjectId ==
                  '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'Procurement.addChild'"
                link
                type="primary"
                :size="size"
                @click="handleCommand1(scope.row)"
              >
                添加子级
              </el-button>

              <el-button
                v-if="
                  scope.row.parentSubjectId !=
                  '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'Procurement.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="
                  scope.row.parentSubjectId !=
                  '00000000-0000-0000-0000-000000000000'
                "
                v-auth="'Procurement.addChild'"
                link
                type="primary"
                :size="size"
                @click="handleCommand1(scope.row)"
              >
                添加子级
              </el-button>
              <el-button
                v-auth="'Procurement.delete'"
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
