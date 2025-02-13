<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick } from "vue";

import { columns } from "./constant";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import {
  GetListReqOrderItem,
  doCollectItem,
  GetReqOrderItem
} from "@/api/reqOrderItem";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
// import type { Action } from "element-plus";
import { operationButtons } from "./constant";
import { userProjectStoreHook } from "@/store/modules/project";
import { TableColumOperation } from "@/components/TableColumOperation";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "PurchasingDetail"
});

const title = useRoute().meta.title as string;
const { getProjectWinBidNVList } = userProjectStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const multipleSelection = ref([]); //列表选中数据存放
const IdData = ref([]);
const columnList = ref([]);
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

const queryForm = ref({
  keyword: "",
  projectId: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//批量认领
function handleMore() {
  ElMessageBox.confirm(`请确认是否要领取`, "系统提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
    dangerouslyUseHTMLString: true,
    draggable: true
  }).then(async () => {
    const { code, message } = await doCollectItem(IdData.value);
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}

//认领
async function handleCollect(row) {
  const id = row.id.split(",");
  console.log("id", id);
  const { code, message } = await doCollectItem(id);
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

// // 查看表格行
// function handleQuery(row) {
//   dialogFormRef.value.show(row, "query");
// }

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
  multipleSelection.value = val;

  IdData.value = multipleSelection.value.map(item => {
    return item.id;
  });
  // console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetListReqOrderItem(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });
      if (dataList.value.length > 0) {
        const item = dataList.value[0];
        columnList.value = item.siteItems || [];
      }

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
    case "handleMore": //多条领取
      handleMore();
      break;
    case "handleCollect": //认领
      handleCollect(row);
      break;
    case "handleQuery":
      GetReqOrderItem({
        id: row.id
      }).then(({ data }) => {
        readDialogRef.value.show(data, columns);
      });

      break;
  }
}

// //切换“折叠”与“展开”
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
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
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
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="项目名称"
        prop="projectId"
      >
        <el-select v-model="queryForm.projectId" clearable placeholder="请选择">
          <el-option label="全部" value="" />
          <el-option
            v-for="item in winBidProjectNVList"
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
          placeholder="设备名称"
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
      title="待领列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'PurchasingDetail.collectMore'"
          :disabled="multipleSelection.length < 1"
          type="primary"
          @click="handleMore"
        >
          领取
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
          row-key="id"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" align="center" width="60" />
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
            label="项目名称"
            min-width="240"
            prop="projectFullName"
            show-overflow-tooltip
            align="left"
          />

          <el-table-column
            label="设备名称"
            width="150"
            prop="materialName"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="规格型号"
            min-width="150"
            prop="materialSpec"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="参数要求"
            min-width="240"
            prop="materialParams"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="单位"
            prop="materialUnit"
            width="80"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="数量"
            width="80"
            prop="materialQty"
            show-overflow-tooltip
            align="right"
          />

          <el-table-column
            label="备注"
            prop="remark"
            min-width="150"
            align="letf"
            show-overflow-tooltip
          />
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
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="1000" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
