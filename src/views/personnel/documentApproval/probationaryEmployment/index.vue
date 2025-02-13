<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { GetCommonApplyStatus4 } from "@/api/applyBusiV2";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { TableColumOperation } from "@/components/TableColumOperation";
import {
  DeleteDecasualization,
  GetListDecasualization,
  decmarkAsNotDisplay
} from "@/api/decasualization";
import { GetTreeByDeptId } from "@/api/department";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { storeToRefs } from "pinia";
import { GetListNVByDeptId } from "@/api/jobs";
import { TableColumAudit } from "@/components/TableColumAudit";
// import { formatAuditData } from "@/utils/index";

defineOptions({
  name: "ProbationaryEmployment"
});
const route = useRoute();

const title = route.meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const fold = ref(true);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const allStatus = ref([]); //审核状态
const tableHeight = ref(0);
const dialogFormRef = ref(null);
const formRef = ref<FormInstance>();
const departmentList = ref([]); //部门
const JobtreeData = ref([]); //职位

const queryForm = ref({
  KeyWord: "",
  AyCompanyId: "",
  AyDeptId: "",
  AyPostId: "",
  HireDate: "",
  DecasualizationDate: "",
  pageIndex: 1,
  pageSize: 20
});
const { getDepartmentTree } = userDepartmentStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};
// /**
//  * 根据公司Id获取部门列表
//  * @param companyId 公司Id
//  */
async function getDepartmentList(companyId) {
  if (companyId != null && companyId != "") {
    const { data } = await GetTreeByDeptId({ deptId: companyId });
    departmentList.value = data || [];
  } else {
    departmentList.value = [];
  }
}

/**
 * 根据部门Id获取职位列表
 * @param deptId 部门Id
 */
async function getPositionList(deptId) {
  if (deptId != null && deptId != "" && deptId) {
    const { data } = await GetListNVByDeptId({ deptId: deptId });
    JobtreeData.value = data || [];
  } else {
    JobtreeData.value = [];
  }
}

//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//添加
function handleAdd() {
  dialogFormRef.value.show();
}

//编辑
function handleEdit(row) {
  if (row.canEdit == true) {
    dialogFormRef.value.show(row, "edit");
  }
}

//审批
function handleAudit(row) {
  dialogFormRef.value.show(row, "audit");
}

// //删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await DeleteDecasualization({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// //隐藏
async function handleHidden(row) {
  ElMessageBox.confirm("确定要隐藏吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await decmarkAsNotDisplay({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 查看表格行
function handleRead(row) {
  if (row.applyStatus == 6) {
    //草稿状态
    dialogFormRef.value.show(row, "querydraft");
  } else {
    dialogFormRef.value.show(row, "read");
  }
}

//导出
async function handleExportOne(row) {
  const rowid = row.id;
  const id = ref({
    id: rowid
  });
  const fileName = "试用期转正审批表";
  exportExcel("/api/Decasualization/ExportOne?", fileName, id.value);
}

// // 撤销
// function handleUndo(row) {
//   if (row.applyStatus == 6) {
//     //草稿状态
//     dialogFormRef.value.show(row, "undodraft");
//   } else {
//     dialogFormRef.value.show(row, "undo");
//   }
// }

async function getStatus() {
  const { data } = await GetCommonApplyStatus4();
  allStatus.value = data;
}

//加载所有审核状态;
getStatus();

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
  const { data } = await GetListDecasualization(queryForm.value);
  const _data = data.data || [];
  _data.forEach(item => {
    //格式化审核信息
    // formatAuditData(item);

    item.disabled = {};
    item.title = {};

    //删除
    item.disabled["handleDelete"] = !item.canDel;
    item.title["handleDelete"] = "";
    //审核
    item.disabled["handleAudit"] = !item.canApprove;
    item.title["handleAudit"] = "";
    //编辑
    item.disabled["handleEdit"] = !item.canEdit;
    item.title["handleEdit"] = "";
  });
  dataList.value = _data;
  totalPage.value = data.totalCount;
  loading.value = false;
}

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};
function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExportOne":
      handleExportOne(row);
      break;
    case "handleRead":
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;

    case "handleAudit":
      handleAudit(row);
      break;

    case "handleDelete":
      handleDelete(row);
      break;

    case "handleHidden":
      handleHidden(row);
      break;
  }
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

//mounted周期函数
onMounted(async () => {
  onSearch();
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
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
        label="所属公司"
        prop="AyCompanyId"
      >
        <el-cascader
          v-model="queryForm.AyCompanyId"
          clearable
          :options="rootDepartment"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @change="getDepartmentList"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="录用部门"
        prop="AyDeptId"
      >
        <el-cascader
          v-model="queryForm.AyDeptId"
          clearable
          :options="departmentList"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @change="getPositionList"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="应聘职位"
        prop="AyPostId"
      >
        <el-select v-model="queryForm.AyPostId" clearable placeholder="请选择"
          ><el-option
            v-for="item in JobtreeData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="入职日期"
        prop="HireDate"
      >
        <el-date-picker
          v-model="queryForm.HireDate"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="转正日期"
        prop="DecasualizationDate"
      >
        <el-date-picker
          v-model="queryForm.DecasualizationDate"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="关键词"
        prop="KeyWord"
      >
        <el-input
          v-model="queryForm.KeyWord"
          placeholder="姓名"
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
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
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
            label="申请时间"
            prop="applyTime"
            width="140"
            show-overflow-tooltip
            align="left"
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
          <TableColumAudit v-if="false && dataList" :tableData="dataList" />
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
