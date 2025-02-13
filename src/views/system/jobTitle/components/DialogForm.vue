<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, watch, computed, onMounted } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import { userDepartmentStoreHook } from "@/store/modules/department";
import { updateJobTitle, createJobTitle, getJobTitle } from "@/api/jobs";

defineOptions({
  name: "jobTitleForm"
});
const { getDepartmentTree } = userDepartmentStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

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
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return formData.value.id ? "编辑岗位" : "添加岗位";
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
    formVisible.value = val;
  }
);
watch(
  () => props.data,
  val => {
    if (val.id && val.id != "00000000-0000-0000-0000-000000000000") {
      getDetail();
    } else {
      formData.value = val;
    }
    formData.value = val;
  }
);

// 表单校验规则;
const rules = {
  fullName: [{ required: true, message: "请输入全称", trigger: "blur" }],
  shortName: [{ required: true, message: "请输入简称", trigger: "blur" }],
  deptId: [
    {
      validator: (rule: any, value: any, callback: any) => {
        //debugger;
        if (value === "" || value == "00000000-0000-0000-0000-000000000000") {
          callback("请输入所属部门");
        } else {
          callback();
        }
      },
      required: true,
      message: "请输入所属部门",
      trigger: "change"
    }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail() {
  formLoading.value = true;
  const { data } = await getJobTitle({ id: props.data.id });
  formData.value = data || {};
  if (data && data.jobTitleId) {
    formData.value.id = data.jobTitleId; //重新设置一个id属性
  }
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { code, message } = await updateJobTitle(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await createJobTitle(formData.value);
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

onMounted(() => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="560"
    draggable
    :before-close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="70px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label-width="80px" label="全称" prop="fullName">
            <el-input v-model="formData.fullName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label-width="80px" label="简称" prop="shortName">
            <el-input v-model="formData.shortName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label-width="80px" label="所属部门" prop="deptId">
            <el-cascader
              v-model="formData.deptId"
              :options="departmentTree"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            label-width="80px"
            label="岗位职责"
            prop="jobResponsibility"
          >
            <el-input
              v-model="formData.jobResponsibility"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            label-width="80px"
            label="任职资格"
            prop="jobCompetency"
          >
            <el-input
              v-model="formData.jobCompetency"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
