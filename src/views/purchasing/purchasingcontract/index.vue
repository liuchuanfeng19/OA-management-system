<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";

import { emitter } from "@/utils/mitt";
import DialogForm from "./components/DialogForm.vue";
import DialogPrint from "./components/DialogPrint.vue";
import { TableProBar } from "@/components/ReTable";
import { DeleteJoinSign, GetListJoinSign } from "@/api/purchasing";
import { GetCommonApplyStatus1 } from "@/api/applyBusiV2";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { TableColumOperation } from "@/components/TableColumOperation";
import { operationButtons, columns } from "./constant";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";

defineOptions({
  name: "PurchasingContract"
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
const allapplyStatus = ref([]); //申请状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const dialogPrintRef = ref(null);
const queryForm = ref({
  keyword: "",
  applyStatus: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleApproval":
      handleApproval(row);
      break;
    case "handlePrint":
      handlePrint(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleUpload":
      handleUpload(row);
      break;
    case "handleUndo":
      handleUndo(row);
      break;
  }
}

// 撤销
function handleUndo(row) {
  dialogFormRef.value.show(row, "undo");
}
// //审批
function handleApproval(row) {
  dialogFormRef.value.show(row, "audit");
}
// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "read");
}
// 编辑表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}
//打印
function handlePrint(row) {
  dialogPrintRef.value.show(row, "");
}

//附件上传
function handleUpload(row) {
  dialogFormRef.value.show(row, "upload");
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await DeleteJoinSign({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
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

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetListJoinSign(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        // item.title = {};

        //审批
        item.disabled["handleApproval"] = !item.canApprove;
        // item.title["handleApproval"] = !item.canApprove
        //   ? "当前数据不可审批"
        //   : "";
        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        //附件上传
        item.disabled["handleUpload"] = !item.canUpdateOriginAttach;

        //删除
        item.disabled["handleDelete"] = !(
          item.applyStatus == 3 || item.applyStatus == 4
        );
        //撤销
        item.disabled["handleUndo"] = !item.canCancel;
        // item.title["handleDelete"] = !item.canDel ? "当前数据不可删除" : "";

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

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

async function getApplyStatus() {
  const { data } = await GetCommonApplyStatus1();
  allapplyStatus.value = data;
}
//加载所有申请状态;
getApplyStatus();

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
        label="申请状态"
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
        v-show="maxItemNum >= 2 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="合同摘要"
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
      </el-form-item>
    </el-form>

    <TableProBar
      :title="title"
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
          <el-table-column align="center" label="合同资料" min-width="100">
            <template #default="{ row }">
              <div
                v-show="row.attachContract != null && row.attachContract != ''"
              >
                <PreviewButton :src-list="row.attachContract" :size="size" />
                <DownloadButton :src-list="row.attachContract" :size="size" />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="原始合同"
            prop="originAttach"
            width="150"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div v-if="row.originAttach">
                <PreviewButton :srcList="row.originAttach" :size="size" />
                <DownloadButton :srcList="row.originAttach" :size="size" />
              </div> </template
          ></el-table-column>
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
    <DialogPrint ref="dialogPrintRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
