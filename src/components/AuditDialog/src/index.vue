<script setup lang="ts">
import _ from "lodash";
import { ref } from "vue";
import type { FormInstance } from "element-plus";

type AuditType = {
  id: string; //审核项的Id
  auditStatus: number; //审核状态，2-通过，3-不通过
  auditOpinion: string; //审核意见
  auditType: number; //审核类型，1-车间审核，2-房建段审核
};

// 表单模型
const INITIAL_DATA: AuditType = {
  id: "",
  auditStatus: 2,
  auditOpinion: "",
  auditType: 0
};
// 表单校验规则
const fromRules = {
  auditOpinion: [
    {
      message: "请填写审核意见",
      trigger: "change",
      validator: (rule, value, callback) => {
        console.log("value ==“” ", value == "");
        console.log("!formData.value.result", !formData.value.auditOpinion);
        if (value == "" && formData.value.auditStatus == 3) {
          callback(new Error("不通过时请填写审核意见"));
        } else {
          callback();
        }
      }
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits<{ (e: "submit", auditData: AuditType): void }>();

const dialogTitle = ref("审核");
const postLoading = ref(false);
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref<AuditType>({ ...INITIAL_DATA });

/**
 * 子组件暴露给父组件调用的方法
 * @param _id
 * @param _auditType
 */
const show = async (_id, _auditType) => {
  dialogVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  formData.value.id = _id;
  formData.value.auditType = _auditType;
};
/**
 * 子组件暴露给父组件调用的方法
 */
function hide() {
  dialogVisible.value = false;
  postLoading.value = false;
  resetForm(ruleFormRef.value);
}
defineExpose({ show, hide });

function handleResult(val) {
  if (val) {
    formData.value.auditOpinion = "";
  }
  ruleFormRef.value.validateField("auditOpinion", () => null);
}

/**
 * 提交表单
 */
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      postLoading.value = true;
      emit("submit", formData.value);
    }
  });
}, 300);

/**
 * 重置表单
 */
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

/**
 * 关闭对话框
 */
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    destroy-on-close
    :title="dialogTitle"
    :width="664"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="20">
        <el-col :offset="0" :span="24">
          <el-form-item label="审核结果" prop="auditStatus">
            <el-radio-group
              v-model="formData.auditStatus"
              @change="handleResult"
            >
              <el-radio :label="2">通过</el-radio>
              <el-radio :label="3">未通过</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :offset="0" :span="24">
          <el-form-item label="审批意见" prop="auditOpinion">
            <el-input
              v-model.trim="formData.auditOpinion"
              placeholder="请输入"
              :autosize="{ minRows: 2, maxRows: 4 }"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button
        :loading="postLoading"
        type="primary"
        @click="submitForm(ruleFormRef)"
      >
        保存
      </el-button>
    </template>
  </el-dialog>
</template>
