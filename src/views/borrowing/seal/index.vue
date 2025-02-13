<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick } from "vue";
import { TableProBar } from "@/components/ReTable";
import { ElMessage, FormInstance, ElMessageBox } from "element-plus";

import {
  getSealBorrowList,
  deleteSealBorrow,
  changeStatusSealBorrow,
  getNVsByCatalogKey
} from "@/api/seal";
import { emitter } from "@/utils/mitt";
import DialogForm from "./components/DialogForm.vue";
import { GetCommonApplyStatus1 } from "@/api/applyBusiV2";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { TableColumAudit } from "@/components/TableColumAudit";
import { formatAuditData } from "@/utils/index";

defineOptions({
  name: "SealBorrowing"
});
const route = useRoute();

const title = route.meta.title as string;

const { getRootDeptList } = userDepartmentStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const allapplyStatus = ref([]);
const catalogLicense = ref([]); //借阅类型
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

const queryForm = ref({
  company: "",
  sealType: "",
  applyStatus: "",
  status: "",
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
    case "handleApply":
      handleApply();
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleAudit":
      handleAudit(row);
      break;
    case "handleUse":
      handleUse(row, 0);
      break;
    case "handleBack":
      handleBack(row, 1);
      break;
  }
}
//添加
function handleApply() {
  dialogFormRef.value.show(null, "apply");
}
// 查看表格行
function handleQuery(row) {
  dialogFormRef.value.show(row, "read");
}
//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteSealBorrow({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}
//审核
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}
//领用
async function handleUse(row, status) {
  const { code, message } = await changeStatusSealBorrow({
    id: row.id,
    status: status
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}
//归还
async function handleBack(row, status) {
  const { code, message } = await changeStatusSealBorrow({
    id: row.id,
    status: status
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  // let { data } = await getSealBorrowList(queryForm.value);
  // let list = data.data || [];
  // list.forEach(item => {
  //   if (item.reviewers != null) {
  //     for (let i = 0; i < item.reviewers.length; i++) {
  //       const element = item.reviewers[i];
  //       item["auditUser" + i] = element.reviewerName;
  //       item["auditStatus" + i] = element.hasApproved
  //         ? element.isApproved
  //           ? "已通过"
  //           : "拒绝"
  //         : "-";
  //       item["auditOpinion" + i] = element.comment;
  //       item["auditTime" + i] = element.approveTime;
  //     }
  //   }
  // });
  // console.log("list--->", list);
  // dataList.value = list;
  // totalPage.value = data.totalCount;
  // loading.value = false;

  getSealBorrowList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        //格式化审核信息
        formatAuditData(item);

        item.disabled = {};
        item.title = {};

        //审核
        item.disabled["handleAudit"] = !item.canApprove;
        item.title["handleAudit"] = !item.canApprove ? "当前记录不可审核" : "";
        //编辑
        item.disabled["handleEdit"] = !(
          (item.applyStatus == 3 || item.applyStatus == 4) &&
          item.canEdit
        );
        item.title["handleEdit"] = !(
          (item.applyStatus == 3 || item.applyStatus == 4) &&
          item.canEdit
        )
          ? "当前数据不可编辑"
          : "";
        //删除
        item.disabled["handleDelete"] = !(
          (item.applyStatus == 3 || item.applyStatus == 4) &&
          item.canDel
        );
        item.title["handleDelete"] = !(
          (item.applyStatus == 3 || item.applyStatus == 4) &&
          item.canDel
        )
          ? "当前数据不可删除"
          : "";
        //领用
        item.disabled["handleUse"] = !(item.status == 1);
        item.title["handleUse"] = !(item.status == 1) ? "当前状态不可领用" : "";
        //归还
        item.disabled["handleBack"] = !(item.status == 2);
        item.title["handleBack"] = !(item.status == 2)
          ? "当前状态不可归还"
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
async function getApplyStatus() {
  const { data } = await GetCommonApplyStatus1();
  allapplyStatus.value = data;
}

// 获取印章借阅类型
const getCatalog = async () => {
  const { data } = await getNVsByCatalogKey({
    catalogKey: "OA_SealType"
  });
  catalogLicense.value = data || [];
};

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
  getCatalog();
  getApplyStatus();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
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
      label-width="80px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="公司/单位"
        prop="company"
      >
        <el-select v-model="queryForm.company" clearable placeholder="请选择"
          ><el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.fullName"
        /></el-select>
      </el-form-item>
      <el-form-item label="用章类型" prop="sealType">
        <el-select v-model="queryForm.sealType" clearable placeholder="请选择">
          <el-option
            v-for="item in catalogLicense"
            :key="item.name"
            :label="item.value"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
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
            v-for="item in allapplyStatus"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="领用状态"
        prop="status"
      >
        <el-select v-model="queryForm.status" clearable placeholder="请选择">
          <el-option label="待领用" value="1" />
          <el-option label="待归还" value="2" />
          <el-option label="已归还" value="3" />
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
          :height="tableHeight"
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
        >
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
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.prop"
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
            label="领用/归还状态"
            min-width="150"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="row.status == 1">待领用</span>
              <span v-if="row.status == 2">待归还</span>
              <span v-if="row.status == 3">已归还</span>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column
            label="领用时间"
            min-width="150"
            align="center"
            prop="useTime"
            show-overflow-tooltip
          />
          <el-table-column
            label="归还时间"
            min-width="150"
            align="center"
            prop="returnTime"
            show-overflow-tooltip
          />
          <el-table-column
            label="审核状态"
            min-width="150"
            align="center"
            prop="applyStatusExpr"
            show-overflow-tooltip
          />
          <TableColumAudit v-if="dataList" :tableData="dataList" />
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
