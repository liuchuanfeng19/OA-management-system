<script setup lang="ts">
import { ElMessage, FormInstance } from "element-plus";
import _ from "lodash";

import { ref, computed } from "vue";

import { UpdateSimple1 } from "@/api/pssManage";

const rules = {
  customerName: [
    { required: true, message: "请输入单位名称", trigger: "blur" }
  ],

  invoiceAmount: [
    { required: true, message: "请输入开票金额", trigger: "blur" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  customerName: "",
  invoiceAmount: 0
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const showType = ref("add");
const formData = ref(null);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const rowId = ref(null);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "update" ? "更新" : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    rowId.value = _formData.id;
  }
};
defineExpose({ show });

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formData.value.id = rowId;
      UpdateSimple1(formData.value).then(({ code, message }) => {
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      });
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
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="360"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="85px"
    >
      <el-row :gutter="20" style="margin-top: 10px">
        <el-col :span="24" :offset="0">
          <el-form-item label="单位名称" prop="customerName">
            <el-input v-model="formData.customerName" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="开票金额" prop="invoiceAmount">
            <el-input
              v-model="formData.invoiceAmount"
              @input="
                val => {
                  formData.invoiceAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
