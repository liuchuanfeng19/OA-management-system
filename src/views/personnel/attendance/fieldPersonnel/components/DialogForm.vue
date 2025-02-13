<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import {
  updateOutAttendApply,
  addOutAttendApply,
  getOutAttendApplyDetail,
  approveOutAttendApply,
  cancelOutAttendApply
} from "@/api/fieldPersonnel";
import { uploadImg } from "@/api/common";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";
enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
  applyType: "",
  attDate: "",
  address: "",
  attType: 1,
  applyReason: "",
  tripDest: "",
  tripTickets: false,
  applyStatus: "",
  applyStatusExpr: "",
  currentReviewerId: "",
  canApprove: "",
  ccIds: "",
  isApproved: "",
  isReturnBack: "",
  comment: "",
  cancelReason: "",
  canEdit: "",
  canTemp: false,
  doTemp: false,
  comment1: "",
  outImg: [] //附件
};
const rules = {
  applyReason: [
    { required: true, message: "请输入申请外勤理由", trigger: "blur" }
  ],
  address: [
    {
      required: true,
      message: "请输入申请外勤地点",
      trigger: "blur"
    }
  ],
  attType: [
    {
      required: true,
      message: "请选择外勤类型",
      trigger: "change"
    }
  ],
  attDate: [
    {
      required: true,
      message: "请选择外勤日期",
      trigger: "change"
    }
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

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const canTemp1 = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const showType = ref("add");
const requesting = ref(false);
const { staffName } = useNav(); //用户名
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const auditFormRef = ref<FormInstance>();
const ruleFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return showType.value == "add"
    ? "外勤申请"
    : showType.value == "edit"
      ? "外勤编辑"
      : showType.value == "draft"
        ? "外勤草稿"
        : showType.value == "read"
          ? "外勤查看"
          : showType.value == "querydraft"
            ? "外勤查看"
            : showType.value == "audit"
              ? "外勤审批"
              : showType.value == "undo"
                ? "外勤撤回"
                : showType.value == "undodraft"
                  ? "外勤撤回"
                  : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  activeName.value = "baseInfo";
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
    stauts.value = "";
    formData.value.staffName = staffName;
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getOutAttendApplyDetail({ id });
  formData.value = data || {};
  if (formData.value.outImg && formData.value.outImg.length > 0) {
    fileList1.value = formData.value.outImg.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
    canTemp1.value = data.canTemp;
  }
  formLoading.value = false;
}

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance/fieldPersonnel";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

function handleRemove1(action: string) {
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess1 = async _response => {};

const handleExceed1: UploadProps["onExceed"] = _files => {};

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        requesting.value = true;
        if (formData.value.id) {
          formData.value.doTemp = flag;
          const { code, message } = await updateOutAttendApply(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        } else {
          formData.value.doTemp = flag;
          console.log(formData.value, "formData.value");
          const { code, message } = await addOutAttendApply(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        }
        requesting.value = false;
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
    formEl.validate(valid => {
      if (valid) {
        requesting.value = true;
        approveOutAttendApply({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1
        })
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
              emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            }
          })
          .catch()
          .finally(() => {
            requesting.value = false;
          });
      }
    });
  },
  300
);

// 提交撤回表单
const submitFormQuery = _.debounce(async () => {
  requesting.value = true;
  const { code, message } = await cancelOutAttendApply({
    id: formData.value.id,
    cancelReason: formData.value.cancelReason
  });
  if (code == 0) {
    ElMessage.success(message);
    formVisible.value = false;
    emit("search");
  }
  requesting.value = false;
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  activeName.value = "baseInfo";
  reviewers.value = [];
};

//关闭对话框
const closeDialog = () => {
  fileList1.value = [];
  formData.value.outImg = [];
  formVisible.value = false;
  auditData.value.comment1 = "";
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="720"
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
      class="mt-2"
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
      :rules="rules"
      label-width="92px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffName">
            <el-input v-model="formData.staffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="外勤时间" prop="attDate">
            <el-date-picker
              v-model="formData.attDate"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="外勤类型" prop="attType">
            <el-select
              v-model="formData.attType"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              :style="{ width: '100%' }"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            >
              <el-option label="上班" :value="1" />
              <el-option label="下班" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="外勤地点" prop="address">
            <el-input
              v-model="formData.address"
              :rows="2"
              type="textarea"
              placeholder="请注明申请外勤地点"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="外勤事由" prop="applyReason">
            <el-input
              v-model="formData.applyReason"
              :rows="2"
              type="textarea"
              placeholder="请注明申请外勤事由"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="证明材料" prop="outImg">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              :disabled="showType == 'read' || showType == 'audit'"
              accept=".jpg,.png,jpeg"
              action="outImg"
              :auto-upload="true"
              :show-file-list="showType == 'add' || showType == 'edit'"
              :http-request="fileUpload1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('outImg');
                }
              "
              :on-success="handleSuccess1"
            >
              <el-button
                v-if="showType == 'add' || showType == 'edit'"
                type="primary"
                text
              >
                选择文件
              </el-button>
              <DownloadButton
                v-if="
                  fileList1.length > 0 &&
                  (showType == 'read' ||
                    showType == 'audit' ||
                    showType == 'undo')
                "
                :showFileName="true"
                :srcList="fileList1.map(item => item.url)"
              />
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' || stauts == '撤销' || showType == 'undodraft'
            "
            label="撤销理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :readonly="showType == 'read'"
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
      :label-width="activeName == 'auditInfo' ? '92px' : '92px'"
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
        {{ showType == "read" || showType == "querydraft" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="
          showType == 'add' ||
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
        :loading="requesting"
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit' || showType == 'draft'"
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        :loading="requesting"
        type="primary"
        @click="submitFormQuery()"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <!-- <el-button
        v-if="showType == 'audit'"
        type="success"
        :loading="requesting"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      > -->
    </template>
  </el-dialog>
</template>
