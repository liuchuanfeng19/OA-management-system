<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";

import {
  ContractJoinAdd,
  ApproveContractJoin,
  GetContractJoin,
  UpdateContractJoin
} from "@/api/contractJoin";
import { columns } from "../constant";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { uploadImg } from "@/api/common";
import { convertCurrency } from "@/utils/validate";
import ReadDescriptions from "@/components/ReadDescriptions";

enum AuditResult {
  agree,
  refuse,
  back
}

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  title: "", //合同摘要
  hasTax: true, //是否含税
  qty: "", //数量
  amount: 0, //合同价款小写
  amountCHN: "", //合同价款大写
  payMethod: "", //付款方式
  firstCode: "", //买方合同编号
  firstOrg: "", //甲方单位
  // supplyId: "", //乙方单位ID
  secondOrg: "", //乙方单位名称
  secondCode: "", //卖方合同编号
  stuff: "", //供方资信履历材料
  place: "", //实施地点
  doDeptId: "", //承办部门ID
  doDeptName: "", //承办部门
  doStaffId: "", //承办人ID
  doStaff: "", //承办人
  projectDuty: "" //项目负责人
};
// 表单校验规则;
const rules = {
  comment1: [{ required: true, message: "请填写审批意见", trigger: "blur" }],
  hasTax: [{ required: true, message: "请选择师傅含税", trigger: "change" }],
  title: [{ required: true, message: "请填写合同摘要", trigger: "blur" }],
  amount: [{ required: true, message: "请填写合同价款", trigger: "blur" }],
  payMethod: [{ required: true, message: "请填写付款方式", trigger: "blur" }],
  firstOrg: [{ required: true, message: "请填写甲方单位", trigger: "blur" }],
  secondOrg: [{ required: true, message: "请填写乙方单位", trigger: "blur" }],
  doDeptName: [{ required: true, message: "请填写承办部门", trigger: "blur" }],
  doStaff: [{ required: true, message: "请填写承办人", trigger: "blur" }],
  projectDuty: [
    { required: true, message: "请填写项目负责人", trigger: "blur" }
  ]
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

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const showType = ref("");
const reviewers = ref([]); //审批人员

const formData = ref({ ...INITIAL_DATA });

const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const tableColumnData = ref([]);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "read"
    ? "查看合同审核会签"
    : showType.value == "edit"
      ? "编辑合同审核会签"
      : showType.value == "audit"
        ? "审核合同审核会签"
        : showType.value == "apply"
          ? "申请合同审核会签"
          : "";
});

watch(
  () => formData.value.amount,
  newVal => {
    if (newVal) {
      handleBlur();
    }
  }
);
// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;

  showType.value = _type;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.stuff = "";
  if (_formData) {
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
  }
  formData.value.staffName = staffName;
  activeName.value = "baseInfo";
};
defineExpose({ show });

function handleBlur() {
  formData.value.amountCHN = convertCurrency(formData.value.amount);
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetContractJoin({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.stuff != null && formData.value.stuff != ""
      ? [
          {
            name: formData.value.stuff.substr(
              formData.value.stuff.lastIndexOf("/") + 1
            ),
            url: formData.value.stuff
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

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        formData.value.doTemp = flag;
        const { message, data } = await UpdateContractJoin(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        formData.value.doTemp = flag;
        const { message, data } = await ContractJoinAdd(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
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
      if (formData.value.canEditSellContractCode) {
        param["sellContractCode"] = formData.value.sellContractCode;
      }
      ApproveContractJoin(param)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            beforeClose();
          }
        })
        .catch()
        .finally(() => {
          formLoading.value = false;
        });
    }
  });
};

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

// 重置表单
const resetForm = () => {
  activeName.value = "baseInfo";
  if (ruleFormRef.value != null) {
    ruleFormRef.value.resetFields();
  }
  if (auditFormRef.value != null) {
    auditFormRef.value.resetFields();
  }
  reviewers.value = [];
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="820"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="beforeClose"
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
    />
    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="130px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="合同摘要" prop="title">
              <el-input
                v-model="formData.title"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="是否含税" prop="hasTax">
              <el-select
                v-model="formData.hasTax"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :disabled="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
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
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
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
            <el-form-item label="合同价款" prop="amountCHN">
              <el-input
                v-model="formData.amountCHN"
                placeholder="大写"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="付款方式" prop="payMethod">
              <el-input
                v-model="formData.payMethod"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="数量" prop="qty">
              <el-input
                v-model="formData.qty"
                type="number"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '见合同清单'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="甲方单位" prop="firstOrg">
              <el-input
                v-model="formData.firstOrg"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="买方合同编号"
              prop="firstCode"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.firstCode"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="乙方单位" prop="secondOrg">
              <el-input
                v-model="formData.secondOrg"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="卖方合同编号"
              prop="secondCode"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.secondCode"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item
              label="实施地点"
              prop="place"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.place"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="承办部门" prop="doDeptName">
              <el-input v-model="formData.doDeptName" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="承办人" prop="doStaff">
              <el-input v-model="formData.doStaff" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="项目负责人" prop="projectDuty">
              <el-input v-model="formData.projectDuty" />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="供方单位资信履约能力材料是否齐全" prop="stuff">
              <el-upload
                ref="uploadRef"
                :disabled="showType == 'read' || showType == 'audit'"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png"
                :file-list="fileList"
                :auto-upload="true"
                :http-request="fileUpload"
                :limit="1"
                action="stuff"
                :on-exceed="handleExceed"
                :on-remove="
                  () => {
                    handleRemove('stuff');
                  }
                "
                :on-error="handleError"
                :on-success="handleSuccess"
              >
                <el-button
                  v-if="showType == 'apply' || showType == 'edit'"
                  type="primary"
                  text
                  >选择文件</el-button
                >
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
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
      <el-button @click="beforeClose">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
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
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.remark {
  margin-top: 20px;
}
</style>
