<script setup lang="ts">
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
// import { useRouter } from "vue-router";
import { reactive, ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { GetListNVByDeptId } from "@/api/jobs";
import { TableProBar } from "@/components/ReTable";
import { batchExportExcel } from "@/api/exportAll";
import FormDialog from "./components/FormDialog.vue";
import { tableButtons, operationButtons, columns } from "./constant";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { TableColumOperation } from "@/components/TableColumOperation";
import { getStaffContractList, deleteStaffContract } from "@/api/staffContract";
import ReadDialog from "@/components/ReadDialog";

defineOptions({
  name: "LaborContractManage"
});
const title = useRoute().meta.title as string;

// const router = useRouter();
const { getDepartmentTree } = userDepartmentStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  companyIds: [],
  deptId: "",
  jobTitleId: "",
  contractDate: null,
  startTime: "",
  endTime: "",
  // staffIds: [],
  pageIndex: 1,
  pageSize: 20
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const fold = ref(true);
const allData = ref([]);
const totalPage = ref(0);
const tableData = ref([]);
const loading = ref(true);
const maxItemNum = ref(1);
const deptOption = ref([]);
const tableHeight = ref(0);
const JobtreeData = ref([]);
const allClick = ref(false);
const formDialogRef = ref(null); // 表单对话框组件实例
const multipleSelection = ref([]);
const multipleTableRef = ref(null);
const formRef = ref<FormInstance>();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

// 搜索获取表格数据
async function onSearch() {
  const { contractDate, ...params } = form;
  params.startTime = contractDate ? contractDate[0] : "";
  params.endTime = contractDate ? contractDate[1] : "";
  params.companyIds = params.companyIds ? params.companyIds : [];
  const { data } = await getStaffContractList(params);
  const _data = data.data || [];
  tableData.value = _data.map(item => {
    item.disabled = {};
    item.title = {};
    // //编辑
    // item.disabled["handleEdit"] = item.inStockStatus != 1;
    // item.title["handleEdit"] =
    //   item.inStockStatus != 1 ? "已出库，不可编辑" : "";
    // //删除
    // item.disabled["handleDelete"] = item.inStockStatus != 1;
    // item.title["handleDelete"] =
    //   item.inStockStatus != 1 ? "已出库，不可删除" : "";
    return item;
  });
  totalPage.value = data.totalCount;

  //不是全选状态 判断allData里面是否否已经有tableData的数据，没有则加上
  const nids = allData.value.map(item => item.staffId).join();
  tableData.value.forEach(item => {
    if (nids.indexOf(item.staffId) == -1) {
      allData.value.push(item);
    }
  });
  //然后再判断
  tableData.value.forEach(item => {
    allData.value.forEach(sitem => {
      if (item.staffId == sitem.staffId) {
        if (sitem.isSelected) {
          nextTick(() => {
            multipleTableRef.value.toggleRowSelection(item, true);
          });
        } else {
          nextTick(() => {
            multipleTableRef.value.toggleRowSelection(item, false);
          });
        }
      }
    });
  });
  multipleSelection.value = [];
  allData.value.forEach(item => {
    if (item.isSelected) {
      multipleSelection.value.push(item);
    }
  });
  loading.value = false;
}

/**
 * 根据部门Id获取职位列表
 * @param deptId 部门Id
 */
async function getPositionList(deptId) {
  const { data } = await GetListNVByDeptId({ deptId });
  JobtreeData.value = data || [];
}

//部门选项接口
async function handleCompanyChange(vals) {
  deptOption.value = [];
  form.deptId = "";
  if (vals) {
    vals.forEach(val => {
      const dept = departmentTree.value.find(item => item.id == val);
      const newDept = JSON.parse(JSON.stringify(dept));
      if (newDept.children.length > 0) {
        newDept.disabled = true;
        deptOption.value.push(newDept);
      }
    });
  } else {
    const newDeptTree = JSON.parse(JSON.stringify(departmentTree.value));
    deptOption.value = newDeptTree
      .filter(item => item.children.length > 0)
      .map(item => {
        item.disabled = true;
        return item;
      });
  }
}

//序号列
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
  return (page - 1) * pagesize + index + 1;
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleRead":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRenewal":
      handleRenewal(row);
      break;
  }
}

// 添加表格行
function handleAdd() {
  formDialogRef.value.show(null, "add");
}

// 编辑表格行
function handleEdit(row) {
  formDialogRef.value.show(row, "edit");
}
// 续签表格行
function handleRenewal(row) {
  formDialogRef.value.show(row, "renewal");
  // router.push({ name: "LaborContractRenewalAudit" });
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteStaffContract({
        id: row.id
      });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出
function handleExport() {
  const fileName = "员工导出劳动合同管理（总）";
  const parma = Object.assign({}, form);
  // parma.staffIds = multipleSelection.value.map(item => item.staffId);
  batchExportExcel("/api/StaffContract/Export?", fileName, parma);
  resetForm();
}

//导出单选
function handleSingleRow(selection, row) {
  multipleSelection.value = [];
  allData.value.forEach(item => {
    if (item.staffId == row.staffId) {
      item.isSelected = !item.isSelected;
    }
    if (item.isSelected) {
      multipleSelection.value.push(item);
    }
  });
}

//导出多选
function handleAllSelection(selection) {
  if (selection == 0) {
    allClick.value = false;
    tableData.value.forEach(item => {
      allData.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          sitem.isSelected = false;
        }
      });
    });
  } else {
    allClick.value = true;
    tableData.value.forEach(item => {
      allData.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          sitem.isSelected = true;
        }
      });
    });
  }
  multipleSelection.value = [];
  allData.value.forEach(item => {
    if (item.isSelected) {
      multipleSelection.value.push(item);
    }
  });
}

function handleDeptChange(val) {
  form.jobTitleId = "";
  if (val) {
    getPositionList(val);
  } else {
    JobtreeData.value = [];
  }
}

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

// 重置查询条件表单
const resetForm = () => {
  JobtreeData.value = [];
  formRef.value.resetFields();
  const newDeptTree = JSON.parse(JSON.stringify(departmentTree.value));
  deptOption.value = newDeptTree
    .filter(item => item.children.length > 0)
    .map(item => {
      item.disabled = true;
      return item;
    });
  onSearch();
  allClick.value = false;
  multipleTableRef.value.clearSelection();
  multipleSelection.value = [];
  allData.value.forEach(item => {
    item.isSelected = false;
  });
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

// mounted周期函数
onMounted(async () => {
  onSearch();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  setTableHeight();
  if (departmentTree.value.length < 1) {
    await getDepartmentTree();
  }
  const newDeptTree = JSON.parse(JSON.stringify(departmentTree.value));
  deptOption.value = newDeptTree
    .filter(item => item.children.length > 0)
    .map(item => {
      item.disabled = true;
      return item;
    });
});

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};
const companyProps = {
  children: "children",
  label: "fullName",
  multiple: true,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

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
      :model="form"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="96px"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="签订公司"
        prop="companyIds"
      >
        <el-cascader
          v-model="form.companyIds"
          :options="rootDepartment"
          placeholder="请选择"
          class="w-100/100"
          clearable
          :props="companyProps"
          :show-all-levels="false"
          collapse-tags
          collapse-tags-tooltip
          @change="handleCompanyChange"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="部门"
        prop="deptId"
      >
        <el-cascader
          v-model="form.deptId"
          :options="deptOption"
          clearable
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @change="handleDeptChange"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="岗位"
        prop="jobTitleId"
      >
        <el-select v-model="form.jobTitleId">
          <el-option label="全部" value="" />
          <template v-if="form.deptId">
            <el-option
              v-for="item in JobtreeData"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </template>
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="合同起止日期"
        prop="contractDate"
      >
        <el-date-picker
          v-model="form.contractDate"
          clearable
          placeholder="请选择"
          type="daterange"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input v-model="form.keyword" placeholder="姓名" clearable />
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
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm">
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
      :dataList="tableData"
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
          ref="multipleTableRef"
          border
          :select-on-indeterminate="false"
          :size="size"
          :height="tableHeight"
          :data="tableData"
          highlight-current-row
          row-key="staffId"
          @select="handleSingleRow"
          @select-all="handleAllSelection"
        >
          <el-table-column type="selection" align="center" width="60" />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="签订时间（年）"
            align="center"
            width="130"
            prop="scSignYear"
            :formatter="
              ({ scSignYear }) => {
                return scSignYear ? dayjs(scSignYear).format('YYYY') : '-';
              }
            "
          />
          <el-table-column
            label="合同编号"
            width="180"
            align="center"
            prop="scContractCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="签订公司"
            align="left"
            min-width="180"
            prop="scCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="员工编号"
            width="180"
            align="center"
            prop="scStaffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="姓名"
            width="80"
            align="center"
            prop="scStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="合同起始"
            align="center"
            width="100"
            prop="scStartTime"
            :formatter="
              ({ scStartTime }) => {
                return scStartTime
                  ? dayjs(scStartTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="合同终止"
            align="center"
            width="100"
            prop="scEndTime"
            :formatter="
              ({ scEndTime }) => {
                return scEndTime ? dayjs(scEndTime).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column
            label="合同金额"
            align="right"
            width="100"
            prop="scAmount"
          />
          <el-table-column
            label="部门"
            align="left"
            width="150"
            show-overflow-tooltip
            prop="scDeptName"
          />
          <el-table-column
            label="岗位"
            width="100"
            align="center"
            prop="scJobTitle"
            show-overflow-tooltip
          />
          <el-table-column
            label="社保基数"
            align="right"
            width="100"
            prop="scSocialBase"
          />
          <el-table-column
            label="公积金基数"
            align="right"
            width="100"
            prop="scHouseBase"
          />
          <el-table-column
            label="签订原因"
            align="left"
            width="200"
            show-overflow-tooltip
            prop="scReason"
          />
          <el-table-column
            label="备注"
            align="left"
            width="200"
            show-overflow-tooltip
            prop="remark"
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
          v-model:page-size="form.pageSize"
          v-model:current-page="form.pageIndex"
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
    <FormDialog ref="formDialogRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-form-item__content) {
  .el-input__wrapper {
    width: 240px !important;
  }
}

:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
