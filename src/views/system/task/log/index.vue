<script setup lang="ts">
import moment from "moment";
import { useRoute } from "vue-router";
import { FormInstance } from "element-plus";
import { ref, onMounted, watch, nextTick } from "vue";

import { getJobLogList } from "@/api/task";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "TimerTaskLog"
});

const shortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    }
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    }
  }
];
// 表单模型
const INITIAL_DATA = {
  jobId: undefined,
  jobName: "",
  jobGroup: "",
  executeTime: "",
  jobMessage: "",
  status: 0
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref<any>({
  jobName: "",
  jobGroup: "",
  status: 0,
  executeTime: "",
  beginTime: "",
  endTime: "",
  pageIndex: 1,
  pageSize: 20
});
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formRef = ref<FormInstance>();

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formDialogVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);

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
  loading.value = true;
  const { executeTime, ..._queryForm } = queryForm.value;
  _queryForm.beginTime = executeTime[0];
  _queryForm.endTime = executeTime[1];
  const { data } = await getJobLogList(_queryForm);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  queryForm.value.executeTime = "";
  onSearch();
};

function handleTimeRageChange(dateArr) {
  if (!dateArr || dateArr.length < 2) {
    queryForm.value.beginTime = moment().format("YYYY-MM-DD 00:00:00");
    queryForm.value.endTime = moment()
      .add(1, "m")
      .format("YYYY-MM-DD HH:mm:00");
    return;
  }
  queryForm.value.beginTime = dateArr[0];
  queryForm.value.endTime = dateArr[1];
}

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

const route = useRoute();

const query = route.query as any;
queryForm.value = Object.assign(queryForm.value, { ...query, status: 0 });
if (queryForm.value.executeTime) {
  queryForm.value.executeTime = [
    moment(queryForm.value.executeTime).format("YYYY-MM-DD 00:00:00"),
    moment(queryForm.value.executeTime)
      .add(1, "m")
      .format("YYYY-MM-DD HH:mm:00")
  ];
} else {
  queryForm.value.executeTime = [
    moment().format("YYYY-MM-DD 00:00:00"),
    moment().add(1, "m").format("YYYY-MM-DD HH:mm:00")
  ];
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item label="任务名称" prop="jobName">
        <el-input
          v-model.trim="queryForm.jobName"
          clearable
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="任务分组" prop="jobGroup">
        <el-input
          v-model.trim="queryForm.jobGroup"
          clearable
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="执行状态" prop="status">
        <el-select v-model="queryForm.status" filterable placeholder="全部">
          <el-option :key="0" label="全部" :value="0" />
          <el-option :key="1" label="成功" :value="2" />
          <el-option :key="2" label="失败" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="执行时间" prop="executeTime" style="width: 380px">
        <el-date-picker
          v-model="queryForm.executeTime"
          align="right"
          end-placeholder="结束日期"
          format="YYYY-MM-DD HH:mm"
          :shortcuts="shortcuts"
          range-separator="至"
          start-placeholder="开始日期"
          type="datetimerange"
          :editable="false"
          :clearable="false"
          value-format="YYYY-MM-DD HH:mm:00"
          @calendar-change="handleTimeRageChange"
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
      title="任务日志列表"
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
            label="任务名称"
            prop="jobName"
            show-overflow-tooltip
            width="300"
          />
          <el-table-column
            align="center"
            label="任务分组"
            prop="jobGroup"
            show-overflow-tooltip
            width="200"
          />
          <el-table-column align="center" label="执行状态" width="200">
            <template #default="{ row }">
              <el-tag :type="row.status == 2 ? 'success' : 'danger'">
                {{ row.status == 2 ? "成功" : "失败" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="执行时间"
            prop="executeTime"
            width="200"
          />
          <el-table-column
            align="center"
            label="日志内容"
            prop="jobMessage"
            show-overflow-tooltip
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
  </div>
</template>
