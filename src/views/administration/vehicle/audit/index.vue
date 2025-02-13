<script setup lang="ts">
import { useRoute } from "vue-router";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  GetListCarApply,
  CarApplyDelete,
  GetCarApplyStatusNV
} from "@/api/vehicle";
import { emitter } from "@/utils/mitt";
import DialogForm from "./components/DialogForm.vue";
import FormDialog from "./components/FormDialog.vue";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";
// import { TableColumAudit } from "@/components/TableColumAudit";
// import { formatAuditData } from "@/utils/index";

defineOptions({
  name: "AuditList"
});
const route = useRoute();
const title = route.meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  keyword: "",
  applyStatus: ""
});
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const formDialogRef = ref(null);
const allTypes = ref([]); //审核类型

//申请
function handleAudit() {
  dialogFormRef.value.show();
}
// //查看
function handleQuery(row) {
  if (row.applyStatus == 5) {
    //草稿状态
    dialogFormRef.value.show(row, "querydraft");
  } else {
    dialogFormRef.value.show(row, "read");
  }
}

//审批
function handleApproval(row) {
  dialogFormRef.value.show(row, "audit");
}

//还车
function handleReturn(row) {
  formDialogRef.value.show(row, "return");
}

//编辑
function handleEdit(row) {
  if (row.applyStatus == 5) {
    dialogFormRef.value.show(row, "draft");
  } else {
    dialogFormRef.value.show(row, "edit");
  }
}
// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await CarApplyDelete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      } else {
        ElMessage.error(message);
      }
    })
    .catch(() => {});
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetListCarApply(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        // //格式化审核信息
        // formatAuditData(item);

        item.disabled = {};
        item.title = {};

        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前记录不可编辑" : "";
        //审批
        item.disabled["handleApproval"] = !item.canApprove;
        item.title["handleApproval"] = !item.canApprove
          ? "当前记录不可审批"
          : "";
        //还车
        item.disabled["handleReturn"] = !item.canReturnStatus;
        item.title["handleReturn"] = !item.canReturnStatus
          ? "当前记录不可还车"
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

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAudit":
      handleAudit();
      break;

    case "handleQuery":
      handleQuery(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleApproval":
      handleApproval(row);
      break;
    case "handleReturn":
      handleReturn(row);
      break;
  }
}

//获取审核类型
async function getTypes() {
  const { data } = await GetCarApplyStatusNV();
  allTypes.value = data;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 230;
};

// mounted周期函数
onMounted(async () => {
  getTypes();
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
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item label="审核状态" prop="applyStatus">
        <el-select
          v-model="queryForm.applyStatus"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in allTypes"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryForm.keyword"
          placeholder="车辆名称"
          clearable
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
          :data="dataList"
          :height="tableHeight"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            fixed="left"
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
          <!-- <TableColumAudit v-if="dataList" :tableData="dataList" /> -->
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
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <FormDialog ref="formDialogRef" @search="onSearch" />
  </div>
</template>
