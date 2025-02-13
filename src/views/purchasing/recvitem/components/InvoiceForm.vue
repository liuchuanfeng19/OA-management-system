<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { UpdateAccInvoiceAmount, GetAccDetail } from "@/api/joinSign";
// 表单模型
const INITIAL_DATA = {
  id: "",
  invoiceAmount: 0, //发票已开
  unInvoiceAmount: 0 //发票未开
};

// 表单校验规则
const fromRules = {
  invoiceAmount: [
    { required: true, message: "请输入发票已开数量", trigger: "blur" }
  ],
  unInvoiceAmount: [
    { required: true, message: "请输入发票未开数量", trigger: "blur" }
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
  return showType.value == "invoice" ? "开具发票" : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAccDetail({ id });
  formData.value = data || {};
  formData.value.id = data.joinSignId;
  formLoading.value = false;
}

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      UpdateAccInvoiceAmount({
        id: formData.value.id,
        invoiceAmount: formData.value.invoiceAmount,
        unInvoiceAmount: formData.value.unInvoiceAmount
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
    :width="400"
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
        <el-col :span="24" :offset="0">
          <el-form-item label="发票已开" prop="invoiceAmount">
            <el-input
              v-model.trim="formData.invoiceAmount"
              type="number"
              placeholder="请输入"
              @input="
                val => {
                  formData.invoiceAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="发票未开" prop="unInvoiceAmount">
            <el-input
              v-model.trim="formData.unInvoiceAmount"
              type="number"
              placeholder="请输入"
              @input="
                val => {
                  formData.unInvoiceAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
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
