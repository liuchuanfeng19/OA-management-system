<script setup lang="ts">
import { ref, computed } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import {
  GetListNV,
  GetBudgetListNV,
  CreateStaffbudget,
  GetStaffbudget,
  UpdateStaffbudget
} from "@/api/project";
import { getalljobtitle } from "@/api/jobs";
import { ElMessage, type FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projBudgetId: "",
  projId: "",
  projName: "",
  timeRange: "",
  jobTitleId: "",
  jobTitle: 0,
  qty: "",
  perSalaryInsurance: "",
  perMealAmount: "",
  sumSalaryInsurance: "",
  sumMealAmount: "",
  total: ""
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
const ProData = ref([]); //项目列表
const BudgetData = ref([]); //项目预算月度

const JobData = ref([]); //岗位名称
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  jobname();
  GetProStatus();
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
    ? "添加人员预算"
    : type.value == "edit"
      ? "编辑人员预算"
      : type.value == "query"
        ? "查看人员预算"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "change" }],
  projBudgetId: [{ required: true, message: "请选择月度", trigger: "change" }],
  jobTitleId: [{ required: true, message: "请选择岗位", trigger: "change" }],
  qty: [{ required: true, message: "请输入岗位人数", trigger: "blur" }],
  perSalaryInsurance: [
    { required: true, message: "请输入个人工资", trigger: "blur" }
  ],
  perMealAmount: [
    { required: true, message: "请输入个人餐补", trigger: "blur" }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetStaffbudget({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateStaffbudget(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateStaffbudget(formData.value);
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

//获取项预算月度
async function GetProBudget(val) {
  const { data } = await GetBudgetListNV({ projId: val });
  BudgetData.value = data || {};
}

//岗位选项接口
async function jobname() {
  const { data } = await getalljobtitle();
  JobData.value = data || [];
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="700"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="130px"
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
                  placeholder="请选择"
                  @change="GetProBudget"
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
            <el-col v-if="type == 'add'" :span="12" :offset="0">
              <el-form-item label="月度" prop="projBudgetId">
                <el-select
                  v-model="formData.projBudgetId"
                  style="width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in BudgetData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col
              v-if="type == 'query' || type == 'edit'"
              :span="12"
              :offset="0"
            >
              <el-form-item label="月度" prop="timeRange">
                <el-date-picker
                  v-model="formData.timeRange"
                  :disabled="type == 'query' || type == 'edit'"
                  type="date"
                  format="YYYY-MM"
                  value-format="YYYY-MM"
                  :style="{ width: '100%' }"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="岗位" prop="jobTitleId">
                <el-select
                  v-model="formData.jobTitleId"
                  :disabled="type == 'query'"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in JobData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="岗位人数" prop="qty">
                <el-input
                  v-model="formData.qty"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="个人工资(含保险)" prop="perSalaryInsurance">
                <el-input
                  v-model="formData.perSalaryInsurance"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="个人餐补" prop="perMealAmount">
                <el-input
                  v-model="formData.perMealAmount"
                  placeholder="请输入"
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
