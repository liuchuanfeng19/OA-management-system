<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { FormInstance } from "element-plus";

import { getOfficeObject } from "@/api/officeObject";

const rules = {};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  assetsName: "", //物品名称
  assetsUnit: "", //单位
  qty: "", //数量
  availableQty: "", //有效数量
  assetsSpec: "", //规格型号及技术指标
  amount: 0, //金额
  remark: "" //备注
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const stauts = ref("");
const showType = ref("apply");
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getOfficeObject({ id });
  formData.value = data || {};

  formLoading.value = false;
}

// 提交表单
// const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(async valid => {
//     if (valid) {
//       if (showType.value == "edit") {
//         OfficeStuffUpdate(formData.value).then(({ code, message }) => {
//           if (code==0) {
//             ElMessage.success(message);
//             formVisible.value = false;
//             resetForm(formEl);
//             emit("search");
//           }
//         });
//       } else if (showType.value == "apply") {
//         OfficeStuffCreate(formData.value).then(({ code, message }) => {
//           if (code==0) {
//             ElMessage.success(message);
//             formVisible.value = false;
//             resetForm(formEl);
//             emit("search");
//           }
//         });
//       }
//     }
//   });
// }, 300);

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
    :width="640"
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="140px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="设备名称" prop="assetsName">
            <el-input v-model="formData.assetsName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="数量" prop="qty">
            <el-input v-model="formData.qty" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="规格型号及技术指标" prop="assetsSpec">
            <el-input v-model="formData.assetsSpec" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="有效数量" prop="availableQty">
            <el-input v-model="formData.availableQty" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="单位" prop="assetsUnit">
            <el-input v-model="formData.assetsUnit" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="金额" prop="amount">
            <el-input v-model="formData.amount" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <!-- <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button> -->
    </template>
  </el-dialog>
</template>
