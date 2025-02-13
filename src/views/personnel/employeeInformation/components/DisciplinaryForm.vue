<script setup lang="ts">
import { ref, watch, computed } from "vue";
import {
  CreateRewardPunishment,
  UpdateRewardPunishment,
  getRpTypeNV
} from "@/api/personnel";
import { ElMessage, FormInstance } from "element-plus";
import moment from "moment";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入奖惩名称", trigger: "blur" }],
  comment: [{ required: true, message: "请输入备注", trigger: "blur" }],
  happenDate: [{ required: true, message: "请输入奖惩日期", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(props.data);
const formLoading = ref(false);
const rpTypeList = ref([]);
// console.log(formData.value, "formData");
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return props.data.type == "add"
    ? "添加奖惩记录"
    : props.data.type == "edit"
      ? "编辑奖惩记录"
      : "";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formVisible.value,
  val => {
    emit("update:visible", val);
  }
);
watch(
  () => props.visible,
  val => {
    if (!formData.value.id) {
      formData.value.rpType =
        rpTypeList.value.length > 0 ? rpTypeList.value[0].value : "";
    }
    formVisible.value = val;
  }
);
watch(
  () => props.data,
  val => {
    formData.value = val;
    if (!formData.value.happenDate) {
      formData.value.happenDate = moment().format("YYYY/MM/DD");
    }
  }
);

// 获取奖惩列表
async function getRpTypeList() {
  //获取后台该数据全部信息接口
  const { data } = await getRpTypeNV();
  rpTypeList.value = data || [];
}

const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (props.data.type == "add") {
        const { code, message } = await CreateRewardPunishment(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (props.data.type == "edit") {
        const { code, message } = await UpdateRewardPunishment(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

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
//日期缺省
formData.value.happenDate = new Date(+new Date() + 8 * 3600 * 1000)
  .toISOString()
  .replace(/T/g, " ")
  .replace(/\.[\d]{3}Z/, "");

getRpTypeList();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="300"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="奖惩类型" prop="rpType">
            <el-select
              v-model="formData.rpType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in rpTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="日期" prop="happenDate">
            <el-date-picker
              v-model="formData.happenDate"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="comment">
            <el-input v-model="formData.comment" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
