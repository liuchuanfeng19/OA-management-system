<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { addExample, editExample, getExample } from "@/api/example";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  roleCode: "", //示例标识
  allowEdit: 1, //是否允许编辑
  allowDelete: 1, //是否允许删除
  isVisible: 1, //是否显示
  roleName: "", //示例名称
  isValid: true, //示例状态
  isEnable: 1, //是否启用
  isSelected: true,
  remarks: "" //示例描述
};

// 表单校验规则
const fromRules = {
  roleName: [{ required: true, message: "请输入示例名称", trigger: "blur" }],
  roleCode: [{ required: true, message: "请输入示例标识", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加示例"
    : showType.value == "edit"
      ? "编辑示例"
      : showType.value == "read"
        ? "查看示例"
        : showType.value == "apply"
          ? "申请示例"
          : showType.value == "audit"
            ? "审核示例"
            : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取费用报销详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await getExample({
    id
  });
  formData.value = data || {};
  loading.value = false;
};

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      if (showType.value == "add") {
        addExample(formData.value)
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
      } else if (showType.value == "edit") {
        editExample(formData.value)
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
    }
  });
}, 300);

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
    :width="632"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="示例名称" prop="roleName">
            <el-input
              v-model.trim="formData.roleName"
              :readonly="showType == 'read'"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="示例标识" prop="roleCode">
            <el-input
              v-model.trim="formData.roleCode"
              :readonly="showType == 'read'"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="示例描述" prop="remarks">
            <el-input
              v-model.trim="formData.remarks"
              :readonly="showType == 'read'"
              type="textarea"
              show-word-limit
              :maxlength="255"
              placeholder="请输入"
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
