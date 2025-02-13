<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { ref, onMounted, nextTick } from "vue";

import { emitter } from "@/utils/mitt";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetAssetsApplyList } from "@/api/asset";
import { GetCommonApplyStatus3 } from "@/api/applyBusiV2";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { TableColumOperation } from "@/components/TableColumOperation";
import { operationButtons } from "./constant";

defineOptions({
  name: "AssetApply"
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
const allApplyStatus = ref([]); //审核状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);

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
//添加
// function handleAdd() {
//   dialogFormRef.value.show();
// }

//审核
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "read");
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
  GetAssetsApplyList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        //审核
        item.disabled["handleAudit"] = !item.canApprove;
        item.title["handleAudit"] = !item.canApprove ? "当前数据不可审批" : "";
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
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
  }
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD HH:mm");
}

async function getapplyStatus() {
  const { data } = await GetCommonApplyStatus3();
  allApplyStatus.value = data;
}

//加载所有审核状态;
getapplyStatus();

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

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
        label="审核状态"
        prop="applyStatus"
      >
        <el-select
          v-model="queryForm.applyStatus"
          clearable
          placeholder="请选择"
          ><el-option
            v-for="item in allApplyStatus"
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
          placeholder="资产名称"
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
          <el-table-column
            label="资产名称"
            prop="assetsName"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="资产编号"
            prop="assetsCode"
            min-width="150"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="申请人姓名"
            width="150"
            prop="staffName"
            show-overflow-tooltip
            align="left"
          />
          <!-- <el-table-column
            width="120"
            label="申请人电话"
            prop="leaveTypeExpr"
            align="center"
            show-overflow-tooltip
          /> -->
          <el-table-column
            label="申请事由"
            min-width="150"
            prop="applyReason"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            width="100"
            label="申请数量"
            prop="qty"
            align="right"
            show-overflow-tooltip
          />

          <!-- <el-table-column
            label="库存数量"
            prop="applyStatusExpr"
            width="150"
            align="right"
            show-overflow-tooltip
          /> -->
          <el-table-column
            label="状态"
            prop="applyStatusExpr"
            width="80"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            label="申请时间"
            prop="applyTime"
            width="140"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ formatDatetime(row.applyTime) }}
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="备注"
            prop="totalDays"
            width="100"
            align="left"
          /> -->
          <el-table-column
            label="资产图片"
            width="100"
            align="center"
            prop="img"
          >
            <template #default="{ row }">
              <el-image
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.img[0]"
                :preview-src-list="row.img"
                :initial-index="4"
                fit="cover"
              />
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
