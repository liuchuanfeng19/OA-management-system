<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";

import { emitter } from "@/utils/mitt";
import DialogForm from "./components/DialogForm.vue";
import DialogPrint from "./components/DialogPrint.vue";
import { TableProBar } from "@/components/ReTable";
import { getListProjRegister } from "@/api/projRegister";
import { GetCommonApplyStatus1 } from "@/api/applyBusiV2";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessage, FormInstance } from "element-plus";
import { exportExcel } from "@/api/exportAll";
import { GetInListNV } from "@/api/bidding";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "Bond"
});
const route = useRoute();
const title = route.meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const allStatus = ref([]); //审核状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const dialogPrintRef = ref(null);
const projectList = ref([]); // 项目列表
const multipleSelection = ref([]); //列表选中数据存放
const queryForm = ref({
  keyword: "",
  projectFullName: "",
  applyStatus: "",
  applyStartTime: "",
  applyEndTime: "",
  payMethod: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//添加
function handleAdd() {
  dialogFormRef.value.show();
}

//编辑
function handleEdit(row) {
  if (row.canEdit == true) {
    dialogFormRef.value.show(row, "edit");
  }
}

//审批
function handleApproval(row) {
  dialogFormRef.value.show(row, "audit");
}

//底单上传
function handleUpload(row) {
  dialogFormRef.value.show(row, "upload");
}

// //办理状态
// function handleProcess(row) {
//   dialogFormRef.value.show(row, "process");
// }
// //退回日期
// function handleReturn(row) {
//   dialogFormRef.value.show(row, "return");
// }

//导出
async function handleExport() {
  const fileName = "报名费/投标保证金";
  exportExcel("/api/ProjRegister/Export?", fileName, queryForm.value);
}

// //删除
// async function handleDelete(row) {
//   ElMessageBox.confirm("确定要删除吗?", "提示", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning"
//   })
//     .then(async () => {
//       const { code,message } = await deleteProjRegister({ id: row.id });
//       if (code==0) {
//         ElMessage.success(message);
//         onSearch();
//       }
//     })
//     .catch(() => {});
// }
// // 撤销
// function handleUndo(row) {
//   dialogFormRef.value.show(row, "undo");
// }
//打印
function handlePrint(row) {
  if (row) {
    const list = [];
    list.push(row);
    dialogPrintRef.value.show(list);
  } else {
    if (multipleSelection.value.length > 0) {
      dialogPrintRef.value.show(multipleSelection.value);
    } else {
      ElMessage.warning("选择需打印项");
    }
  }
}
async function getStatus() {
  const { data } = await GetCommonApplyStatus1();
  allStatus.value = data;
}

//加载所有审核状态;
getStatus();
// 表格行选中回调resetForm
function handleSelectionChange(val) {
  multipleSelection.value = val;
}
// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}
// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  getProjectList();
  const { data } = await getListProjRegister(queryForm.value);
  const _data = data.data || [];
  _data.forEach(item => {
    item.disabled = {};
    item.title = {};

    //审核
    item.disabled["handleApproval"] = !item.canApprove;
    item.title["handleApproval"] = "";
    //编辑
    item.disabled["handleEdit"] = !item.canEdit;
    item.title["handleEdit"] = "";

    // //办理状态
    // item.disabled["handleProcess"] = !item.canEditProcessType;
    // item.title["handleProcess"] = "";

    // //退回日期
    // item.disabled["handleReturn"] = !item.canEditReturnTime;
    // item.title["handleReturn"] = "";

    //底单上传
    item.disabled["handleUpload"] = item.applyStatus != 2;
    item.title["handleUpload"] =
      item.applyStatus != 2 ? "财务经理未审核，不可进行底单上传" : "";
    return item;
  });

  dataList.value = _data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      dialogFormRef.value.show(row, "read");
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleApproval":
      handleApproval(row);
      break;
    case "handleUpload":
      handleUpload(row);
      break;
    // case "handleProcess":
    //   handleProcess(row);
    //   break;
    // case "handleReturn":
    //   handleReturn(row);
    //   break;
    case "handlePrint":
      handlePrint(row);
      break;
  }
}

// 获取项目列表数据
function getProjectList() {
  GetInListNV()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    maxItemNum.value =
      (formRef.value.$el.clientWidth -
        8 -
        32 -
        formRef.value.$el.children[formRef.value.$el.children.length - 1]
          .clientWidth) /
      (formRef.value.$el.children[0].clientWidth + 32);
    maxItemNum.value = Math.floor(maxItemNum.value);
    tableHeight.value =
      window.innerHeight - formRef.value.$el.clientHeight - 230;
  });
};

//mounted周期函数
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

emitter.on("onAuditStatusEmitter", menuName => {
  if (menuName.find(item => item == route.name)) {
    onSearch();
  }
});
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="项目名称"
        prop="projectFullName"
      >
        <el-select
          v-model="queryForm.projectFullName"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in projectList"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="审核状态"
        prop="applyStatus"
      >
        <el-select
          v-model="queryForm.applyStatus"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in allStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="开始日期"
        prop="applyStartTime"
      >
        <el-date-picker
          v-model="queryForm.applyStartTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="结束日期"
        prop="applyEndTime"
      >
        <el-date-picker
          v-model="queryForm.applyEndTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="支出类型"
        prop="payMethod"
      >
        <el-select
          v-model="queryForm.payMethod"
          clearable
          placeholder="请选择"
          :style="{ width: '100%' }"
        >
          <el-option label="报名费" value="报名费" />
          <el-option label="投标保证金/投标保函" value="投标保证金/投标保函" />
        </el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="收款单位"
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
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      :title="title"
      :loading="loading"
      :dataList="dataList"
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
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="60" />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          />
          <template v-for="column in columns" :key="column.prop">
            <el-table-column
              v-if="column.read"
              :label="column.label"
              :prop="column.prop"
              :align="column.align"
              :min-width="column.width"
              :fixed="column.fixed"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <el-text
                  type="primary"
                  class="cursor-pointer"
                  @click="handleOperation('handleRead', row)"
                >
                  {{ row[column.prop] }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :align="column.align"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
              :fixed="column.fixed"
              :formatter="column.formatter"
            >
              <template #default="{ row }">
                <template v-if="column.tableColumnSlot">
                  <component :is="column.tableColumnSlot(row)" />
                </template>
                <template v-else-if="column.formatter">
                  {{ column.formatter(row) }}
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>
              </template>
            </el-table-column>
          </template>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <DialogPrint ref="dialogPrintRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
