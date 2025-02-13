<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, watch, nextTick } from "vue";

import { FormInstance } from "element-plus";
import { TableProBar } from "@/components/ReTable";
import { getOpLogList, getOpLogTypes } from "@/api/systemLog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "OperationLog"
});

// 表单模型
const INITIAL_DATA = {
  optId: undefined,
  userId: "",
  userName: "",
  opType: 0,
  targetSource: "",
  opMessage: "",
  logDate: "",
  ipAddress: "",
  computerName: "",
  curBrowser: "",
  opTypeName: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const opTypes = ref([]);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const formRef = ref<FormInstance>();
const queryForm = ref({
  opType: 0,
  startTime: "",
  endTime: "",
  pageIndex: 1,
  pageSize: 20
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formDialogVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
const isClickStart = ref(false);
const isClickEnd = ref(false);
const disabledStartDate = (time: Date) => {
  const today = new Date();
  if (isClickEnd.value) {
    if (queryForm.value.endTime != null && queryForm.value.endTime != "") {
      const endD = new Date(queryForm.value.endTime);
      const endDY = endD.getFullYear();
      const sD = new Date(endDY.toString() + "-01-01 00:00:00");
      return time.getTime() > endD.getTime() || time.getTime() < sD.getTime();
    }
  }
  //默认设置到今天
  return time.getTime() > today.getTime();
};
function handleStartTimeChange(val) {
  console.log(val);
  if (val != null) {
    if (!isClickEnd.value) {
      const today = new Date();
      const startD = new Date(queryForm.value.startTime);
      const startDY = startD.getFullYear();
      if (startDY < today.getFullYear()) {
        queryForm.value.endTime = startDY.toString() + "-12-31 23:59";
      } else {
        queryForm.value.endTime = dayjs().format("YYYY-MM-DD HH:mm");
      }
    }
    isClickStart.value = true;
    isClickEnd.value = false;
  }
}
const disabledEndDate = (time: Date) => {
  const today = new Date();
  if (isClickStart.value) {
    if (queryForm.value.startTime != null && queryForm.value.startTime != "") {
      const startD = new Date(queryForm.value.startTime);
      const startDY = startD.getFullYear();
      if (startDY < today.getFullYear()) {
        const eD = new Date(startDY.toString() + "-12-31 23:59:59");
        return (
          time.getTime() < startD.getTime() || time.getTime() > eD.getTime()
        );
      } else {
        return (
          time.getTime() > today.getTime() || time.getTime() < startD.getTime()
        );
      }
    }
  }
  //默认设置到今天
  return time.getTime() > today.getTime();
};
function handleEndTimeChange(val) {
  console.log(val);
  if (val != null) {
    if (!isClickStart.value) {
      const endD = new Date(queryForm.value.endTime);
      const endDY = endD.getFullYear();
      queryForm.value.startTime = endDY.toString() + "-01-01 00:00:00";
    }
    isClickStart.value = false;
    isClickEnd.value = true;
  }
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  isClickStart.value = false;
  isClickEnd.value = false;
  loading.value = true;
  const { data } = await getOpLogList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  reloadTimeRage();
  onSearch();
};

async function getAllOpLogList() {
  let { data } = await getOpLogTypes();
  data = data || [];
  data.unshift({ value: 0, name: "全部", remark: "" });
  opTypes.value = data;
}
//加载所有操作类型;
getAllOpLogList();

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 230;
};
//mounted周期函数
onMounted(() => {
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

function reloadTimeRage() {
  const time1 = dayjs().format("YYYY-MM-DD") + " 00:00:00";
  const time2 = dayjs().format("YYYY-MM-DD HH:mm:ss");
  queryForm.value.startTime = time1;
  queryForm.value.endTime = time2;
}
reloadTimeRage();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item label="操作类型：" prop="opType">
        <el-select v-model="queryForm.opType" placeholder="全部"
          ><el-option
            v-for="item in opTypes"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="起始时间" prop="startTime">
        <el-date-picker
          v-model="queryForm.startTime"
          format="YYYY-MM-DD HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          type="datetime"
          :disabledDate="disabledStartDate"
          @change="handleStartTimeChange"
        />
      </el-form-item>
      <el-form-item label="截止时间" prop="endTime">
        <el-date-picker
          v-model="queryForm.endTime"
          format="YYYY-MM-DD HH:mm"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          :disabledDate="disabledEndDate"
          @change="handleEndTimeChange"
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
      </el-form-item>
    </el-form>

    <TableProBar
      title="操作日志列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons />
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
            align="left"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            align="left"
            width="60"
          />
          <el-table-column
            align="center"
            label="用户名称"
            prop="userName"
            show-overflow-tooltip
            width="230px"
          />
          <el-table-column
            align="center"
            label="所属模块"
            prop="opTypeName"
            show-overflow-tooltip
          />
          <el-table-column
            align="left"
            label="操作日志内容"
            prop="opMessage"
            show-overflow-tooltip
          />
          <el-table-column align="center" label="登录IP" prop="ipAddress" />
          <el-table-column
            align="center"
            label="访问时间"
            prop="logDate"
            show-overflow-tooltip
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryForm.pageSize"
          v-model:current-page="queryForm.pageIndex"
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
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
