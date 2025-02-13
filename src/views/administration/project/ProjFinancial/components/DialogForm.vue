<script setup lang="ts">
import { ref, computed } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import {
  GetListNV,
  GetListNVByProjId,
  CreateFinance,
  GetFinance,
  UpdateFinance,
  GetPrepareFinance
} from "@/api/project";
import { ElMessage, type FormInstance } from "element-plus";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projIncInvoiceId: "",
  projIncInvoiceTimeExpr: "",
  realReceiveTime: "",
  realReceiveAmount: 0,
  comment: "",
  projId: "",
  projName: "",
  projCode: "",
  projContractId: "",
  projContractCode: "",
  projContractName: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ProData = ref([]); //项目列表
const ByProjIdData = ref([]); //根据项目id获取列表
const PrepareData = ref([]); //根据id获取开票申请准备数据
const { staffName } = useNav(); //用户名
const type = ref("add");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
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
    ? "添加财务收入"
    : type.value == "edit"
      ? "编辑财务收入"
      : type.value == "query"
        ? "查看财务收入"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "blur" }],
  projIncInvoiceId: [
    { required: true, message: "请选择开票申请", trigger: "blur" }
  ],
  realReceiveTime: [
    { required: true, message: "请选择实际收款时间", trigger: "change" }
  ],
  realReceiveAmount: [
    { required: true, message: "请输入实际收款金额", trigger: "blur" }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetFinance({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateFinance(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateFinance(formData.value);
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

//根据项目id获取列表
async function ListNVByProjId(val) {
  const { data } = await GetListNVByProjId({ projId: val });
  ByProjIdData.value = data || {};
}

//根据id获取准备数据
async function GetProPrepare(val) {
  const { data } = await GetPrepareFinance({ projIncInvoiceId: val });
  PrepareData.value = data || {};
  if (data) {
    formData.value.projContractId = data.projContractId;
    formData.value.projContractCode = data.projContractCode;
    formData.value.projContractName = data.projContractName;
    formData.value.projCode = data.projCode;
    formData.value.projName = data.projName;
    // formData.value.projIncInvoiceId = data.projIncInvoiceId;
  }
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="670"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="115px"
    >
      <div style="margin-right: 10px; margin-left: 10px">
        <div class="header">
          <el-row :gutter="20">
            <el-col :span="12" :offset="0">
              <el-form-item label="项目名称" prop="projId">
                <el-select
                  v-model="formData.projId"
                  :disabled="
                    type == 'query' || type == 'edit' || type == 'audit'
                  "
                  style="width: 100%"
                  placeholder="请选择"
                  @change="ListNVByProjId"
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
              <el-form-item label="开票申请" prop="projIncInvoiceId">
                <el-select
                  v-model="formData.projIncInvoiceId"
                  style="width: 100%"
                  placeholder="请选择"
                  @change="GetProPrepare"
                >
                  <el-option
                    v-for="item in ByProjIdData"
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
              <el-form-item label="开票申请" prop="projIncInvoiceTimeExpr">
                <el-input v-model="formData.projIncInvoiceTimeExpr" disabled />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="项目编号" prop="projCode">
                <el-input v-model="formData.projCode" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="合同名称" prop="projContractName">
                <el-input v-model="formData.projContractName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="合同编号" prop="projContractCode">
                <el-input v-model="formData.projContractCode" disabled />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="实际收款时间" prop="realReceiveTime">
                <el-date-picker
                  v-model="formData.realReceiveTime"
                  placeholder="请选择"
                  :disabled="type == 'query'"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="实际收款(万元)" prop="realReceiveAmount">
                <el-input
                  v-model="formData.realReceiveAmount"
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
