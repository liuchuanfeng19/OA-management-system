<script setup lang="ts">
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";
import _ from "lodash";
import { ref, computed } from "vue";
import { useGlobal } from "@pureadmin/utils";

import {
  updateAttach,
  getProjCredit,
  updateProjCredit,
  createProjCredit,
  cancelProjCredit,
  approveProjCredit
} from "@/api/projRegister";
import { columns } from "../constant";
import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import { GetInListNV } from "@/api/bidding";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { getUserListByRoleCodeNew } from "@/api/user";
import ReadDescriptions from "@/components/ReadDescriptions";

enum AuditResult {
  agree,
  refuse,
  back
}

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  cashierStaffList: $config.RoleCodeCashier,
  busiStaffList: $config.RoleCodeBusinessAssistant
};
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],

  oppCompany: [
    { required: true, message: "请输入对方公司", trigger: "change" }
  ],
  planTime: [{ required: true, message: "请选择预期日期", trigger: "change" }],
  finaStaffId: [
    { required: true, message: "请选择财务经办人", trigger: "change" }
  ],
  busiStaffId: [
    { required: true, message: "请选择业务申请人", trigger: "change" }
  ],
  reqCompany: [{ required: true, message: "请输入申请单位", trigger: "change" }]
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

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
  applyReason: "",
  cancelReason: "", //取消原因
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请
  doTemp: false, //是否暂存
  projectId: "", //项目ID
  projectFullName: "", //项目全称
  projectShortName: "", //项目简称
  reqCompany: "", //申请单位
  oppCompany: "", //对方公司
  planTime: "", //预期日期
  busiStaffId: "", //业务申请人ID
  busiStaffName: "", //业务申请人
  finaStaffId: "", //财务经办人ID
  finaStaffName: "", //财务经办人
  specialReq: "", //其他特殊要求
  attach: "", //附件
  finaStatusName: "",
  finaTime: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  cashierStaffList: [],
  busiStaffList: []
});
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const showType = ref("add");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const tableColumnData = ref([]);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const auditFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
const winBidProjectNVList = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加资信证明"
    : showType.value == "edit"
      ? "编辑资信证明"
      : showType.value == "read"
        ? "查看"
        : showType.value == "audit"
          ? "审批"
          : showType.value == "undo"
            ? "撤回"
            : showType.value == "upload"
              ? "资信证明底单上传"
              : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getProjectWinBidNVList();
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = "";
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
    showType.value = "add";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getProjCredit({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.attach != null && formData.value.attach != ""
      ? [
          {
            name: formData.value.attach.substr(
              formData.value.attach.lastIndexOf("/") + 1
            ),
            url: formData.value.attach
          }
        ]
      : [];
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }

  formLoading.value = false;
}

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleBusiChange(val) {
  const staff = staffList.value.busiStaffList.find(item => item.staffId == val);
  formData.value.bidBusiStaffName = staff.staffName;
  ruleFormRef.value.validateField("busiStaffId", () => null);
}

function handlecashiChange(val) {
  const staff = staffList.value.cashierStaffList.find(
    item => item.staffId == val
  );
  formData.value.finaStaffName = staff.staffName;
  ruleFormRef.value.validateField("finaStaffId", () => null);
}

async function getProjectWinBidNVList() {
  const { data } = await GetInListNV();
  winBidProjectNVList.value = data || [];
}

//选择中标项目之后关联数据
function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectFullName = project.name;
}

//上传文件
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    console.log("res", res);
    formData.value[options.action] = res["data"][0];
    // formData.value.attach.unshift(res["data"][0]);
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
function handleRemove(action: string) {
  formData.value[action] = "";
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (showType.value == "edit") {
          formData.value.doTemp = flag;
          updateProjCredit(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else if (showType.value == "add") {
          formData.value.doTemp = flag;
          createProjCredit(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else if (showType.value == "upload") {
          updateAttach({
            id: formData.value.id,
            attach: formData.value.attach
          }).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        }
      }
    });
  },
  300
);

// 提交审核表单
const submitAuditForm = _.debounce(
  async (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formEl.validate(async valid => {
      if (valid) {
        approveProjCredit({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1
        }).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
          }
        });
      }
    });
  },
  300
);

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await cancelProjCredit({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  reviewers.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="730"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="15"
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
      label-width="105px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              @change="handleProjectChange"
              ><el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="项目/合同名称" prop="projectFullName">
            <el-input v-model="formData.projectFullName" readonly />
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="申请单位" prop="reqCompany">
            <el-input
              v-model="formData.reqCompany"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="对方公司" prop="oppCompany">
            <el-input
              v-model="formData.oppCompany"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="预期日期" prop="planTime">
            <el-date-picker
              v-model="formData.planTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="业务申请人" prop="busiStaffId">
            <el-select
              v-model="formData.busiStaffId"
              :collapse-tags-tooltip="true"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              filterable
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              @change="handleBusiChange"
            >
              <el-option
                v-for="item in staffList.busiStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="财务经办人" prop="finaStaffId">
            <el-select
              v-model="formData.finaStaffId"
              :collapse-tags-tooltip="true"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              filterable
              :disabled="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
              @change="handlecashiChange"
            >
              <el-option
                v-for="item in staffList.cashierStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="其他特殊要求" prop="specialReq">
            <el-input
              v-model="formData.specialReq"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' || showType == 'read' || showType == 'undo'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' || showType == 'read' || showType == 'undo'
              "
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType != 'add' && showType != 'edit'"
          :span="24"
          :offset="0"
        >
          <el-form-item label="附件" prop="attach">
            <el-upload
              ref="uploadRef"
              :disabled="showType != 'upload'"
              accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png"
              :file-list="fileList"
              :auto-upload="true"
              :http-request="fileUpload"
              :limit="1"
              action="attach"
              :on-exceed="handleExceed"
              :on-remove="
                () => {
                  handleRemove('attach');
                }
              "
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button v-if="showType == 'upload'" type="primary" text
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft' ||
              showType == 'querydraft'
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :readonly="showType == 'read' || showType == 'querydraft'"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '112px'"
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
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="
          showType == 'add' ||
          showType == 'edit' ||
          showType == 'draft' ||
          showType == 'upload'
        "
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >确定
      </el-button>
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
        v-if="showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >

      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        @click="submitFormQuery(canceFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
