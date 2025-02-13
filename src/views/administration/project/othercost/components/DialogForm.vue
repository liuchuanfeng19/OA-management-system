<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import {
  GetListNV,
  GetListNVProjCost,
  CreateCostOther,
  GetCostOther,
  UpdateCostOther,
  GetProjCostTypeNV
} from "@/api/project";
import { ElMessage, type FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projId: "",
  projName: "",
  timeRange: "",
  projCostId: "",
  name: "",
  total: 0,
  comment: ""
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
const CostData = ref([]); //项目预算月度
const ProjCostData = ref([]); //费用名称
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  GetProStatus();
  ProjCostname();
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
    ? "添加其他成本"
    : type.value == "edit"
      ? "编辑其他成本"
      : type.value == "query"
        ? "查看其他成本"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "change" }],
  projCostId: [{ required: true, message: "请选择月度", trigger: "change" }],
  name: [{ required: true, message: "请选择费用名称", trigger: "change" }],
  total: [{ required: true, message: "请输入费用总额", trigger: "change" }]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetCostOther({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateCostOther(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateCostOther(formData.value);
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
  const { data } = await GetListNVProjCost({ projId: val });
  CostData.value = data || {};
}
//费用名称
async function ProjCostname() {
  const { data } = await GetProjCostTypeNV();
  ProjCostData.value = data || [];
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
              <el-form-item label="月度" prop="projCostId">
                <el-select
                  v-model="formData.projCostId"
                  style="width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in CostData"
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
              <el-form-item label="费用名称" prop="name">
                <el-select
                  v-model="formData.name"
                  :disabled="type == 'query'"
                  style="width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in ProjCostData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="费用总额" prop="total">
                <el-input
                  v-model="formData.total"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="备注" prop="comment">
                <el-input
                  v-model="formData.comment"
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
