<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import StopLeaseForm from "./components/StopLeaseForm.vue";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import { GetBuildsStatusNV, GetLeaseList, DeleteLease } from "@/api/builds";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "LeaseList"
});

const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const allBuildsStatus = ref([]); //房屋状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const stopLeaseForm = ref(null);
const readDialogRef = ref(null); // 表单对话框组件实例

const queryForm = ref({
  keyword: "",
  startTime: "",
  endTime: "",
  pageIndex: 1,
  pageSize: 20
});

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetLeaseList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前数据不可编辑" : "";
        //编辑
        item.disabled["handleWithdrawal"] = !item.canEdit;
        item.title["handleWithdrawal"] = !item.canEdit
          ? "当前数据不可退租"
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

//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleWithdrawal":
      handleWithdrawal(row);
      break;
    case "handleQuery":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

//添加
function handleAdd() {
  dialogFormRef.value.show();
}

//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// 退租
function handleWithdrawal(row) {
  stopLeaseForm.value.show(row, "withdrawal");
}

//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteLease({ id: row.id });
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
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

//获取房屋状态
async function getBuildsStatus() {
  const { data } = await GetBuildsStatusNV({ includeAll: false });
  allBuildsStatus.value = data;
}

//加载所有房屋状态;
getBuildsStatus();

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
      <!-- <el-form-item label="房屋状态" prop="status">
        <el-select
          clearable
          v-model="queryForm.status"
          placeholder="请选择房屋状态"
          ><el-option
            v-for="item in allBuildsStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item> -->
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
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
        v-show="maxItemNum >= 2 || !fold"
        label="到期时间"
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
        v-show="maxItemNum >= 3 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="租赁人、房屋名称"
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
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
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
            label="租赁人"
            prop="staffName"
            width="100"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="房屋名称"
            prop="buildsName"
            min-width="150"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="房间名称"
            prop="roomName"
            min-width="150"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            width="100"
            label="付款方式"
            prop="renterMethodExpr"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="租金"
            width="80"
            prop="renterAmount"
            show-overflow-tooltip
            align="right"
          />

          <el-table-column
            label="租赁方式"
            prop="leaseTypeExpr"
            width="100"
            align="center"
          />
          <el-table-column
            label="租赁状态"
            prop="leaseStatusExpr"
            width="100"
            align="center"
          />
          <el-table-column
            label="开始时间"
            prop="startTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.startTime) }}
            </template>
          </el-table-column>

          <el-table-column
            label="到期时间"
            prop="endTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDatetime(row.endTime) }}
            </template>
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
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <StopLeaseForm ref="stopLeaseForm" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="671" :column="2" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
