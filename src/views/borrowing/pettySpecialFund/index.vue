<script setup lang="ts">
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { ElMessage, FormInstance, ElMessageBox } from "element-plus";

import {
  getFundApplyList,
  deleteFundApply,
  changeStateFundApply
} from "@/api/fundApply";
import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import FormDialog from "./components/FormDialog.vue";
import PrintDialog from "./components/PrintDialog.vue";
import { GetCommonApplyStatus1 } from "@/api/applyBusiV2";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { TableColumAudit } from "@/components/TableColumAudit";
import { formatAuditData } from "@/utils/index";

const { getRootDeptList } = userDepartmentStoreHook();
defineOptions({
  name: "SealBorrowing"
});
const route = useRoute();

const title = route.meta.title as string;

enum stateEnum {
  "全部" = 0,
  "待发放" = 1,
  "已发放" = 2,

  "已还款" = 4
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const fold = ref(true);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const tableHeight = ref(0);
const allapplyStatus = ref([]);
const dialogFormRef = ref(null);
const printDialogRef = ref(null);
const formRef = ref<FormInstance>();
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

const queryForm = ref({
  applyCompanyName: "",
  fundNature: 0,
  applyStatus: "",
  state: 0,
  pageIndex: 1,
  pageSize: 20
});

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  getFundApplyList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        //格式化审核信息
        formatAuditData(item);

        item.disabled = {};
        item.title = {};

        //审核
        item.disabled["handleAudit"] = !item.canApprove;
        item.title["handleAudit"] = !item.canApprove ? "当前记录不可审核" : "";
        //付款记录
        item.disabled["handleRecord"] = !(
          item.applyStatus == 2 && item.state == 1
        );
        item.title["handleRecord"] = !(item.applyStatus == 2 && item.state == 1)
          ? "当前记录不可添加付款记录"
          : "";
        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前数据不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
        // //办理状态
        // item.disabled["handleProcess"] = !item.canEditProcessState;
        // item.title["handleProcess"] = !item.canEditProcessState
        //   ? "当前数据不可操作"
        //   : "";
        //领用
        item.disabled["handleUse"] = !(item.state == 1);
        item.title["handleUse"] = !(item.state == 1) ? "当前状态不可领用" : "";
        //归还
        item.disabled["handleBack"] = !(
          item.applyStatus == 2 && item.state == 2
        );
        item.title["handleBack"] = !(item.applyStatus == 2 && item.state == 2)
          ? "当前状态不可归还"
          : "";
        return item;
      });
      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}
async function getApplyStatus() {
  const { data } = await GetCommonApplyStatus1();
  allapplyStatus.value = data;
}

//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleApply":
      handleApply();
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
    case "handleRecord":
      handleRecord(row);
      break;
    // case "handleProcess":
    //   handleProcess(row);
    //   break;
    case "handleUse":
      handleUse(row, 0);
      break;
    case "handleBack":
      handleBack(row, 4);
      break;
    case "handleExport":
      handleExport();
      break;
    case "handlePrint":
      handlePrint(row);
      break;
  }
}

//添加
function handleApply() {
  dialogFormRef.value.show(null, "apply");
}

//打印行
function handlePrint(row) {
  printDialogRef.value.show(row);
}

//导出
function handleExport() {
  const fileName = "备用金/专项资金";
  exportExcel("/api/FundApply/Export?", fileName, queryForm.value);
}

// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "read");
}

// // 办理状态
// function handleProcess(row) {
//   dialogFormRef.value.show(row, "process");
// }

//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteFundApply({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//审核
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

//付款记录
function handleRecord(row) {
  dialogFormRef.value.show(row, "record");
}

//领用
async function handleUse(row, state) {
  const { code, message } = await changeStateFundApply({
    id: row.id,
    state: state
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

//归还
async function handleBack(row, state) {
  ElMessageBox.confirm("确定要归还吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await changeStateFundApply({
        changeList: [
          {
            id: row.id,
            state
          }
        ]
      });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
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
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  getApplyStatus();
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
      label-width="80px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="借款单位"
        prop="applyCompanyName"
      >
        <el-select
          v-model="queryForm.applyCompanyName"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.fullName"
        /></el-select>
      </el-form-item>
      <el-form-item label="资金性质" prop="fundNature">
        <el-select
          v-model="queryForm.fundNature"
          clearable
          placeholder="请选择"
        >
          <el-option label="全部" :value="0" />
          <el-option label="因公" :value="1" />
          <el-option label="因项目" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="审核状态"
        prop="applyStatus"
      >
        <el-select
          v-model="queryForm.applyStatus"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in allapplyStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="借款状态"
        prop="state"
      >
        <el-select v-model="queryForm.state" placeholder="请选择">
          <template v-for="item in stateEnum" :key="item">
            <el-option
              v-if="isNaN(item)"
              :label="item"
              :value="stateEnum[item]"
            />
          </template>
        </el-select>
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
        >
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

          <el-table-column
            v-if="false"
            label="付款记录"
            width="200"
            align="left"
            prop="record"
            show-overflow-tooltip
          />

          <el-table-column
            label="借款状态"
            min-width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span>{{ stateEnum[row.state] }}</span>
              <!-- <span v-if="row.state == 1">待发放</span>
              <span v-if="row.state == 2">已发放</span>
              <span v-if="row.state == 3">已退回</span>
              <span v-if="row.state == 4">已还款</span>
              <span v-else /> -->
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            label="领用时间"
            min-width="150"
            align="center"
            prop="useTime"
            :formatter="
              ({ useTime }) => {
                return useTime != '1900-01-01 00:00:00' && useTime != null
                  ? dayjs(useTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />

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
    <PrintDialog ref="printDialogRef" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
