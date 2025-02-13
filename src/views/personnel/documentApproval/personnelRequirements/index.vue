<script setup lang="ts">
import { useRoute } from "vue-router";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { ref, onMounted, nextTick } from "vue";

import { emitter } from "@/utils/mitt";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { GetCommonApplyStatus4 } from "@/api/applyBusiV2";
import { tableButtons, operationButtons } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  GetListPersonnelRequirements,
  DeletePersonnelRequirements,
  permarkAsNotDisplay
} from "@/api/personnelRequirements";
// import { TableColumAudit } from "@/components/TableColumAudit";
import { TableColumOperation } from "@/components/TableColumOperation";
import { GetListNVByDeptId } from "@/api/jobs";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { storeToRefs } from "pinia";
// import { formatAuditData } from "@/utils/index";

defineOptions({
  name: "PersonnelRequirements"
});
const route = useRoute();

const title = route.meta.title as string;

const { getDepartmentTree } = userDepartmentStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
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
const JobtreeData = ref([]); //职位
const queryForm = ref({
  KeyWord: "",
  companyId: "",
  AyDeptId: "",
  AyPost: "",
  Candidate: "",
  pageIndex: 1,
  pageSize: 20
});
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

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
      const { code, message } = await DeletePersonnelRequirements({
        id: row.id
      });
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
      const { code, message } = await permarkAsNotDisplay({ id: row.id });
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
  const fileName = "人员需求审批";
  exportExcel("/api/PersonnelRequirements/ExportOne?", fileName, id.value);
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
  const { data } = await GetListPersonnelRequirements(queryForm.value);
  const _data = data.data || [];
  _data.forEach(item => {
    //格式化审核信息
    // formatAuditData(item);

    item.disabled = {};
    item.title = {};

    //编辑
    item.disabled["handleEdit"] = !item.canEdit;
    item.title["handleEdit"] = "";
    // //删除
    item.disabled["handleDelete"] = !item.canDel;
    item.title["handleDelete"] = "";
    // //审核
    item.disabled["handleAudit"] = !item.canApprove;
    item.title["handleAudit"] = "";
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
        label="申请部门"
        prop="AyDeptId"
      >
        <el-cascader
          v-model="queryForm.AyDeptId"
          clearable
          :options="departmentTree"
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
        v-show="maxItemNum >= 2 || !fold"
        label="申请岗位"
        prop="AyPost"
      >
        <el-select v-model="queryForm.AyPost" placeholder="请选择" clearable>
          <el-option
            v-for="item in JobtreeData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="关键词"
        prop="KeyWord"
      >
        <el-input
          v-model="queryForm.KeyWord"
          placeholder="申请人"
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
          <el-table-column
            label="申请部门"
            prop="ayDeptName"
            width="120"
            show-overflow-tooltip
            align="left"
          />
          <el-table-column
            label="申请岗位"
            prop="ayPost"
            width="120"
            show-overflow-tooltip
            align="left"
          />

          <el-table-column
            label="现有编制（人）"
            prop="existingStaffing"
            width="130"
            align="right"
            show-overflow-tooltip
          />

          <el-table-column
            label="实际在岗（人）"
            width="130"
            prop="actualNumber"
            show-overflow-tooltip
            align="right"
          />
          <el-table-column
            label="申请增加（人）"
            prop="ayIncrease"
            width="130"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="招聘理由"
            prop="recruitReason"
            min-width="200"
            align="left"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{
                row.recruitReason == "其他(请说明)"
                  ? row.otherRecruitReason
                  : row.recruitReason
              }}
            </template>
          </el-table-column>
          <el-table-column label="增编岗位具体要求">
            <el-table-column
              min-width="180"
              label="岗位要求"
              prop="jobRequirements"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column label="任职资格">
              <el-table-column
                label="学历要求"
                prop="educationalRequirements"
                min-width="180"
                align="letf"
                show-overflow-tooltip
              />
              <el-table-column
                label="经验要求"
                prop="experienceRequirements"
                min-width="180"
                align="letf"
                show-overflow-tooltip
              />
              <el-table-column
                label="技能要求"
                prop="techRequirements"
                min-width="180"
                align="letf"
                show-overflow-tooltip
              />
              <el-table-column
                label="其他要求"
                prop="otherRequirements"
                min-width="180"
                align="letf"
                show-overflow-tooltip
              />
            </el-table-column>
            <el-table-column
              label="建议薪资"
              prop="salaryProposal"
              width="100"
              align="right"
              show-overflow-tooltip
            />
            <el-table-column
              label="招聘方式"
              prop="recruitmentMethods"
              width="100"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="申请人"
              prop="ayStaffName"
              width="100"
              align="center"
              show-overflow-tooltip
            />
          </el-table-column>
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
