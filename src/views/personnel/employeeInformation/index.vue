<script setup lang="ts">
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, onMounted, nextTick, watch } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  getStaffList,
  deleteStaffList,
  GeMyJobStatusListNv,
  GetStaffJobTypes,
  getEducationLevelNV
  // GetStaffOffDetail,
  // GetStaffOnDetail
} from "@/api/personnel";
import { useDetail } from "./hooks";
import { getalljobtitle } from "@/api/jobs";
import { TableProBar } from "@/components/ReTable";
import { batchExportExcel } from "@/api/exportAll";
import PositiveForm from "./components/PositiveForm.vue";
import DepartureForm from "./components/DepartureForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useEmployeeInformationStoreHook } from "@/store/modules/employeeInformation";
import { userDepartmentStoreHook } from "@/store/modules/department";

defineOptions({
  name: "EmployeeInformation"
});

const { getDepartmentTree } = userDepartmentStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
const { toDetail } = useDetail();
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: undefined,
  staffName: "", //人员姓名
  mobile: "", //手机号
  deptId: "", //部门id
  deptName: "", //部门名称
  jobTitle: "", //岗位
  jobTitleId: "", //岗位绑定
  startDate: "", //入职时间
  usedName: "",
  staffCode: "",
  sex: "男",
  birthday: "",
  idCard: "",
  policy: "",
  major: "",
  degree: "",
  educationLevel: "",
  nationality: "",
  healthInfo: "",
  maritalStatus: "",
  height: 0,
  weight: 0,
  jobType: 1,
  residentPlace: "",
  homeAddress: "",
  emergencyContact: "",
  emergencyContactNumber: "",
  email: "",
  probationPeriod: "", //试用期月数
  onPlanDate: "",
  onRealDate: "",
  JobStatus: "",
  opDateL: "",
  comment: "",
  isConfirmed: true,
  jobStatusExpr: "",
  jobTypeExpr: "",
  qq: "",
  shortNumber: "", //分机号
  offRealDate: "",
  offComment: "",
  onComment: "",
  jobStatus: 5,
  sequence: 0
};

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法

const jobStatus2 = ref([]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const deptOption = ref([]);
const JobtreeData = ref([]);
const jobStatusData = ref([]);
const educationLevelList = ref([]);
const JobTypeData = ref([]);
const tableHeight = ref(0);
// let switchLoadMap = ref({});
const PositiveVisible = ref(false);
const DepartureVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formRef = ref<FormInstance>();
const multipleSelection = ref([]);
const allData = ref([]);
const allClick = ref(false);
const multipleTableRef = ref(null);
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const { queryFormData } = storeToRefs(useEmployeeInformationStoreHook());

// vue3 使用从vue导入的watch函数监听响应式数据
//转正
watch(
  () => PositiveVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);
//离职
watch(
  () => DepartureVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);

// async function handlePositive(row) {
//   //获取后台该数据全部信息接口
//   let { data } = await GetStaffOnDetail({
//     staffId: row.staffId
//   });
//   formData.value = { ...data };
//   PositiveVisible.value = true;
// }

// async function handleDeparture(row) {
//   //获取后台该数据全部信息接口
//   let { data } = await GetStaffOffDetail({
//     staffId: row.staffId
//   });
//   formData.value = { ...data };
//   DepartureVisible.value = true;
// }

// 获取学历列表
async function getEducationLevelList() {
  //获取后台该数据全部信息接口
  const { data } = await getEducationLevelNV();
  educationLevelList.value = data || [];
}

//序号列
function getIndex(index) {
  const page = queryFormData.value.pageIndex;
  const pagesize = queryFormData.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  toDetail(null);
};

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteStaffList({ id: row.staffId });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 修改表格行
function handleEdit(row) {
  toDetail(row);
}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

//导出
function handleExport() {
  const fileName = "员工导出";
  const parma = Object.assign({}, queryFormData.value);
  parma.staffIds = multipleSelection.value.map(item => item.staffId);
  batchExportExcel("/api/Staff/Export?", fileName, parma);
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
    dataList.value.forEach(item => {
      allData.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          sitem.isSelected = false;
        }
      });
    });
  } else {
    allClick.value = true;
    dataList.value.forEach(item => {
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

// 搜索获取表格数据 companyIds
async function onSearch() {
  console.log("queryFormData", queryFormData.value);
  if (jobStatus2.value) {
    const a = jobStatus2.value.join(",");
    queryFormData.value.jobStatus = a;
  }
  const { contractDate, ...params } = queryFormData.value;
  params.startEndDate = contractDate ? contractDate[0] : "";
  params.stopEndDate = contractDate ? contractDate[1] : "";
  params.companyIds = params.companyIds ? params.companyIds : [];
  params.educationLevels = params.educationLevels ? params.educationLevels : [];
  const { data } = await getStaffList(params);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;

  //不是全选状态 判断allData里面是否否已经有tableData的数据，没有则加上
  const nids = allData.value.map(item => item.staffId).join();
  dataList.value.forEach(item => {
    if (nids.indexOf(item.staffId) == -1) {
      allData.value.push(item);
    }
  });
  //然后再判断
  dataList.value.forEach(item => {
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

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

// 重置查询条件表单
const resetForm = () => {
  formRef.value.resetFields();
  queryFormData.value.deptId = "";
  queryFormData.value.keyword = "";
  queryFormData.value.major = "";
  queryFormData.value.jobType = "";
  queryFormData.value.educationLevels = [];
  queryFormData.value.jobStatus = "";
  queryFormData.value.startYears = 0;
  queryFormData.value.endYears = 99;
  queryFormData.value.startAge = 0;
  queryFormData.value.stopAge = 99;
  queryFormData.value.years = "";
  queryFormData.value.companyIds = [];
  queryFormData.value.contractDate = null;
  queryFormData.value.startEndDate = "";
  queryFormData.value.stopEndDate = "";
  queryFormData.value.staffIds = [];
  queryFormData.value.pageIndex = 1;
  queryFormData.value.pageSize = 20;
  jobStatus2.value = [];
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

//获取所有岗位类型
async function JobTypes() {
  const { data } = await GetStaffJobTypes();
  JobTypeData.value = data || [];
}

//部门选项接口
async function handleCompanyChange(vals) {
  deptOption.value = [];
  queryFormData.value.deptId = "";
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

// mounted周期函数
onMounted(async () => {
  onSearch();
  getEducationLevelList();
  JobTypes();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  setTableHeight();
  jobname();
  jobstatus();
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

//岗位选项接口
async function jobname() {
  const { data } = await getalljobtitle();
  JobtreeData.value = data || [];
}

//员工在职状态
async function jobstatus() {
  const { data } = await GeMyJobStatusListNv();
  jobStatusData.value = data || [];
}
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryFormData"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="110px"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="所属公司"
        prop="companyIds"
      >
        <el-cascader
          v-model="queryFormData.companyIds"
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
        label="任职部门"
        prop="deptId"
      >
        <el-cascader
          v-model="queryFormData.deptId"
          :options="deptOption"
          clearable
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="员工状态"
        prop="jobStatus2"
      >
        <el-select
          v-model="jobStatus2"
          clearable
          placeholder="请选择"
          multiple
          :collapse-tags="true"
          :collapse-tags-tooltip="true"
        >
          <el-option
            v-for="item in jobStatusData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="岗位类型"
        prop="jobType"
      >
        <el-select
          v-model="queryFormData.jobType"
          clearable
          placeholder="请选择"
        >
          <el-option
            v-for="item in JobTypeData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="劳动合同到期日"
        prop="contractDate"
      >
        <el-date-picker
          v-model="queryFormData.contractDate"
          style="width: 200px"
          clearable
          placeholder="请选择"
          type="daterange"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 7 || !fold"
        label="起始司龄"
        prop="startYears"
      >
        <el-input-number
          v-model="queryFormData.startYears"
          :min="0"
          :max="99"
          :step="1"
          :step-strictly="true"
          :precision="0"
          :controls="false"
          value-on-clear="min"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 8 || !fold"
        label="截止司龄"
        prop="endYears"
      >
        <el-input-number
          v-model="queryFormData.endYears"
          :min="0"
          :max="99"
          :step="1"
          :step-strictly="true"
          :precision="0"
          :controls="false"
          value-on-clear="min"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 9 || !fold"
        label="起始年龄"
        prop="startAge"
      >
        <el-input-number
          v-model="queryFormData.startAge"
          :min="0"
          :max="99"
          :step="1"
          :step-strictly="true"
          :precision="0"
          :controls="false"
          value-on-clear="min"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 10 || !fold"
        label="截止年龄"
        prop="stopAge"
      >
        <el-input-number
          v-model="queryFormData.stopAge"
          :min="0"
          :max="99"
          :step="1"
          :step-strictly="true"
          :precision="0"
          :controls="false"
          value-on-clear="min"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 11 || !fold"
        label="最高学历"
        prop="educationLevels"
      >
        <el-select
          v-model="queryFormData.educationLevels"
          placeholder="请选择"
          multiple
          collapse-tags
          collapse-tags-tooltip
          clearable
        >
          <el-option
            v-for="item in educationLevelList"
            :key="item.value"
            :label="item.name"
            :value="item.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 12 || !fold"
        label="专业"
        prop="major"
      >
        <el-input
          v-model="queryFormData.major"
          placeholder="请输入"
          clearable
        />
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 13 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input
          v-model="queryFormData.keyword"
          placeholder="姓名,专业,电话,职位,部门"
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
      title="员工列表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'EmployeeInformation.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-button
          v-auth="'EmployeeInformation.export'"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="multipleTableRef"
          border
          :select-on-indeterminate="false"
          :size="size"
          :height="tableHeight"
          :data="dataList"
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
            label="员工编号"
            width="120"
            align="center"
            prop="staffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="姓名"
            width="80"
            align="center"
            prop="staffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="所属公司"
            align="left"
            min-width="180"
            show-overflow-tooltip
            prop="companyName"
          />
          <el-table-column
            label="任职部门"
            align="left"
            width="100"
            show-overflow-tooltip
            prop="deptName"
          />
          <el-table-column
            label="职位"
            width="100"
            align="center"
            prop="jobTitle"
            show-overflow-tooltip
          />
          <el-table-column
            label="最高学历"
            width="100"
            align="center"
            prop="educationLevel"
            show-overflow-tooltip
          />
          <el-table-column
            label="学历性质"
            width="100"
            align="center"
            prop="educationNature"
            show-overflow-tooltip
          />
          <el-table-column
            label="专业"
            width="100"
            align="center"
            prop="major"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.major ? row.major : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="最高学位"
            width="100"
            align="center"
            prop="degree"
          />
          <el-table-column
            label="联系电话"
            width="120"
            align="center"
            prop="mobile"
            show-overflow-tooltip
          />
          <el-table-column
            label="邮箱"
            min-width="180"
            align="center"
            prop="email"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.email ? row.email : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="QQ"
            width="120"
            align="center"
            prop="qq"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.qq ? row.qq : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="岗位类型"
            width="100"
            align="center"
            prop="jobTypeExpr"
            show-overflow-tooltip
          />
          <el-table-column
            label="社保关系"
            width="180"
            align="left"
            prop="socialCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="入职日期"
            align="center"
            width="120"
            prop="startDate"
            :formatter="
              ({ startDate }) => {
                return startDate ? dayjs(startDate).format('YYYY-MM-DD') : '-';
              }
            "
          />
          <el-table-column
            label="实际转正日期"
            align="center"
            width="120"
            prop="onRealDate"
            :formatter="
              ({ onRealDate }) => {
                return onRealDate
                  ? dayjs(onRealDate).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="劳动合同到期日"
            align="center"
            width="130"
            prop="endDate"
            :formatter="
              ({ endDate }) => {
                return endDate != '1900-01-01 00:00:00'
                  ? dayjs(endDate).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="在职状态"
            width="100"
            align="center"
            prop="jobStatusDesc"
            show-overflow-tooltip
          />
          <el-table-column
            label="员工状态"
            width="100"
            align="center"
            prop="staffStatusName"
            show-overflow-tooltip
          />
          <el-table-column label="年龄" width="60" align="right" prop="age" />
          <el-table-column
            label="司龄"
            width="60"
            align="right"
            prop="companyAge"
          />
          <el-table-column
            label="创建腾讯IM用户"
            width="130"
            align="center"
            prop="isSyncedTencentIM"
            :formatter="
              ({ isSyncedTencentIM }) => {
                return isSyncedTencentIM ? '创建' : '不创建';
              }
            "
          />
          <el-table-column
            v-auth="
              'EmployeeInformation.delete|EmployeeInformation.edit|EmployeeInformation.positive|EmployeeInformation.departure'
            "
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'EmployeeInformation.edit'"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'EmployeeInformation.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
              <!-- <el-dropdown>
                <el-button
                  class="ml-3"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon('more')"
                />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button
                        v-auth="'EmployeeInformation.positive'"
                        :disabled="scope.row.jobStatus < 4"
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                        @click="handlePositive(scope.row)"
                      >
                        转正
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button
                        v-auth="'EmployeeInformation.departure'"
                        :disabled="scope.row.jobStatusExpr == '离职'"
                        class="reset-margin !h-20px !text-gray-500"
                        link
                        type="primary"
                        :size="size"
                        :icon="useRenderIcon('menu')"
                        @click="handleDeparture(scope.row)"
                      >
                        离职
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown> -->
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryFormData.pageSize"
          v-model:current-page="queryFormData.pageIndex"
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
    <PositiveForm
      v-model:visible="PositiveVisible"
      :data="formData"
      @search="onSearch"
    />
    <DepartureForm
      v-model:visible="DepartureVisible"
      :data="formData"
      @search="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-form-item__content) {
  .el-input__wrapper {
    width: 220px !important;
  }
}

:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
