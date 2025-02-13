<script setup lang="ts">
import type {
  UploadFile,
  UploadFiles,
  FormInstance,
  UploadUserFile,
  UploadInstance
} from "element-plus";
// import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
// import { getUserInfo } from "@/api/user";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { convertCurrency } from "@/utils/validate";
import {
  CreatePurJoinSign,
  GetPurJoinSign,
  UpdatePurJoinSign,
  ApprovePurJoinSign,
  CancelPurJoinSign
} from "@/api/purJoinSign";
import { userDepartmentStoreHook } from "@/store/modules/department";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

enum AuditResult {
  agree,
  refuse,
  back
}

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  handStaffIdList: $config.RoleCodePurchasingSpecialist
};

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  title: "", //合同摘要
  attachContract: [],
  hasTax: true, //是否含税
  qty: 0, //数量
  amount: 0, //合同价款小写
  amountCHN: "", //合同价款大写
  payMethod: "", //付款方式
  firstContractCode: "", //买方合同编号
  firstCompany: "", //甲方单位
  secondCompany: "", //乙方单位
  // supplyId: "", //乙方单位ID
  // supplyName: "", //乙方单位名称（只读）
  secondContractCode: "", //卖方合同编号
  attachSupply: [], //供方资信履历材料
  workAddress: "", //实施地点
  handDeptId: "", //承办部门ID
  handDeptName: "", //承办部门
  handStaffId: "", //承办人ID
  handStaffName: "", //承办人
  remark: "",
  cancelReason: ""
};

// 表单校验规则
const fromRules = {
  title: [{ required: true, message: "请填写合同摘要", trigger: "blur" }],
  payMethod: [{ required: true, message: "填写付款方式", trigger: "blur" }],
  firstCompany: [
    { required: true, message: "请填写甲方单位", trigger: "blur" }
  ],
  attachContract: [
    { required: true, message: "请上传采购明细", trigger: "change" }
  ],
  secondCompany: [
    { required: true, message: "请填写乙方单位", trigger: "blur" }
  ],
  handStaffId: [{ required: true, message: "请选择承办人", trigger: "change" }],

  comment1: [{ required: true, message: "请填写审批意见", trigger: "blur" }],
  handDeptId: [{ required: true, message: "请选择承办部门", trigger: "change" }]
};

const validateAuditForm = (rule: any, value: any, callback: any) => {
  if (!value && auditResult.value != AuditResult.agree) {
    return callback(new Error("审核意见不能为空"));
  } else {
    callback();
  }
};

//审核表单验证规则
const auditFormRules = {
  comment1: [
    {
      message: "审核意见不能为空",
      validator: validateAuditForm
    }
  ]
};

const emit = defineEmits(["search"]);
const { getDepartmentTree } = userDepartmentStoreHook();

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  handStaffIdList: []
});

const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});

const tableColumnData = ref([]);
const formLoading = ref(false);
const stauts = ref("");
const reviewers = ref([]); //审批人员
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const showType = ref("apply");
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const uploadRef1 = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();
const attachContractUploading = ref(false);
const attachSupplyDocUploading = ref(false);
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请采购会签单"
    : showType.value == "edit"
      ? "编辑采购会签单"
      : showType.value == "audit"
        ? "审核采购会签单"
        : showType.value == "read"
          ? "查看采购会签单"
          : showType.value == "undo"
            ? "撤回采购会签单"
            : "";
});

const sureDisabled = computed(() => {
  return attachContractUploading.value || attachSupplyDocUploading.value
    ? true
    : false;
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attachContract = [];
  INITIAL_DATA.attachSupply = [];

  if (_formData) {
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  }
  dialogVisible.value = true;
  showType.value = _showType;
  // getUser();
  activeName.value = "baseInfo";
};
defineExpose({ show });

async function getDetail(id) {
  const { data } = await GetPurJoinSign({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.attachSupply != null &&
    formData.value.attachSupply.length > 0
      ? formData.value.attachSupply.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  fileList1.value =
    formData.value.attachContract != null &&
    formData.value.attachContract.length > 0
      ? formData.value.attachContract.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
}

//获取当前登录人员信息
// const getUser = async () => {
//   const { data } = await getUserInfo();
//   formData.value.handDeptName = data.departmentName;
//   formData.value.handStaffId = data.staffId;
// };

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleBusiChange(val) {
  const staff = staffList.value.handStaffIdList.find(
    item => item.staffId == val
  );
  formData.value.handStaffName = staff.staffName;
  ruleFormRef.value.validateField("handStaffId", () => null);
}

function handleBlur() {
  formData.value.amountCHN = convertCurrency(formData.value.amount);
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "apply") {
        const { code, message } = await CreatePurJoinSign(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await UpdatePurJoinSign(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

// 提交审核表单
const submitAuditForm = async (
  formEl: FormInstance | undefined,
  _auditResult: AuditResult
) => {
  if (!formEl) return;
  auditResult.value = _auditResult;
  formEl.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      const param = {
        id: formData.value.id,
        isApproved:
          _auditResult == AuditResult.agree
            ? true
            : _auditResult == AuditResult.refuse
              ? false
              : false,
        isReturnBack: _auditResult == AuditResult.back ? true : false,
        comment1: auditData.value.comment1
      };

      ApprovePurJoinSign(param)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            dialogVisible.value = false;
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            resetForm(formEl);
          }
        })
        .catch()
        .finally(() => {
          formLoading.value = false;
        });
    }
  });
};

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await CancelPurJoinSign({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  activeName.value = "baseInfo";
  if (!formEl) return;
  formEl.resetFields();
  if (auditFormRef.value != null) {
    auditFormRef.value.resetFields();
  }
  reviewers.value = [];
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
  fileList.value = [];
  fileList1.value = [];
  uploadRef.value?.clearFiles();
  uploadRef1.value?.clearFiles();
};

//上传合同附件
async function handleUpLoadImg1(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList1.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError1 = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess1 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove1(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//上传供方资信履历材料
async function handleUpLoadImg(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1000"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="20"
    />
    <el-tabs
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="审核信息" name="auditInfo" />
    </el-tabs>
    <!-- 表单内容 -->
    <ReadDescriptions
      v-if="showType == 'audit' || showType == 'read' || showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      title=""
      :columnData="tableColumnData"
      :rowData="formData"
      :column="2"
      class="mb-2"
    />

    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="130px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="合同摘要" prop="title">
            <el-input
              v-model="formData.title"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'audit'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="采购明细" prop="attachContract">
            <el-upload
              ref="uploadRef1"
              accept="*"
              action="attachContract"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="handleUpLoadImg1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'attachContract');
                }
              "
              :on-error="handleError1"
              :on-success="handleSuccess1"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否含税" prop="hasTax">
            <el-select
              v-model="formData.hasTax"
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              clearable
            >
              <el-option label="含税" :value="true" />
              <el-option label="不含税" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="合同价款" prop="amount">
            <el-input
              v-model="formData.amount"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'audit'"
              @input="
                val => {
                  formData.amount = val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
              @blur="handleBlur"
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="付款方式" prop="payMethod">
            <el-input
              v-model="formData.payMethod"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同价款(大写)" prop="amountCHN">
            <el-input v-model="formData.amountCHN" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="甲方单位" prop="firstCompany">
            <el-input
              v-model="formData.firstCompany"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="买方合同编号" prop="firstContractCode">
            <el-input
              v-model="formData.firstContractCode"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="乙方单位" prop="secondCompany">
            <el-input
              v-model="formData.secondCompany"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
              :readonly="showType == 'read' || showType == 'audit'"
            />
            <!-- <el-select
              v-model="formData.supplyId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              clearable
              @change="supplyData"
            >
              <el-option
                v-for="item in supplyList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select> -->
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="卖方合同编号" prop="secondContractCode">
            <el-input
              v-model="formData.secondContractCode"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="6" :offset="0">
          <el-form-item label="承办部门" prop="handDeptId">
            <el-cascader
              v-model="formData.handDeptId"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              style="width: 120px"
              :options="departmentTree"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
            <!-- <el-input
              v-model="formData.handDeptName"
              style="width: 120px"
              readonly
            /> -->
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item
            label="承办人"
            prop="handStaffId"
            label-width="105px !important"
          >
            <el-select
              v-model="formData.handStaffId"
              filterable
              :disabled="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请选择'
              "
              style="width: 120px"
              @change="handleBusiChange"
            >
              <el-option
                v-for="item in staffList.handStaffIdList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="实施地点" prop="workAddress">
            <el-input
              v-model="formData.workAddress"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item
            label="供方单位资信履约能力材料是否齐全"
            prop="attachSupply"
          >
            <el-upload
              ref="uploadRef"
              accept="*"
              action="attachSupply"
              :auto-upload="true"
              :file-list="fileList"
              :http-request="handleUpLoadImg"
              :on-error="handleError"
              :on-success="handleSuccess"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove(uploadFile, uploadFiles, 'attachSupply');
                }
              "
            >
              <el-button type="primary" text :loading="attachSupplyDocUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :readonly="showType == 'read' || showType == 'audit'"
              :placeholder="
                showType == 'read' || showType == 'audit' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft'
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :disabled="showType == 'read'"
              :rows="2"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form
      v-if="showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      ref="canceFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="68px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' || (stauts == '已撤销' && showType == 'read')
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :rows="2"
              placeholder="请输入"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <AuditForm
      v-if="
        (showType == 'read' || showType == 'undo' || showType == 'audit') &&
        activeName == 'auditInfo'
      "
      :showType="showType"
      :reviewers="reviewers"
    />
    <el-form
      v-if="showType == 'audit'"
      ref="auditFormRef"
      class="audit-form"
      :class="{ 'mt-4': activeName == 'baseInfo' }"
      :model="auditData"
      :rules="auditFormRules"
      :inline="false"
      :label-width="activeName == 'auditInfo' ? '92px' : '130px'"
    >
      <el-form-item label="审核意见" prop="comment1">
        <el-input
          v-model.trim="auditData.comment1"
          type="textarea"
          :rows="2"
          show-word-limit
          :maxlength="255"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        :disabled="sureDisabled"
        @click="submitForm(ruleFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
