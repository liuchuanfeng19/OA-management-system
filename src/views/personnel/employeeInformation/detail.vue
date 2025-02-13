<script lang="ts">
export default {
  name: "EmployeeInformationDetail"
};
</script>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { isPhone } from "@pureadmin/utils";
import { isIdCard, isTel } from "@/utils/validate";
import { useRoute } from "vue-router";
import { ref, watch, reactive, onMounted } from "vue";
import {
  create,
  update,
  GetStaff,
  // GetStGetWorkExperienceaff,
  GeWorkExperienceList,
  // DeleteWorkExperience,
  GeEducationExperienceList,
  GetQualificationCertificateList,
  GetRewardPunishmentList,
  GetStaffFamilyList,
  GetStaffBenefitsByStaffId,
  GetEducationExperience,
  DeleteEducationExperience,
  GetQualificationCertificate,
  DeleteQualificationCertificate,
  GetRewardPunishment,
  DeleteRewardPunishment,
  // GetStaffFamily,
  // DeleteStaffFamily,
  // DeleteStaffBenefits,
  GetStaffJobTypes,
  getEducationLevelNV,
  getDegreeNV
  // GeMyJobStatusListNv //员工状态
} from "@/api/personnel";
import { nationalList } from "@/utils/nationalList";
import { TableProBar } from "@/components/ReTable";
import { ElMessage, FormInstance } from "element-plus";

import { GetStaffStatusListNv, GetJobStatusListNv } from "@/api/staff";
import { GetListNVByDeptId } from "@/api/jobs";
import { getStaffContractByStaffId } from "@/api/staffContract";
import { GetTreeByDeptId } from "@/api/department";
// import WorkForm from "./components/WorkForm.vue";
import EducationForm from "./components/EducationForm.vue";
import CertificateForm from "./components/CertificateForm.vue";
import DisciplinaryForm from "./components/DisciplinaryForm.vue";
import _ from "lodash";
// import FamilyForm from "./components/FamilyForm.vue";
// import CompensationForm from "./components/CompensationForm.vue";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { emitter } from "@/utils/mitt";
import dayjs from "dayjs";

const { getRootDeptList } = userDepartmentStoreHook();
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  socialCompanyId: "",
  staffId: "",
  staffName: "", //人员姓名
  mobile: "", //手机号
  jobStatus: 1,
  staffStatus: 1,
  deptId: "", //部门id
  companyId: "", //公司id
  companyName: "", //公司名称
  deptName: "", //部门名称
  jobTitle: "", //岗位
  jobTitleId: "", //岗位绑定
  startDate: "", //入职时间
  offRealDate: "", //离职时间
  usedName: "",
  staffCode: "",
  sex: "男",
  birthday: "",
  idCard: "",
  policy: "党员",
  major: "",
  degree: "", //学位1
  degreeName: "无",
  degree2: "无", //学位2
  educationLevel: "", //学历1
  educationLevelName: "无", //学历1
  educationLevel2: "无", //学历2
  educationNature: "", //学历性质
  nationality: "汉族",
  healthInfo: "良好",
  maritalStatus: "未婚",
  height: 0,
  weight: 0,
  jobType: 1,
  residentPlace: "",
  homeAddress: "",
  emergencyContact: "",
  emergencyContactNumber: "",
  email: "",
  probationPeriod: 3,
  onPlanDate: "",
  onRealDate: "",
  salary: "",
  schoolName: "",
  majorName: "",
  certificateName: "",
  issuingUnit: "",
  certificateImg: [], //证书图片
  happenDate: "",
  name: "",
  relation: "",
  telephone: "",
  job: "",
  accountName: "",
  bankName: "",
  accountNo: "",
  housingFundNo: "",
  socialInsureNo: "",
  remark: "",
  qq: "",
  shortNumber: "",
  sequence: 0,
  endDate: "", //劳动合同到期
  isCreateTencentIMUser: false //是否创建腾讯IM用户
};
//工作经历
const WORK_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  companyName: "",
  endDate: "",
  remark: "",
  jobTitle: "",
  startDate: ""
};
//教育
const Education_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  schoolName: "",
  endDate: "",
  remark: "",
  majorName: "",
  educationLevel: "1", //学历1
  educationLevelName: "无", //学历1
  degree: "1", //学位1
  degreeName: "无",
  educationNature: "",
  startDate: "",
  img: []
};
//资质证书
const Certificate_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  certType: "",
  certNo: "",
  certificateName: "",
  endDate: "",
  issuingUnit: "",
  certificateImg: [],
  startDate: "",
  qualiTypeIdExpr: "",
  qualiTypeId: "身份证"
};

//奖惩
const Disciplinary_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  happenDate: "",
  name: "",
  comment: ""
};
//家庭
const Family_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  relation: "",
  name: "",
  job: "",
  companyName: "",
  telephone: ""
};
//薪酬福利
const Compensation_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: "",
  bankName: "",
  accountNo: "",
  housingFundNo: "",
  socialInsureNo: ""
};
const route = useRoute();
//staffid值，用于详情页请求字表接口
const id = route.query?.id;
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则

const rules = {
  socialCompanyId: [
    { required: true, message: "请选择社保关系", trigger: "change" }
  ],
  CompanyId: [{ required: true, message: "请选择所属公司", trigger: "change" }],
  deptId: [{ required: true, message: "请选择入职部门", trigger: "change" }],
  staffName: [{ required: true, message: "请输入员工姓名", trigger: "blur" }],
  staffCode: [{ required: false, message: "请输入员工编号", trigger: "blur" }],
  startDate: [{ required: false, message: "请输入入职日期", trigger: "blur" }],
  jobTitleId: [
    { required: true, message: "请选择入职职位", trigger: "change" }
  ],
  mobile: [
    {
      required: true, //编辑的时候为必填
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isPhone(value) && !isTel(value)) {
            callback(new Error("手机号格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入手机号"));
        }
      }
    }
  ],
  jobType: [{ required: true, message: "请选择岗位类型", trigger: "blur" }],
  birthday: [{ required: true, message: "请选择出生日期", trigger: "blur" }],
  idCard: [
    {
      required: true, //编辑的时候为必填
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isIdCard(value)) {
            callback(new Error("身份证格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入身份证"));
        }
      }
    }
  ],
  email: [{ required: false, message: "请输入邮箱", trigger: "blur" }]
};

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryFormData = reactive({
  staffId: id
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const WORKformData = ref({ ...WORK_DATA });
const EducationformData = ref({ ...Education_DATA });
const CertificateformData = ref({ ...Certificate_DATA });
const DisciplinaryformData = ref({ ...Disciplinary_DATA });
const FamilyformData = ref({ ...Family_DATA });
const CompensationformData = ref({ ...Compensation_DATA });
const formLoading = ref(false);
const loading = ref(false);
const dataList = ref([]);
const educationList = ref([]);
const laborContractList = ref([]);
const CertificateList = ref([]);
const DisciplinaryList = ref([]);
const FamilyList = ref([]);
const CompensationList = ref({
  accountName: "",
  accountNo: "",
  bankName: "",
  housingFundNo: "",
  id: "",
  socialInsureNo: "",
  staffId: ""
});
const degreeList = ref([]);
const JobtreeData = ref([]);
const JobTypeData = ref([]);
const JobStatusList = ref([]);
const StaffStatusList = ref([]);
const departmentList = ref([]);
const educationLevelList = ref([]);
const formWorkVisible = ref(false);
const formEducationVisible = ref(false);
const formCertificateVisible = ref(false);
const formDisciplinaryVisible = ref(false);
const formFamilyVisible = ref(false);
const formCompensationVisible = ref(false);
const operation = ref(true);
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

// create(){
// formData.startDate=new Date(+new Date() + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
// };

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

const handleBack = () => {
  emitter.emit("closeTag", {
    routeName: route.name as string,
    query: route.query,
    targetPath: "/personnel/employeeInformation"
  });
};

const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  const dataval = Object.assign({}, formData.value);
  delete dataval.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (id || dataval.staffId) {
        const { code, message } = await update(dataval);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          getDetail();
        }
      } else {
        const { success, message, data } = await create(dataval);
        if (code == 0) {
          formData.value = Object.assign(formData.value, data);
          ElMessage.success(message);
          formVisible.value = false;
          queryFormData.staffId = formData.value.staffId;
          operation.value = false;
          getEducationList();
          getCertificate();
          Disciplinary();
          Family();
          Compensation();
          Work();
        }
      }
    }
  });
}, 300);

//工作经历
watch(
  () => formWorkVisible.value,
  val => {
    if (!val) {
      WORKformData.value = {
        ...WORK_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);

//教育经历
watch(
  () => formEducationVisible.value,
  val => {
    if (!val) {
      EducationformData.value = {
        ...Education_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);

//资质证书
watch(
  () => formCertificateVisible.value,
  val => {
    if (!val) {
      CertificateformData.value = {
        ...Certificate_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);

//奖惩
watch(
  () => formDisciplinaryVisible.value,
  val => {
    if (!val) {
      DisciplinaryformData.value = {
        ...Disciplinary_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);

//家庭
watch(
  () => formFamilyVisible.value,
  val => {
    if (!val) {
      FamilyformData.value = {
        ...Family_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);
//薪酬福利
watch(
  () => formCompensationVisible.value,
  val => {
    if (!val) {
      CompensationformData.value = {
        ...Compensation_DATA,
        staffId: formData.value.staffId
      };
    }
  }
);
//工作经历 ----------------------------------------------------------------------------
// //工作经历新增
// const WorkHandleAdd = () => {
//   if (formData.value.staffId || id) {
//     WORKformData.value = {
//       ...WORK_DATA,
//       type: "add",
//       staffId: formData.value.staffId
//     };
//     formWorkVisible.value = true;
//   } else {
//     ElMessage.error("请先填写并保存员工信息");
//   }
// };

// //修改工作经历行信息
// async function WorkHandleUpdate(row) {
//   //获取后台该数据全部信息接口
//   let { data } = await GetStGetWorkExperienceaff({ id: row.id });
//   WORKformData.value = { ...data, type: "edit" };
//   formWorkVisible.value = true;
// }

// // 删除工作经历表格行
// async function WorkHandleDelete(row) {
//   const { code, message } = await DeleteWorkExperience({ id: row.id });
//   if (code==0) {
//     ElMessage.success(message);
//     Work();
//   }
// }

/**
 * 获取员工详情
 */
async function getDetail() {
  //获取后台该数据全部信息接口
  const { data } = await GetStaff({ id: id ? id : formData.value.staffId });
  formData.value = Object.assign(formData.value, data);
  console.log("formData", formData.value);
  getPositionList(data.deptId);
  getDepartmentList(data.companyId);
}

/**
 * 根据部门Id获取职位列表
 * @param deptId 部门Id
 */
async function getPositionList(deptId) {
  const { data } = await GetListNVByDeptId({ deptId });
  JobtreeData.value = data || [];
}

/**
 * 根据公司Id获取部门列表
 * @param companyId 公司Id
 */
async function getDepartmentList(companyId) {
  const { data } = await GetTreeByDeptId({ deptId: companyId });
  departmentList.value = data || [];
}

// 教育经历----------------------------------------------------------------------------
// //教育经历新增
const handleEducationAdd = () => {
  if (formData.value.staffId || id) {
    EducationformData.value = {
      ...Education_DATA,
      educationLevel: educationLevelList.value[0].value,
      degree: degreeList.value[0].value,
      type: "add",
      staffId: formData.value.staffId
    };
    formEducationVisible.value = true;
  } else {
    ElMessage.error("请先填写并保存员工信息");
  }
};

// //修改教育经历行信息
async function EducationHandleUpdate(row) {
  //获取后台该数据全部信息接口
  const { data } = await GetEducationExperience({ id: row.id });
  EducationformData.value = { ...data, type: "edit" };
  formEducationVisible.value = true;
}

// 删除教育经历表格行
async function EducationHandleDelete(row) {
  const { code, message } = await DeleteEducationExperience({ id: row.id });
  if (code == 0) {
    ElMessage.success(message);
    getEducationList();
    getDetail();
  }
}
// 资质证书----------------------------------------------------------------------------
// //资质证书新增
const CertificateHandleAdd = () => {
  if (formData.value.staffId || id) {
    CertificateformData.value = {
      ...Certificate_DATA,
      type: "add",
      staffId: formData.value.staffId
    };
    formCertificateVisible.value = true;
  } else {
    ElMessage.error("请先填写并保存员工信息");
  }
};
// 获取学历列表
async function getEducationLevelList() {
  //获取后台该数据全部信息接口
  const { data } = await getEducationLevelNV();
  educationLevelList.value = data || [];
}

// 获取学历列表
async function getDegreeList() {
  //获取后台该数据全部信息接口
  const { data } = await getDegreeNV({});
  degreeList.value = data || [];
}

// //修改资质证书行信息
async function CertificateHandleUpdate(row) {
  //获取后台该数据全部信息接口
  const { data } = await GetQualificationCertificate({
    id: row.id,
    certificateImg: row.certificateImg
  });
  CertificateformData.value = { ...data, type: "edit" };
  formCertificateVisible.value = true;
}

// 删除资质证书表格行
async function CertificateHandleDelete(row) {
  const { code, message } = await DeleteQualificationCertificate({
    id: row.id
  });
  if (code == 0) {
    ElMessage.success(message);
    getCertificate();
  }
}
// 奖惩信息----------------------------------------------------------------------------
// //奖惩新增
const DisciplinaryFormHandleAdd = () => {
  if (formData.value.staffId || id) {
    DisciplinaryformData.value = {
      ...Disciplinary_DATA,
      type: "add",
      staffId: formData.value.staffId
    };
    formDisciplinaryVisible.value = true;
  } else {
    ElMessage.error("请先填写并保存员工信息");
  }
};

// //修改奖惩行信息
async function DisciplinaryFormHandleUpdate(row) {
  //获取后台该数据全部信息接口
  const { data } = await GetRewardPunishment({ id: row.id });
  DisciplinaryformData.value = { ...data, type: "edit" };
  formDisciplinaryVisible.value = true;
}

// 删除奖惩表格行
async function DisciplinaryFormHandleDelete(row) {
  const { code, message } = await DeleteRewardPunishment({
    id: row.id
  });
  if (code == 0) {
    ElMessage.success(message);
    Disciplinary();
  }
}
// 家庭信息----------------------------------------------------------------------------
// //家庭信息新增
// const FamilyFormHandleAdd = () => {
//   if (formData.value.staffId || id) {
//     FamilyformData.value = {
//       ...Family_DATA,
//       type: "add",
//       staffId: formData.value.staffId
//     };
//     formFamilyVisible.value = true;
//   } else {
//     ElMessage.error("请先填写并保存员工信息");
//   }
// };

// //修改家庭行信息
// async function FamilyFormHandleUpdate(row) {
//   //获取后台该数据全部信息接口
//   let { data } = await GetStaffFamily({ id: row.id });
//   FamilyformData.value = { ...data, type: "edit" };
//   formFamilyVisible.value = true;
// }

// 删除家庭信息表格行
// async function FamilyFormHandleDelete(row) {
//   const { code, message } = await DeleteStaffFamily({
//     id: row.id
//   });
//   if (code==0) {
//     ElMessage.success(message);
//     Family();
//   }
// }
// 薪酬福利----------------------------------------------------------------------------

// //修改薪酬福利
// async function CompensationFormHandleUpdate() {
//   //获取后台该数据全部信息接口
//   let { data } = await GetStaffBenefitsByStaffId({
//     staffId: CompensationList.value.staffId
//   });
//   CompensationformData.value = { ...data, type: "edit" };
//   formCompensationVisible.value = true;
// }

// ----------------------------------------------------------------------------
// 重置表单
// const resetForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.resetFields();
// };

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据（工作经历）
async function Work() {
  // loading.value = true;
  const { data } = await GeWorkExperienceList(queryFormData);
  dataList.value = data.data || [];
  // totalPage.value = data.totalCount;
  loading.value = false;
}

// 搜索获取表格数据（教育经历）
async function getEducationList() {
  const { data } = await GeEducationExperienceList(queryFormData);
  educationList.value = data.data || [];
  loading.value = false;
}
// 获取劳动合同
async function getLaborContract() {
  const { data } = await getStaffContractByStaffId(queryFormData);
  laborContractList.value = data.data || [];
  loading.value = false;
}

// 搜索获取表格数据（资质证书）
async function getCertificate() {
  const { data } = await GetQualificationCertificateList(queryFormData);
  CertificateList.value = data.data || [];
  loading.value = false;
}
// 搜索获取表格数据（奖惩信息）
async function Disciplinary() {
  const { data } = await GetRewardPunishmentList(queryFormData);
  DisciplinaryList.value = data.data || [];
  loading.value = false;
}
// 搜索获取表格数据（家庭信息）
async function Family() {
  const { data } = await GetStaffFamilyList(queryFormData);
  FamilyList.value = data.data || [];
  loading.value = false;
}
//获取薪酬福利
async function Compensation() {
  const { data } = await GetStaffBenefitsByStaffId(queryFormData);
  CompensationList.value = data || {};
  loading.value = false;
}

//获取所有岗位类型
async function JobTypes() {
  const { data } = await GetStaffJobTypes();
  JobTypeData.value = data || [];
}

//获取员工在职状态
async function JobStatus() {
  const { data } = await GetJobStatusListNv({ isSearch: 0 });
  JobStatusList.value = data || [];
}

//获取员工状态
async function Status() {
  const { data } = await GetStaffStatusListNv({ isSearch: 0 });
  StaffStatusList.value = data || [];
}

function onSearch() {
  getDetail();
  Work();
  getEducationList();
  getLaborContract();
  getCertificate();
  Disciplinary();
  Family();
  Compensation();
}

// mounted周期函数
onMounted(async () => {
  Status();
  JobStatus();
  getEducationLevelList();
  getDegreeList();
  JobTypes();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  if (id) {
    operation.value = false;
    onSearch();
  }
});
console.log("created");
// 日期缺省
formData.value.startDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");
formData.value.birthday = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");
</script>

<template>
  <el-form
    ref="ruleFormRef"
    v-loading="formLoading"
    :model="formData"
    :rules="rules"
    label-width="112px"
  >
    <div style="background-color: white">
      <div
        class="header-container pl-3"
        style="padding-top: 20px; font-weight: 700"
      >
        <div>员工信息</div>
        <div class="header-container-button">
          <el-button type="primary" @click="submitForm(ruleFormRef)"
            >保存</el-button
          >
          <el-button type="primary" @click="handleBack">返回</el-button>
        </div>
      </div>

      <div class="pl-3 pr-3 m-3">
        <el-row :gutter="20">
          <el-col :span="6" :offset="0">
            <el-form-item label="所属公司" prop="companyId">
              <el-cascader
                v-model="formData.companyId"
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
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="入职部门" prop="deptId">
              <el-cascader
                v-model="formData.deptId"
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
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="职位" prop="jobTitleId">
              <el-select
                v-model="formData.jobTitleId"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option
                  v-for="item in JobtreeData"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="姓名" prop="staffName">
              <el-input
                v-model="formData.staffName"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="员工编号" prop="staffCode">
              <el-input
                v-model.trim="formData.staffCode"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="手机号码" prop="mobile">
              <el-input
                v-model.trim="formData.mobile"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="在职状态" prop="jobStatus">
              <el-select
                v-model="formData.jobStatus"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option
                  v-for="item in JobStatusList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="员工状态" prop="staffStatus">
              <el-select
                v-model="formData.staffStatus"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option
                  v-for="item in StaffStatusList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="入职日期" prop="startDate">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '480px' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="岗位类型" prop="jobType">
              <el-select
                v-model="formData.jobType"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option
                  v-for="item in JobTypeData"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="社保关系" prop="socialCompanyId">
              <el-cascader
                v-model="formData.socialCompanyId"
                :options="rootDepartment"
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
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="试用期(月)" prop="probationPeriod">
              <!-- <el-input
                v-model="formData.probationPeriod"
                :style="{ width: '480px' }"
                placeholder="请输入"
              /> -->
              <el-input-number
                v-model="formData.probationPeriod"
                style="width: 352.85px !important"
                :min="0"
                :max="12"
                :step="1"
                :step-strictly="true"
                :precision="0"
                :controls="true"
                value-on-clear="min"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="劳动合同到期日" prop="endDate">
              <el-date-picker
                v-model="formData.endDate"
                :disabled="true"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '480px' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="离职日期" prop="offRealDate">
              <el-date-picker
                v-model="formData.offRealDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '480px' }"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6" :offset="0">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '480px' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="formData.sex" :style="{ width: '480px' }">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="身份证号码" prop="idCard">
              <el-input
                v-model.trim="formData.idCard"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="政治面貌" prop="policy">
              <el-select
                v-model="formData.policy"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option label="党员" value="党员" />
                <el-option label="团员" value="团员" />
                <el-option label="群众" value="群众" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="民族" prop="nationality">
              <el-select
                v-model="formData.nationality"
                :style="{ width: '480px' }"
                placeholder="请选择"
                value-key="name"
              >
                <el-option
                  v-for="item in nationalList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="最高学历" prop="educationLevel">
              <el-input
                v-model="formData.educationLevel"
                :disabled="true"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="学历性质" prop="educationNature">
              <el-input
                v-model="formData.educationNature"
                :disabled="true"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="专业" prop="major">
              <el-input
                v-model="formData.major"
                :style="{ width: '480px' }"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="最高学位" prop="degree">
              <el-input
                v-model="formData.degree"
                :style="{ width: '480px' }"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="false" :span="6" :offset="0">
            <el-form-item label="学历2" prop="educationLevel2">
              <el-select
                v-model="formData.educationLevel2"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option label="无" value="无" />
                <el-option label="高中" value="高中" />
                <el-option label="中专" value="中专" />
                <el-option label="大专" value="大专" />
                <el-option label="本科" value="本科" />
                <el-option label="研究生" value="研究生" />
                <el-option label="博士生" value="博士生" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="false" :span="6" :offset="0">
            <el-form-item label="学位2" prop="degree2">
              <el-select
                v-model="formData.degree2"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option label="学士" value="学士" />
                <el-option label="硕士" value="硕士" />
                <el-option label="博士" value="博士" />
                <el-option label="无" value="无" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="健康状态" prop="healthInfo">
              <el-select
                v-model="formData.healthInfo"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option label="良好" value="良好" />
                <el-option label="较差" value="较差" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="婚姻状况" prop="maritalStatus">
              <el-select
                v-model="formData.maritalStatus"
                placeholder="请选择"
                :style="{ width: '480px' }"
              >
                <el-option label="未婚" value="未婚" />
                <el-option label="已婚" value="已婚" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-input
                v-model="formData.emergencyContact"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="紧急联系电话" prop="emergencyContactNumber">
              <el-input
                v-model.trim="formData.emergencyContactNumber"
                :style="{ width: '480px' }"
                type="tel"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="QQ号" prop="qq">
              <el-input
                v-model.trim="formData.qq"
                type="number"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="分机号" prop="shortNumber">
              <el-input
                v-model.trim="formData.shortNumber"
                type="number"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="邮箱地址" prop="email">
              <el-input
                v-model.trim="formData.email"
                :style="{ width: '480px' }"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="户籍地" prop="homeAddress">
              <el-input v-model="formData.homeAddress" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="现居住地" prop="residentPlace">
              <el-input v-model="formData.residentPlace" placeholder="请输入" />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="显示顺序" prop="sequence">
              <el-input-number
                v-model="formData.sequence"
                style="width: 352.85px !important"
                :min="0"
                :max="12"
                :step="1"
                :step-strictly="true"
                :precision="0"
                :controls="true"
                value-on-clear="min"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="IM账号" prop="isCreateTencentIMUser ">
              <el-switch
                v-model="formData.isCreateTencentIMUser"
                active-text="创建"
                :active-value="true"
                inactive-text="不创建"
                :inactive-value="false"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- <TableProBar
      title="工作经历"
      :loading="loading"
      :dataList="dataList"
      @refresh="Work"
    >
      <template #buttons>
        <el-tooltip
          effect="dark"
          content="添加"
          placement="top"
        >
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
            @click="WorkHandleAdd"
          />
        </el-tooltip>
      </template>

      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :data="dataList"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            label="序号"
            align="center"
            width="70"
          />
          <el-table-column
            label="公司名称"
            width="150"
            align="center"
            prop="companyName"
          />
          <el-table-column label="岗位" align="center" prop="jobTitle" />
          <el-table-column
            label="开始日期"
            align="center"
            width="150"
            prop="startDate"
            :formatter="
              ({ startDate }) => {
                return dayjs(startDate).format('YYYY-MM-DD');
              }
            "
          />
          <el-table-column
            label="结束日期"
            align="center"
            width="150"
            prop="endDate"
            :formatter="
              ({ endDate }) => {
                return dayjs(endDate).format('YYYY-MM-DD');
              }
            "
          />
          <el-table-column label="薪资" align="center" prop="salary" />
          <el-table-column
            label="备注"
            align="center"
            min-width="150"
            show-overflow-tooltip
            prop="remark"
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                :size="size"
                @click="WorkHandleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="WorkHandleDelete(scope.row)"
              >
                <template #reference>
                  <el-button
                    link
                    type="primary"
                    :size="size"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <WorkForm
      v-model:visible="formWorkVisible"
      :data="WORKformData"
      @search="Work"
    /> -->

    <TableProBar
      title="劳动合同"
      :loading="loading"
      :dataList="laborContractList"
      @refresh="getLaborContract"
    >
      <template #buttons>
        <el-tooltip v-if="false" effect="dark" content="添加" placement="top">
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
          />
        </el-tooltip>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="multipleTableRef"
          border
          height="190px"
          :select-on-indeterminate="false"
          :size="size"
          :data="laborContractList"
          highlight-current-row
          row-key="id"
        >
          <el-table-column
            v-if="checkList.includes('勾选项')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="签订时间（年）"
            align="center"
            width="150"
            prop="scSignYear"
            :formatter="
              ({ scSignYear }) => {
                return scSignYear ? dayjs(scSignYear).format('YYYY') : '-';
              }
            "
          />
          <el-table-column
            label="合同编号"
            width="200"
            align="center"
            prop="scContractCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="签订公司"
            align="left"
            min-width="200"
            prop="scCompanyName"
            show-overflow-tooltip
          />
          <el-table-column
            label="员工编号"
            width="150"
            align="center"
            prop="scStaffCode"
            show-overflow-tooltip
          />
          <el-table-column
            label="姓名"
            width="120"
            align="center"
            prop="scStaffName"
            show-overflow-tooltip
          />
          <el-table-column
            label="合同起始"
            align="center"
            width="120"
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
            width="120"
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
            width="120"
            prop="scAmount"
          />
          <el-table-column
            label="部门"
            align="left"
            width="200"
            show-overflow-tooltip
            prop="scDeptName"
          />
          <el-table-column
            label="岗位"
            width="120"
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
          <!-- <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          /> -->
          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
      </template>
    </TableProBar>

    <TableProBar
      title="教育经历"
      :loading="loading"
      :dataList="educationList"
      @refresh="getEducationList"
    >
      <template #buttons>
        <el-tooltip effect="dark" content="添加" placement="top">
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
            @click="handleEducationAdd"
          />
        </el-tooltip>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          height="190px"
          border
          :size="size"
          :data="educationList"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            label="序号"
            align="center"
            width="70"
          />
          <el-table-column
            label="学校名称"
            min-width="200"
            align="center"
            prop="schoolName"
          />
          <el-table-column
            label="专业名称"
            min-width="200"
            align="center"
            prop="majorName"
          />
          <el-table-column
            label="学历"
            align="center"
            prop="educationLevelName"
          />
          <el-table-column
            label="学历性质"
            align="center"
            prop="educationNature"
          />
          <el-table-column label="学位" align="center" prop="degreeName" />
          <el-table-column
            label="开始日期"
            align="center"
            width="200"
            prop="startDate"
            :formatter="
              ({ startDate }) => {
                return dayjs(startDate).format('YYYY-MM-DD');
              }
            "
          />
          <el-table-column
            label="结束日期"
            align="center"
            width="200"
            prop="endDate"
            :formatter="
              ({ endDate }) => {
                return dayjs(endDate).format('YYYY-MM-DD');
              }
            "
          />
          <el-table-column
            label="证书图片"
            min-width="80"
            align="center"
            prop="img"
          >
            <template #default="{ row }">
              <el-image
                v-if="row.img.length >= 1"
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.img[0]"
                :preview-src-list="row.img"
                :initial-index="4"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                :size="size"
                @click="EducationHandleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="EducationHandleDelete(scope.row)"
              >
                <template #reference>
                  <el-button link type="primary" :size="size"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty style="height: 150px" :image-size="50" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <EducationForm
      v-model:visible="formEducationVisible"
      :data="EducationformData"
      @search="
        () => {
          getDetail();
          getEducationList();
        }
      "
    />

    <TableProBar
      title="个人证件"
      :loading="loading"
      :dataList="CertificateList"
      @refresh="getCertificate"
    >
      <template #buttons>
        <el-tooltip v-if="false" effect="dark" content="添加" placement="top">
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
            @click="CertificateHandleAdd"
          />
        </el-tooltip>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          height="190px"
          border
          :size="size"
          :data="CertificateList"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            label="序号"
            align="center"
            width="70"
          />
          <el-table-column
            label="证书名称"
            min-width="200"
            align="center"
            prop="certificateName"
          />
          <el-table-column
            label="证书类型"
            min-width="180"
            align="center"
            prop="qualiTypeIdExpr"
          />
          <el-table-column
            label="核发机构"
            min-width="200"
            align="center"
            prop="issuingUnit"
          />
          <el-table-column
            label="颁发日期"
            align="center"
            width="180"
            prop="startDate"
            :formatter="
              ({ startDate }) => {
                return startDate ? dayjs(startDate).format('YYYY-MM-DD') : '';
              }
            "
          />
          <el-table-column
            label="有效日期"
            align="center"
            width="180"
            prop="endDate"
            :formatter="
              ({ endDate }) => {
                return endDate ? dayjs(endDate).format('YYYY-MM-DD') : '';
              }
            "
          />
          <el-table-column
            label="证书图片"
            min-width="50"
            align="center"
            prop="certificateImg"
          >
            <template #default="{ row }">
              <el-image
                v-if="row.certificateImg.length >= 1"
                :preview-teleported="true"
                style="width: 30px; height: 30px"
                :src="row.certificateImg[0]"
                :preview-src-list="row.certificateImg"
                :initial-index="4"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="false"
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                :size="size"
                @click="CertificateHandleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="CertificateHandleDelete(scope.row)"
              >
                <template #reference>
                  <el-button link type="primary" :size="size"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <CertificateForm
      v-model:visible="formCertificateVisible"
      :data="CertificateformData"
      @search="getCertificate"
    />

    <TableProBar
      title="奖惩信息"
      :loading="loading"
      :dataList="DisciplinaryList"
      @refresh="Disciplinary"
    >
      <template #buttons>
        <el-tooltip effect="dark" content="添加" placement="top">
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
            @click="DisciplinaryFormHandleAdd"
          />
        </el-tooltip>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          height="190px"
          border
          :size="size"
          :data="DisciplinaryList"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            label="序号"
            align="center"
            width="70"
          />
          <el-table-column label="奖惩名称" align="center" prop="name" />
          <el-table-column label="奖惩类型" align="center" prop="rpTypeName" />
          <el-table-column
            label="奖惩日期"
            align="center"
            prop="happenDate"
            :formatter="
              ({ happenDate }) => {
                return happenDate ? dayjs(happenDate).format('YYYY-MM-DD') : '';
              }
            "
          />
          <el-table-column
            label="备注"
            align="center"
            prop="comment"
            show-overflow-tooltip=""
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                :size="size"
                @click="DisciplinaryFormHandleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="DisciplinaryFormHandleDelete(scope.row)"
              >
                <template #reference>
                  <el-button link type="primary" :size="size"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <DisciplinaryForm
      v-model:visible="formDisciplinaryVisible"
      :data="DisciplinaryformData"
      @search="Disciplinary"
    />

    <!-- <TableProBar
      title="家庭信息"
      :loading="loading"
      :dataList="FamilyList"
      @refresh="Family"
    >
      <template #buttons>
        <el-tooltip
          effect="dark"
          content="添加"
          placement="top"
        >
          <IconifyIconOffline
            :disabled="operation"
            class="cursor-pointer"
            icon="plus"
            width="16"
            color="text_color_regular"
            @click="FamilyFormHandleAdd"
          />
        </el-tooltip>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :data="FamilyList"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="55"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            label="序号"
            align="center"
            width="70"
          />
          <el-table-column
            label="家庭关系"
            min-width="150"
            align="center"
            prop="relation"
          />
          <el-table-column label="姓名" align="center" prop="name" />
          <el-table-column label="职业" align="center" prop="job" />
          <el-table-column
            label="任职单位"
            min-width="150"
            align="center"
            prop="companyName"
          />
          <el-table-column
            label="联系电话"
            min-width="150"
            align="center"
            prop="telephone"
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <el-button
                link
                type="primary"
                :size="size"
                @click="FamilyFormHandleUpdate(scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="是否确认删除?"
                @confirm="FamilyFormHandleDelete(scope.row)"
              >
                <template #reference>
                  <el-button
                    link
                    type="primary"
                    :size="size"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :image-size="50" style="height: 150px" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <FamilyForm
      v-model:visible="formFamilyVisible"
      :data="FamilyformData"
      @search="Family"
    /> -->

    <!-- <div class="bg-bg_color w-100/100 mt-2 pb-2 pl-2 pr-2">
      <el-descriptions class="margin-top" :column="4" border>
        <template #title>
          <div style="margin-top: 20px; margin-left: 10px">薪酬福利</div>
        </template>
        <template #extra>
          <el-tooltip
            effect="dark"
            content="维护"
            placement="top"
          >
            <IconifyIconOffline
              style="margin-top: 20px; margin-right: 20px"
              :disabled="operation"
              class="cursor-pointer"
              icon="edit"
              width="16"
              color="text_color_regular"
              @click="CompensationFormHandleUpdate"
            />
          </el-tooltip>
        </template>
        <template style="margin-right: 20px; margin-left: 20px">
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">所在银行</div>
            </template>
            {{ CompensationList.bankName }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">工资账号</div>
            </template>
            {{ CompensationList.accountNo }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">公积金账号</div>
            </template>
            {{ CompensationList.housingFundNo }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">社保账号</div>
            </template>
            {{ CompensationList.socialInsureNo }}
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </div>
    <CompensationForm
      v-model:visible="formCompensationVisible"
      :data="CompensationformData"
      @search="Compensation"
    /> -->
  </el-form>
</template>
<style lang="scss" scoped>
.el-col-5 {
  width: 10%;
  padding-right: 0 !important;
  padding-left: 0 !important;
}

.header-container {
  display: flex;
  justify-content: space-between;
  padding: 24px 12px 16px;

  .header-container-button {
    flex-direction: row-reverse;
  }
}
</style>
