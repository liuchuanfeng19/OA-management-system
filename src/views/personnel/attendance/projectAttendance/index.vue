<script setup lang="ts">
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import { getProjectWinBidNVList } from "@/api/projectWinBid";
import { TableProBar } from "@/components/ReTable";
import FormDialog from "./components/FormDialog.vue";
import { GetCommonApplyStatus4 } from "@/api/applyBusiV2";
import { PreviewButton } from "@/components/PreviewButton";
import { tableButtons, operationButtons } from "./constant";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { GetListProjAttend, DeleteProjAttend } from "@/api/projAttend";
import { TableColumOperation } from "@/components/TableColumOperation";
import { TableColumAudit } from "@/components/TableColumAudit";
import { formatAuditData } from "@/utils/index";
import { useDetail } from "./hooks";

defineOptions({
  name: "ProjectAttendance"
});
const route = useRoute();
const { toDetail } = useDetail();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const fold = ref(true);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const allStatus = ref([]); //审核状态
const tableHeight = ref(0);
const projectList = ref([]); // 项目列表
const dialogFormRef = ref(null);
const formRef = ref<FormInstance>();

const queryForm = ref({
  projectId: "",
  attDate: "",
  pageIndex: 1,
  pageSize: 20
});

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now();
};

//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//添加
function handleApply() {
  dialogFormRef.value.show();
}

//编辑
function handleEdit(row) {
  if (row.canEdit == true) {
    dialogFormRef.value.show(row, "edit");
  }
}

//审批
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

// //删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteProjAttend({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 查看表格行
function handleRead(row) {
  toDetail(row);
  // dialogFormRef.value.show(row, "read");
}

//导出
async function handleExport() {
  const fileName = "项目考勤表";
  exportExcel("/api/ProjAttend/ExportTemplate?", fileName, queryForm.value);
}

// // 撤销
// function handleUndo(row) {
//   if (row.applyStatus == 6) {
//     //草稿状态
//     dialogFormRef.value.show(row, "undodraft");
//   } else {
//     dialogFormRef.value.show(row, "undo");
//   }
// }

async function getStatus() {
  const { data } = await GetCommonApplyStatus4();
  allStatus.value = data;
}

//加载所有审核状态;
getStatus();

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  getProjectList();
  const { data } = await GetListProjAttend(queryForm.value);
  const _data = data.data || [];
  _data.forEach(item => {
    // //格式化审核信息
    formatAuditData(item);

    item.disabled = {};
    item.title = {};

    //编辑
    item.disabled["handleEdit"] = !item.canEdit;
    item.title["handleEdit"] = "";
    // //删除
    item.disabled["handleDelete"] = !item.canDel;
    item.title["handleDelete"] = "";
    //审核
    item.disabled["handleAudit"] = !item.canApprove;
    item.title["handleAudit"] = "";
  });
  dataList.value = _data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

// 获取项目列表数据
function getProjectList() {
  getProjectWinBidNVList()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
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
  queryForm.value.attDate = "";
  // const date = new Date();
  // const attDate = date.getMonth() + 1;
  // queryForm.value.attDate =
  //   date.getFullYear() +
  //   "-" +
  //   (attDate < 10 ? "0" + attDate.toString() : attDate);
  onSearch();
};
function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleApply":
      handleApply();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
  }
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
        prop="projectId"
      >
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in projectList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-show="maxItemNum >= 1" label="考勤月" prop="month">
        <el-date-picker
          v-model="queryForm.attDate"
          placeholder="请选择"
          format="YYYY-MM"
          value-format="YYYY-MM"
          type="month"
          :clearable="false"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <!-- <el-form-item
        label="关键词"
        prop="keyword"
        v-show="maxItemNum >= 5 || !fold"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="申请单位"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item> -->
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
      title="项目出勤表"
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
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          />

          <el-table-column
            label="姓名"
            prop="staffName"
            width="80"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            label="考勤月"
            prop="attDate"
            width="100"
            align="center"
            :formatter="
              ({ attDate }) => {
                return dayjs(attDate) ? dayjs(attDate).format('YYYY-MM') : '-';
              }
            "
          />

          <el-table-column
            label="项目名称"
            min-width="200"
            prop="projectFullName"
            show-overflow-tooltip
            align="left"
          />

          <el-table-column
            label="备注"
            prop="remark"
            min-width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="附件"
            prop="attach"
            width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div v-if="row.attach">
                <PreviewButton :srcList="[row.attach]" :size="size" />
                <DownloadButton :srcList="[row.attach]" :size="size" />
              </div> </template
          ></el-table-column>

          <TableColumAudit v-if="dataList" :tableData="dataList" />
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
    <FormDialog ref="dialogFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
