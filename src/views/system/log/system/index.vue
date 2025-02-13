<script setup lang="ts">
import dayjs from "dayjs";
import { ref, onMounted, watch, nextTick } from "vue";
// import { transformI18n } from "@/plugins/i18n";
// import DialogForm from "./components/DialogForm.vue";
// import { reactive, ref, onMounted, watch } from "vue";
import { TableProBar } from "@/components/ReTable";
import { getSysLogList } from "@/api/systemLog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import { FormInstance, ElMessageBox, ElMessage } from "element-plus";
import { FormInstance } from "element-plus";
// import { ElMessage } from "element-plus";

defineOptions({
  name: "SystemLog"
});

// 表单模型
const INITIAL_DATA = {
  sysId: undefined,
  systemName: "",
  moduleName: "",
  logDate: "",
  logLevel: "",
  message: "",
  source: "",
  stackTrace: "",
  ipAddress: "",
  computerName: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
// let switchLoadMap = ref({});
const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const levelList = ref([
  { value: "", label: "全部" },
  { value: "Verbose", label: "详细" },
  { value: "Debug", label: "调试" },
  { value: "Information", label: "普通" },
  { value: "Warning", label: "警告" },
  { value: "Error", label: "错误" },
  { value: "Fatal", label: "重大错误" }
]);
function getFromlevelList(levelValue) {
  const i = levelList.value.find(item => item.value == levelValue);
  if (i) {
    return i.label;
  } else {
    return "";
  }
}

const formRef = ref<FormInstance>();
const queryForm = ref({
  logLevel: "",
  startTime: "",
  endTime: "",
  pageIndex: 1,
  pageSize: 20
});

// const authorizeDialogVisible = ref(false);

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

// current-change 改变时触发
function handleCurrentChange() {
  //onSearch();
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
  isClickStart.value = false;
  isClickEnd.value = false;
  loading.value = true;
  const { data } = await getSysLogList(queryForm.value);
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
      <el-form-item label="日志级别" prop="logLevel">
        <el-select v-model="queryForm.logLevel" placeholder="请选择"
          ><el-option
            v-for="item in levelList"
            :key="item.value"
            :label="item.label"
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
      title="系统日志列表"
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
            align="left"
            label="系统名称"
            prop="systemName"
            show-overflow-tooltip
            width="230px"
          />
          <el-table-column
            align="left"
            label="系统模块名称"
            prop="moduleName"
            show-overflow-tooltip
          />
          <el-table-column align="left" label="日志内容" prop="message" />
          <el-table-column align="center" label="日志级别" prop="logLevel">
            <template #default="{ row }">
              {{ getFromlevelList(row.logLevel) }}
            </template>
          </el-table-column>

          <el-table-column align="center" label="ip地址" prop="ipAddress" />
          <el-table-column
            align="center"
            label="日志时间"
            prop="logDate"
            show-overflow-tooltip
          />
          <!-- <el-table-column
            fixed="right"
            label="操作"
            width="180"
            align="center"
          >
            <template #default="scope">
              <el-button
                class="reset-margin"
                type="text"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
            </template>
          </el-table-column> -->
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
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
