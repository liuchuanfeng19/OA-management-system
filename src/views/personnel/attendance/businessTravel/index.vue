<script setup lang="ts">
import { useRoute } from "vue-router";

import { ref, onMounted, nextTick } from "vue";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import {
  getBusinessTravelList,
  GetBusiTripMethodTypesNV,
  GetBusiTripApplyStatus,
  GetBusiTripApplyTypeNV,
  deleteBusinessTravel
} from "@/api/personnel";
import { emitter } from "@/utils/mitt";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";

defineOptions({
  name: "businessTravel"
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
const BusiTripData = ref([]); //出差交通方式
const BusiTripStatusData = ref([]); //出差状态
const TripApplyType = ref([]); //出差类型
const dialogFormRef = ref(null);

const formRef = ref<FormInstance>();
const queryForm = ref({
  keyword: "",
  applyStatus: "",
  applyType: "",
  startTime: "",
  endTime: "",
  totalDays: "",
  busiTripMethod: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show();
};

// 查看表格行
function handleQuery(row) {
  if (row.applyStatus == 5) {
    dialogFormRef.value.show(row, "querydraft");
  } else {
    dialogFormRef.value.show(row, "read");
  }
}

// 审批行
function handleApproval(row) {
  dialogFormRef.value.show(row, "audit");
}

//编辑
function handleEdit(row) {
  if (row.applyStatus == 5) {
    dialogFormRef.value.show(row, "draft");
  }
  if (row.canEditActualEndTime) {
    dialogFormRef.value.show(row, "editEndTime");
  } else {
    dialogFormRef.value.show(row, "edit");
  }
}

// 撤销
function handleUndo(row) {
  if (row.applyStatus == 5) {
    dialogFormRef.value.show(row, "undodraft");
  } else {
    dialogFormRef.value.show(row, "undo");
  }
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteBusinessTravel({ id: row.id });
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

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  getBusinessTravelList(queryForm.value)
    .then(({ data }) => {
      console.log("data", data);
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        //编辑
        item.disabled["handleEdit"] = !(
          item.canEditActualEndTime || item.canEdit
        );
        item.title["handleEdit"] = !(item.canEditActualEndTime || item.canEdit)
          ? "当前数据不可编辑"
          : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";
        //审批
        item.disabled["handleApproval"] =
          !item.canApprove || item.canEditActualEndTime;
        item.title["handleApproval"] =
          !item.canApprove || item.canEditActualEndTime
            ? "当前数据不可审批"
            : "";
        //撤销
        item.disabled["handleUndo"] = !item.canCancel;
        item.title["handleUndo"] = !item.canCancel ? "当前数据不可撤销" : "";

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

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;

    case "handleQuery":
      handleQuery(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleApproval":
      handleApproval(row);
      break;
    case "handleUndo":
      handleUndo(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//获取出差交通
async function GetBusiTrip() {
  const { data } = await GetBusiTripMethodTypesNV({ includeAll: false });
  BusiTripData.value = data || {};
}

//获取出差类型
async function BusiTripType() {
  const { data } = await GetBusiTripApplyTypeNV({ includeAll: false });
  TripApplyType.value = data || {};
}

//获取出差状态
async function GetBusiStatus() {
  const { data } = await GetBusiTripApplyStatus({ includeAll: false });
  BusiTripStatusData.value = data || {};
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
onMounted(() => {
  BusiTripType();
  GetBusiStatus();
  GetBusiTrip();
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
        label="审核状态"
        prop="applyStatus"
      >
        <el-select
          v-model="queryForm.applyStatus"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in BusiTripStatusData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="交通工具"
        prop="busiTripMethod"
      >
        <el-select
          v-model="queryForm.busiTripMethod"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in BusiTripData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="出差类型"
        prop="applyType"
      >
        <el-select v-model="queryForm.applyType" clearable placeholder="请选择">
          <el-option
            v-for="item in TripApplyType"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="开始时间"
        prop="startTime"
      >
        <el-date-picker
          v-model="queryForm.startTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="结束时间"
        prop="endTime"
      >
        <el-date-picker
          v-model="queryForm.endTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="出差天数"
        prop="totalDays"
      >
        <el-input
          v-model="queryForm.totalDays"
          type="number"
          placeholder="请输入"
          clearable
        />
        <!-- <el-input-number
          v-model="queryForm.totalDays"
          :min="1"
          :max="365"
          :step="1"
          :controls="true"
          controls-position="both"
        /> -->
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 7 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="姓名,电话,目的地,事由"
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
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            width="60"
            align="center"
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
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
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
    <!-- <DialogForm
      v-model:visible="formDialogVisible"
      :data="formData"
      @search="onSearch"
    /> -->
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <!-- <ApprovalForm
      v-model:visible="ApprovalFormVisible"
      :data="formData"
      @search="onSearch"
    />
    <QueryForm
      v-model:visible="QueryFormVisible"
      :data="checkformData"
      @search="onSearch"
    /> -->
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep() {
  .el-input__wrapper {
    width: 220px;
  }
}
</style>
