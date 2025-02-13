<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage } from "element-plus";

import { exportExcel } from "@/api/exportAll";
import { GetBiddingListNV } from "@/api/bidding";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import PrintDialog from "./components/PrintDialog.vue";
import { GetCommonApplyStatus4 } from "@/api/applyBusiV2";
import { PreviewButton } from "@/components/PreviewButton";
import { tableButtons, operationButtons } from "./constant";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getListProjCredit, DoHandle } from "@/api/projRegister";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "Prove"
});

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
const printDialogRef = ref(null);
const formRef = ref<FormInstance>();

const queryForm = ref({
  keyword: "",
  projectFullName: "",
  applyStatus: "",
  applyStartTime: "",
  applyEndTime: "",
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
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

//底单上传
function handleUpload(row) {
  dialogFormRef.value.show(row, "upload");
}

// //删除
// async function handleDelete(row) {
//   ElMessageBox.confirm("确定要删除吗?", "提示", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning"
//   })
//     .then(async () => {
//       const { code,message } = await deleteProjCredit({ id: row.id });
//       if (code==0) {
//         ElMessage.success(message);
//         onSearch();
//       }
//     })
//     .catch(() => {});
// }

//财务办理
async function handleFina(row) {
  const { code, message } = await DoHandle({ id: row.id });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

// 查看表格行
function handleRead(row) {
  if (row.applyStatus == 6) {
    //草稿状态
    dialogFormRef.value.show(row, "querydraft");
  } else {
    dialogFormRef.value.show(row, "read");
  }
}

//打印行
function handlePrint(row) {
  printDialogRef.value.show(row);
}

//导出
async function handleExport() {
  const fileName = "资信证明";
  exportExcel("/api/ProjCredit/Export?", fileName, queryForm.value);
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
  const { data } = await getListProjCredit(queryForm.value);
  const _data = data.data || [];
  _data.forEach(item => {
    if (!item.reviewers) {
      return;
    }
    let i = 0;
    item.reviewers.forEach(reviewer => {
      item["reviewerName" + i] = reviewer.reviewerName;
      item["approveTime" + i] = reviewer.approveTime;
      item["comment" + i] = reviewer.comment;
      item["isApproved" + i] = reviewer.isApproved;
      item["hasApproved" + i] = reviewer.hasApproved;
      i++;
    });
    item.disabled = {};
    item.title = {};
    //处理
    item.disabled["handleFina"] = !item.canHandle;
    item.title["handleFina"] = "";
    //编辑
    item.disabled["handleEdit"] = !item.canEdit;
    item.title["handleEdit"] = "";
    // //删除
    // item.disabled["handleDelete"] = !item.canDel;
    // item.title["handleDelete"] = "";
    //审核
    item.disabled["handleAudit"] = !item.canApprove;
    item.title["handleAudit"] = "";
    //打印
    item.disabled["handlePrint"] = item.applyStatus != 2;
    item.title["handlePrint"] =
      item.applyStatus != 2 ? "未审核通过，打印不可用" : "";
    //底单上传
    item.disabled["handleUpload"] = item.applyStatus != 2;
    item.title["handleUpload"] =
      item.applyStatus != 2 ? "财务经理未审核，不可进行底单上传" : "";
  });
  dataList.value = _data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

// 获取项目列表数据
function getProjectList() {
  GetBiddingListNV()
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
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleFina":
      handleFina(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
    case "handleUpload":
      handleUpload(row);
      break;
    case "handlePrint":
      handlePrint(row);
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
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="申请单位"
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
      title="资信证明表"
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
            label="申请单位"
            prop="reqCompany"
            min-width="150"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="申请日期"
            prop="applyTime"
            width="150"
            align="center"
            :formatter="
              ({ applyTime }) => {
                return dayjs(applyTime)
                  ? dayjs(applyTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />

          <el-table-column
            label="对方公司"
            width="150"
            prop="oppCompany"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="项目/合同名称"
            prop="projectFullName"
            min-width="200"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            label="预期日期"
            prop="planTime"
            width="150"
            align="center"
            :formatter="
              ({ planTime }) => {
                return dayjs(planTime)
                  ? dayjs(planTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />

          <el-table-column
            width="120"
            label="其他特殊要求"
            prop="specialReq"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="业务申请人"
            prop="busiStaffName"
            width="100"
            align="letf"
          />
          <el-table-column
            label="审核状态"
            prop="applyStatusExpr"
            width="120"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="备注"
            prop="applyReason"
            width="150"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="附件"
            prop="attach"
            width="150"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div v-if="row.attach">
                <PreviewButton :srcList="[row.attach]" :size="size" />
                <DownloadButton :srcList="[row.attach]" :size="size" />
              </div> </template
          ></el-table-column>

          <el-table-column label="部门经理审核">
            <el-table-column
              label="审核人"
              prop="reviewerName0"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.reviewerName0 ? row.reviewerName0 : "-" }}
              </template>
            </el-table-column>

            <el-table-column
              label="审核状态"
              prop="isApproved0"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{
                  row.isApproved0 == true && row.hasApproved0 == true
                    ? "通过"
                    : row.isApproved0 == false && row.hasApproved0 == true
                      ? "拒绝"
                      : "审核中"
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="审核意见"
              prop="comment0"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.comment0 ? row.comment0 : "-" }}
              </template>
            </el-table-column>

            <el-table-column
              label="审核时间"
              prop="approveTime0"
              min-width="180"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.approveTime0 ? row.approveTime0 : "-" }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="财务经理审核">
            <el-table-column
              label="审核人"
              prop="reviewerName1"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.reviewerName1 ? row.reviewerName1 : "-" }}
              </template>
            </el-table-column>

            <el-table-column
              label="审核状态"
              prop="isApproved1"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{
                  row.isApproved1 == true && row.hasApproved1 == true
                    ? "通过"
                    : row.isApproved1 == false && row.hasApproved1 == true
                      ? "拒绝"
                      : row.hasApproved1 == false &&
                          (row.applyStatus == "4" || row.applyStatus == "3")
                        ? "-"
                        : "审核中"
                }}
              </template>
            </el-table-column>
            <el-table-column
              label="审核意见"
              prop="comment1"
              width="150"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.comment1 ? row.comment1 : "-" }}
              </template>
            </el-table-column>

            <el-table-column
              label="审核时间"
              prop="approveTime1"
              min-width="180"
              align="center"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.approveTime1 ? row.approveTime1 : "-" }}
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="财务经办人">
            <el-table-column
              label="经办人"
              prop="finaStaffName"
              width="150"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="办理状态"
              prop="finaStatusName"
              min-width="180"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="办理时间"
              prop="finaTime"
              min-width="180"
              align="center"
              show-overflow-tooltip
            />
          </el-table-column>
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
    <PrintDialog ref="printDialogRef" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
