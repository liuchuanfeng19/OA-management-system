<script setup lang="ts">
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import _ from "lodash";
import { ref, computed } from "vue";

import { emitter } from "@/utils/mitt";
import { uploadImg } from "@/api/common";
import { useNav } from "@/layout/hooks/useNav";
import { Approve, GetApply } from "@/api/asset";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { DownloadButton } from "@/components/DownloadButton";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  mobile: "",
  deptName: "",
  assetsId: "",
  assetsCode: "",
  assetsName: "",
  reason: "",
  qty: "",
  // comment: "",
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  img: [],
  canCancel: "",
  canApprove: "",
  currentReviewerId: "",
  comment1: "",
  applyReason: ""
};

// 表单校验规则;
const fromRules = {
  comment1: [{ required: true, message: "请填写", trigger: "change" }]
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

enum AuditResult {
  agree,
  refuse,
  back
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const showType = ref("add");
const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return showType.value == "add"
    ? "申请"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : showType.value == "audit"
          ? "审核"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "add";
  }
  formData.value.staffName = staffName;
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetApply({ id });
  formData.value = data || {};
  if (formData.value.img && formData.value.img.length > 0) {
    fileList1.value = formData.value.img.map(item => {
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
  }
  formLoading.value = false;
}

//上传
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList1.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
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

// 提交审核表单
const submitAuditForm = _.debounce(
  async (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formEl.validate(valid => {
      if (valid) {
        formLoading.value = true;
        Approve({
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
            formLoading.value = false;
          });
      }
    });
  },
  300
);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  fileList1.value = [];
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
    :width="684"
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
      label-width="92px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="资产名称" prop="assetsName">
            <el-input v-model="formData.assetsName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="资产编号" prop="assetsCode">
            <el-input v-model="formData.assetsCode" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="申请人姓名" prop="staffName">
            <el-input v-model="formData.staffName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="formData.mobile" disabled />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="申请数量" prop="qty">
            <el-input v-model="formData.qty" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="领取时间" prop="applyTime">
            <el-date-picker
              v-model="formData.applyTime"
              disabled
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="资产图片" prop="img">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              disabled
              accept=".jpg"
              action="img"
              :auto-upload="true"
              :show-file-list="showType == 'add'"
              :http-request="fileUpload1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('img');
                }
              "
              :on-success="handleSuccess1"
            >
              <DownloadButton
                v-if="
                  fileList1.length > 0 &&
                  (showType == 'read' || showType == 'audit')
                "
                :showFileName="true"
                :srcList="fileList1.map(item => item.url)"
              />
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="申请事由" prop="applyReason">
            <el-input v-model="formData.applyReason" disabled />
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
        {{ showType == "read" ? "关闭" : "取消" }}
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
        v-if="false"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
    </template>
  </el-dialog>
</template>
