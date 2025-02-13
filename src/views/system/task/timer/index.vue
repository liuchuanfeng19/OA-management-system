<script setup lang="ts">
import router from "@/router";
import { useRoute } from "vue-router";
import { ref, onMounted, watch, nextTick } from "vue";
import { FormInstance, ElMessageBox, ElMessage } from "element-plus";

import ReadDialog from "@/components/ReadDialog";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";
import { deleteJob, getJobList, updateJob, doExecute } from "@/api/task";

defineOptions({
  name: "TimerTask"
});
const title = useRoute().meta.title as string;

// 表单模型
const INITIAL_DATA = {
  isEdit: false, //是否编辑
  jobId: undefined,
  jobName: "",
  jobGroup: "",
  hour: "",
  day: "",
  month: "",
  minute: "",
  week: "",
  overTime: 0,
  retry: 0,
  jobParams: "",
  isStart: true,
  apiUrl: "",
  requestMethod: "",
  startTime: "",
  endTime: "",
  executeTime: "",
  description: "",
  cronExpression: "",
  status: 0
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref({
  jobName: "",
  group: "",
  isStart: -1,
  status: 0,
  pageIndex: 1,
  pageSize: 20
});
const tableData = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const formDialogVisible = ref(false);
const queryFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const readDialogRef = ref(null); // 表单对话框组件实例

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
  getJobList(queryForm.value)
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
        //执行
        item.disabled["handleConfirm"] = false;
        item.title["handleConfirm"] = "";
        //日志
        item.disabled["handleLog"] = false;
        item.title["handleLog"] = "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
    })
    .catch(() => {})
    .finally(() => {});

  loading.value = false;
}

function handleLog({ jobName, jobGroup, executeTime }) {
  router.push(
    "/system/task/log?jobName=" +
      jobName +
      "&jobGroup=" +
      jobGroup +
      "&executeTime=" +
      executeTime
  );
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    // case "handleExport":
    //   handleExport();
    // break;
    case "handleRead":
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleConfirm":
      handleConfirm(row);
      break;
    case "handleLog":
      handleLog(row);
      break;
  }
}

//新增操作
const handleAdd = () => {
  formData.value = Object.assign({ ...INITIAL_DATA }, { isEdit: true });
  formDialogVisible.value = true;
};

// 详情
function handleRead(row) {
  readDialogRef.value.show(row, columns);
}

// 修改表格行
function handleEdit(row) {
  formData.value = Object.assign({ ...INITIAL_DATA }, { isEdit: true, ...row });
  formDialogVisible.value = true;
}

function handleConfirm(row) {
  ElMessageBox.confirm(`确认要立即执行“${row.jobName}”任务吗?`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await doExecute({ id: row.jobId });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteJob({ id: row.jobId });
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

async function handleIsStart(row) {
  const { code, message } = await updateJob(row);
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  nextTick(() => {
    onSearch();
  });
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
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="68px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="任务名称"
        prop="jobName"
      >
        <el-input
          v-model.trim="queryForm.jobName"
          clearable
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="任务分组"
        prop="group"
      >
        <el-input
          v-model.trim="queryForm.group"
          clearable
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="是否启用"
        prop="isStart"
      >
        <el-select
          v-model="queryForm.isStart"
          filterable
          placeholder="全部"
          value-key=""
        >
          <el-option :key="-1" label="全部" :value="-1" />
          <el-option :key="1" label="是" :value="1" />
          <el-option :key="0" label="否" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 4 || !queryFold"
        label="执行状态"
        prop="status"
      >
        <el-select
          v-model="queryForm.status"
          filterable
          placeholder="全部"
          value-key=""
        >
          <el-option :key="-1" label="全部" :value="0" />
          <el-option :key="0" label="待执行" :value="1" />
          <el-option :key="1" label="成功" :value="2" />
          <el-option :key="2" label="失败" :value="3" />
          <el-option :key="3" label="暂停" :value="4" />
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
        <el-button :icon="useRenderIcon('refresh')" @click="handleReset()">
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
      :title="title"
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
            align="left"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            fixed="left"
            align="center"
            width="60"
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
              v-else-if="
                column.prop != 'isStart' && column.prop != 'executeTime'
              "
              :align="column.align"
              :label="column.label"
              :prop="column.prop"
              :fixed="column.fixed"
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
          <el-table-column
            align="center"
            label="是否启用"
            prop="isStart"
            width="110"
          >
            <template #default="{ row }">
              <el-tooltip
                :content="row.isStart === 0 ? '点击启用' : '点击禁用'"
                :enterable="false"
                placement="top"
              >
                <el-switch v-model="row.isStart" @change="handleIsStart(row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="最后执行时间"
            prop="executeTime"
            width="160"
          >
            <template #default="{ row }">
              <el-button type="text" @click="handleLog(row)">
                {{ row.executeTime }}
              </el-button>
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
    <DialogForm
      v-model:visible="formDialogVisible"
      :data="formData"
      @search="onSearch"
    />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="660" />
  </div>
</template>
