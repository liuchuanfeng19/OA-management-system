<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import {
  GetListNV,
  Createbudget,
  GetProbudget,
  Updatebudget
} from "@/api/project";
import { getTree } from "@/api/department";
import { ElMessage, type FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projId: "",
  projName: "",
  timeRange: "",
  staffBudget: 0,
  otherBudget: 0,
  projIncome: 0,
  projProfit: 0,
  attach: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ProData = ref([]); //项目列表
const departmentData = ref([]); //部门列表
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  GetProStatus();
  departmentname();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加项目预算"
    : type.value == "edit"
      ? "编辑项目预算"
      : type.value == "query"
        ? "查看项目预算"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "blur" }],
  timeRange: [{ required: true, message: "请选择月度", trigger: "change" }],
  staffBudget: [
    { required: true, message: "请输入人事预算总额", trigger: "blur" }
  ],
  otherBudget: [
    { required: true, message: "请选择其他预算总额", trigger: "blur" }
  ],
  projIncome: [
    { required: true, message: "请输入项目预计收入", trigger: "blur" }
  ],
  projProfit: [
    { required: true, message: "请输入项目预计利润", trigger: "blur" }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetProbudget({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await Updatebudget(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await Createbudget(formData.value);
        if (data) {
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

//获取项目列表
async function GetProStatus() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}
//部门选项接口
async function departmentname() {
  const { data } = await getTree();
  departmentData.value = data || [];
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="600"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <div style="margin-right: 10px; margin-left: 10px">
        <div class="header">
          <el-row :gutter="20">
            <el-col :span="12" :offset="0">
              <el-form-item label="项目名称" prop="projId">
                <el-select
                  v-model="formData.projId"
                  :disabled="type == 'query' || type == 'edit'"
                  style="width: 100%"
                  :placeholder="
                    type == 'query' || type == 'edit' ? '' : '请选择'
                  "
                >
                  <el-option
                    v-for="item in ProData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="月度" prop="timeRange">
                <el-date-picker
                  v-model="formData.timeRange"
                  :placeholder="
                    type == 'query' || type == 'edit' ? '' : '请选择'
                  "
                  :disabled="type == 'query' || type == 'edit'"
                  format="YYYY-MM"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="人事预算" prop="staffBudget">
                <el-input
                  v-model="formData.staffBudget"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="其他预算" prop="otherBudget">
                <el-input
                  v-model="formData.otherBudget"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="预计收入" prop="projIncome">
                <el-input
                  v-model="formData.projIncome"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="预计利润" prop="projProfit">
                <el-input
                  v-model="formData.projProfit"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24" :offset="0">
              <el-form-item label="附件" prop="attach">
                <el-input
                  v-model="formData.attach"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>

      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
