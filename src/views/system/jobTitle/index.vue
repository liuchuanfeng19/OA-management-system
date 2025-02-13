<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { ElMessage, ElMessageBox } from "element-plus";
import { ref, onMounted, watch, nextTick } from "vue";

import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deleteJobTitle, getJobTitlePagedList } from "@/api/jobs";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "jobTitleManage"
});

// 表单模型
const INITIAL_DATA = {
  jobTitleId: "00000000-0000-0000-0000-000000000000",
  fullName: "",
  shortName: "",
  deptId: "00000000-0000-0000-0000-000000000000",
  jobResponsibility: "",
  jobCompetency: "",
  jobDoc: "",
  extend1: "",
  extend2: "",
  extend3: "",
  remarks: "",
  creater: "",
  createTime: "",
  modifier: "",
  modifyTime: "",
  isValid: true
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableData = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const queryFormRef = ref<FormInstance>();
const queryForm = ref({
  keyword: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formDialogVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);

// 搜索获取表格数据
function onSearch() {
  loading.value = true;
  getJobTitlePagedList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = false;
        item.title["handleEdit"] = "";
        //删除
        item.disabled["handleDelete"] = false;
        item.title["handleDelete"] = "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
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
  }
}

// // 查看表格行
// function handleRead(row) {
//   dialogFormRef.value.show(row, "read");
// }

//新增操作
const handleAdd = () => {
  formData.value = { ...INITIAL_DATA };
  formDialogVisible.value = true;
};

// 修改表格行
function handleEdit(row) {
  formData.value = Object.assign({ ...INITIAL_DATA }, { id: row.jobTitleId });
  formDialogVisible.value = true;
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteJobTitle({ id: row.jobTitleId });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    queryItemMaxNum.value =
      (queryFormRef.value.$el.clientWidth -
        8 -
        32 -
        queryFormRef.value.$el.children[
          queryFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (queryFormRef.value.$el.children[0].clientWidth + 32);
    queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
    tableHeight.value =
      window.innerHeight - queryFormRef.value.$el.clientHeight - 230;
  });
};

//mounted周期函数
onMounted(() => {
  onSearch();
  setTableHeight();
  // nextTick(() => {
  //   tableHeight.value =
  //     window.innerHeight - queryFormRef.value.$el.clientHeight - 242;
  // });
  // window.onresize = function () {
  //   nextTick(() => {
  //     tableHeight.value =
  //       window.innerHeight - queryFormRef.value.$el.clientHeight - 242;
  //   });
  // };
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
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="岗位全称"
          clearable
          @keyup.enter="onSearch"
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
        <el-button
          :icon="useRenderIcon('refresh')"
          @click="resetForm(queryFormRef)"
        >
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="queryFold">展开</span>
          <span v-show="!queryFold">折叠</span>
          <IconifyIconOffline :icon="!queryFold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      title="岗位列表"
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
          :default-expand-all="false"
          row-key="path"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            width="60"
            align="center"
            header-align="center"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="70"
            align="center"
            header-align="center"
          />
          <el-table-column
            label="全称"
            prop="fullName"
            show-overflow-tooltip
            align="left"
            header-align="center"
            min-width="200"
          />
          <el-table-column
            label="简称"
            prop="shortName"
            show-overflow-tooltip
            align="left"
            header-align="center"
            min-width="200"
          />
          <el-table-column
            label="部门"
            prop="deptName"
            show-overflow-tooltip
            align="left"
            header-align="center"
            min-width="200"
          />
          <el-table-column
            label="岗位职责"
            prop="jobResponsibility"
            show-overflow-tooltip
            align="left"
            header-align="center"
            min-width="200"
          />
          <el-table-column
            label="任职资格"
            prop="jobCompetency"
            show-overflow-tooltip
            align="left"
            header-align="center"
            min-width="200"
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
          v-model:current-page="queryForm.pageIndex"
          v-model:page-size="queryForm.pageSize"
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
    <DialogForm
      v-model:visible="formDialogVisible"
      :data="formData"
      @search="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
