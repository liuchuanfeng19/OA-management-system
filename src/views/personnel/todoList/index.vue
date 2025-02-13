<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick, reactive } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  getUnProcessedFirstAuditNoticeList,
  deleteAuditNotice,
  markAsProcessed,
  markAsNotDisplay,
  getAuditTypesNV,
  batchDeleteAuditNotice
} from "@/api/auditNotice";
import { emitter } from "@/utils/mitt";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { MarkAllNoticeReceiverAsRead } from "@/api/noticeReceiver";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { TableColumOperation } from "@/components/TableColumOperation";
import AssetAudit from "@/views/administration/asset/apply/components/DialogForm.vue";
import AssetApply from "@/views/administration/asset/mineApply/components/DialogForm.vue";
import PurchasingOrderApply from "@/views/purchasing/myprocurement/components/DialogForm.vue";
import PurchasingOrderAudit from "@/views/purchasing/purchasingorder/components/DialogForm.vue";

defineOptions({
  name: "TodoList"
});

const { allMenuLeavesMap } = storeToRefs(usePermissionStoreHook());

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryData = reactive({
  keyword: "",
  pageIndex: 1,
  pageSize: 20,
  noticeType: 2,
  busiType: "",
  isProcessed: "",
  startTime: "",
  endTime: "",
  procStartTime: "",
  procEndTime: ""
});

const fold = ref(true);
const totalPage = ref(0);
const currentCom = ref();
const tableData = ref([]);
const loading = ref(true);
const maxItemNum = ref(1);
const componentRef = ref();
const auditTypes = ref([]);
const tableRef = ref(null);
const tableHeight = ref(0);
const tableSelection = ref([]); // 选中列表
const dialogFormRef = ref(null);

const formRef = ref<FormInstance>();

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  queryData.startTime = queryData.startTime == null ? "" : queryData.startTime;
  queryData.endTime = queryData.endTime == null ? "" : queryData.endTime;

  queryData.procStartTime =
    queryData.procStartTime == null ? "" : queryData.procStartTime;
  queryData.procEndTime =
    queryData.procEndTime == null ? "" : queryData.procEndTime;

  getUnProcessedFirstAuditNoticeList(queryData)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = !item.canEdit;
        item.title["handleEdit"] = !item.canEdit ? "当前记录不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = !item.canDel;
        item.title["handleDelete"] = !item.canDel ? "当前记录不可删除" : "";
        // 审核
        item.disabled["handleAudit"] = !item.canAudit;
        item.title["handleAudit"] = !item.canAudit ? "当前记录不可审核" : "";
        // 完结
        item.disabled["handleFinish"] = !item.canFinish;
        item.title["handleFinish"] = !item.canFinish ? "当前记录不可完结" : "";
        return item;
      });
      totalPage.value = data.totalCount;
    })
    .catch(() => {
      tableData.value = [];
      totalPage.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
}
//序号列
function getIndex(index) {
  const page = queryData.pageIndex;
  const pagesize = queryData.pageSize;
  return (page - 1) * pagesize + index + 1;
}
function getAuditTypes() {
  getAuditTypesNV()
    .then(({ data }) => {
      auditTypes.value = data || [];
    })
    .catch(() => {
      auditTypes.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    // case "handleAdd":
    //   handleAdd();
    //   break;
    // case "handleExport":
    //   handleExport();
    //   break;
    case "handleMarkAllRead":
      handleMarkAllRead();
      break;
    case "handleRead":
      handleRow(row, "read");
      break;
    case "handleEdit":
      handleRow(row, "edit");
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAudit":
      handleRow(row, "audit");
      break;
    case "handleFinish":
      handleRow(row, "finish");
      break;
    case "handleHidden":
      handleRow(row, "hidden");
      break;
  }
}

// //添加
// function handleAdd() {
//   dialogFormRef.value.show();
// }

/**
 * 行操作
 * @param row
 * @param handleType
 */
async function handleRow(row, handleType) {
  if (handleType == "hidden") {
    console.log("隐藏");
    const { code } = await markAsNotDisplay({ id: row.id });
    if (code == 0) {
      onSearch();
    }
    return;
  }
  if (handleType == "finish") {
    console.log("完结");
    const { code } = await markAsProcessed({ id: row.id });
    if (code == 0) {
      onSearch();
    }
    return;
  }
  const menuDialogLoader = allMenuLeavesMap.value.get(row.menuId);
  if (menuDialogLoader == undefined) {
    if (row.busiType == "资产审批") {
      if (handleType == "audit") {
        currentCom.value = AssetAudit;
      } else {
        currentCom.value = AssetApply;
      }
      nextTick(() => {
        componentRef.value.show({ id: row.busiId }, handleType);
      });
    } else if (row.busiType == "下采单") {
      if (handleType == "audit") {
        currentCom.value = PurchasingOrderAudit;
      } else {
        currentCom.value = PurchasingOrderApply;
      }
      nextTick(() => {
        componentRef.value.show({ id: row.busiId }, handleType);
      });
    }
    return;
  }
  menuDialogLoader().then(menuDialogModule => {
    currentCom.value = menuDialogModule.default;
    nextTick(() => {
      componentRef.value.show({ id: row.busiId }, handleType);
    });
  });
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const ids = row ? [row.id] : tableSelection.value.map(item => item.id);
      if (ids.length > 1) {
        batchDeleteAuditNotice({ ids }).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            onSearch();
          }
        });
      } else {
        deleteAuditNotice({ id: ids.join() }).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            onSearch();
          }
        });
      }
    })
    .catch(() => {});
}

async function handleMarkAllRead() {
  const { code, message } = await MarkAllNoticeReceiverAsRead();
  if (code == 0) {
    ElMessage.success(message);
    onSearch();

    emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  }
}

function handleRowSelect(selection, row) {
  // console.log("handleRowSelect selection", selection);
  // console.log("handleRowSelect row", row);
  if (!row.canDel) {
    ElMessage.info("该行数据不可删除");
    nextTick(() => {
      tableRef.value!.toggleRowSelection(row, undefined);
    });
  }
}

function handleAllSelect(selection) {
  // console.log("handleAllSelect selection", selection);
  if (selection) {
    selection.forEach(element => {
      if (!element.canDel) {
        nextTick(() => {
          tableRef.value!.toggleRowSelection(element, undefined);
        });
      }
    });
  }
}

function handleSelectionChange(selection) {
  // console.log("handleSelectionChange selection", selection);
  tableSelection.value = selection;
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
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

onMounted(() => {
  onSearch();
  getAuditTypes();
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
      ref="formRef"
      :inline="true"
      :model="queryData"
      label-width="96px"
      class="bg-bg_color w-[100%] pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="待办类型"
        prop="busiType"
      >
        <el-select v-model="queryData.busiType" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="(item, index) in auditTypes"
            :key="index"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="处理状态"
        prop="isProcessed"
      >
        <el-select v-model="queryData.isProcessed" clearable>
          <el-option label="全部" value="" />
          <el-option label="待办" :value="false" />
          <el-option label="已办" :value="true" />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="申请开始时间"
        prop="startTime"
      >
        <el-date-picker
          v-model="queryData.startTime"
          type="date"
          range-separator="-"
          placeholder="请选择"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :editable="false"
          :clearable="true"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="申请结束时间"
        prop="endTime"
      >
        <el-date-picker
          v-model="queryData.endTime"
          type="date"
          range-separator="-"
          placeholder="请选择"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :editable="false"
          :clearable="true"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="处理开始时间"
        prop="procStartTime"
      >
        <el-date-picker
          v-model="queryData.procStartTime"
          type="date"
          range-separator="-"
          placeholder="请选择"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :editable="false"
          :clearable="true"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="处理结束时间"
        prop="procEndTime"
      >
        <el-date-picker
          v-model="queryData.procEndTime"
          type="date"
          range-separator="-"
          placeholder="请选择"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :editable="false"
          :clearable="true"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 7 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input v-model="queryData.keyword" placeholder="标题" clearable />
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
      title="通知列表"
      :checkList="['勾选列']"
      :loading="loading"
      :tableData="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :disabled="
            item.buttonClick == 'handleDelete' && tableSelection.length < 1
              ? true
              : false
          "
          :title="
            item.buttonClick == 'handleDelete' && tableSelection.length < 1
              ? '至少勾选一行'
              : ''
          "
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          :size="size"
          row-key="id"
          :height="tableHeight"
          :data="tableData"
          highlight-current-row
          @select="handleRowSelect"
          @select-all="handleAllSelect"
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
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            fixed="left"
            width="60"
          />
          <el-table-column
            label="待办类型"
            align="left"
            width="120px"
            show-overflow-tooltip
            prop="busiType"
            fixed="left"
          />
          <el-table-column
            label="标题"
            align="left"
            show-overflow-tooltip
            prop="title1"
            min-width="200"
          />
          <el-table-column
            label="内容"
            align="left"
            min-width="200"
            show-overflow-tooltip
            prop="content"
          />
          <el-table-column
            label="申请人员"
            align="center"
            width="100"
            show-overflow-tooltip
            prop="applyStaffName"
          />
          <el-table-column
            label="申请公司"
            align="left"
            min-width="200"
            show-overflow-tooltip
            prop="applyCompanyName"
          />
          <el-table-column
            label="申请部门"
            align="left"
            min-width="200"
            show-overflow-tooltip
            prop="applyDeptName"
          />
          <el-table-column
            label="处理状态"
            align="center"
            prop="isProcessed"
            width="90"
          >
            <template #default="{ row }">
              <el-tag :type="row.isProcessed ? 'success' : 'info'" :size="size">
                {{ row.isProcessed ? "已办" : "待办" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            label="是否已读"
            align="center"
            prop="isRead"
            width="90"
            ><template #default="{ row }">{{
              row.isRead ? "已读" : "未读"
            }}</template></el-table-column
          >
          <el-table-column
            label="申请时间"
            align="center"
            prop="createTime"
            min-width="160"
            show-overflow-tooltip
          />
          <el-table-column
            label="处理时间"
            align="center"
            prop="processTime"
            min-width="160"
            show-overflow-tooltip
          >
            <template #default="{ row }">{{
              row.processTime == "0001-01-01 00:00:00" ? "-" : row.processTime
            }}</template>
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
          v-model:current-page="queryData.pageIndex"
          v-model:page-size="queryData.pageSize"
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

    <component :is="currentCom" ref="componentRef" @search="onSearch" />
  </div>
</template>
