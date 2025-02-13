<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { UpdateAccContractContent, GetAccDetail } from "@/api/joinSign";
// 表单模型
const INITIAL_DATA = {
  id: "",
  contractContent: "" //合同内容
};

// 表单校验规则
const fromRules = {
  contractContent: [
    { required: true, message: "请输入合同内容", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "contract"
    ? "编辑合同内容"
    : showType.value == "invoice"
      ? "发票开具"
      : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value.id == _formData.id;
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      UpdateAccContractContent({
        id: formData.value.id,
        contractContent: formData.value.contractContent
      })
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
}, 300);

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAccDetail({ id });
  formData.value = data || {};

  formLoading.value = false;
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="600"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="0px"
    >
      <el-row :gutter="40">
        <el-col :span="24" :offset="0">
          <el-form-item prop="contractContent">
            <el-input
              v-model.trim="formData.contractContent"
              placeholder="请输入"
              type="textarea"
              :rows="12"
              show-word-limit
              :maxlength="2000"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="loading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
