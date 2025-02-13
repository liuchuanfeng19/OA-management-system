<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import {
  GetProjStatusNV,
  Create,
  GetPro,
  Update,
  GetListPrimaryNV
} from "@/api/project";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  name: "",
  code: "",
  dutyStaffId: "",
  dutyStaffName: "",
  zsInfo: "",
  tbInfo: "",
  projContractId: "",
  status: 1,
  statusExpr: "",
  projAddress: "",
  projNature: "",
  buildUnit: "",
  qualityUnit: "",
  designUnit: "",
  contractUnit: "",
  qualityLevel: "",
  projAmount: 0,
  htStartTime: "",
  htEndTime: "",
  realStartTime: "",
  realEndTime: ""
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const ProStatusData = ref([]); //项目状态
const PrimaryList = ref([]); //主合同列表
const type = ref("add");
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  GetPrimaryList();
  GetProStatus();
  getStaffListNV();
  formVisible.value = true;
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加项目"
    : type.value == "edit"
      ? "编辑项目"
      : type.value == "query"
        ? "查看项目"
        : "";
});

// 表单校验规则;

const rules = {
  name: [{ required: true, message: "请输入项目名称", trigger: "blur" }],
  dutyStaffId: [
    { required: true, message: "请选择项目负责人", trigger: "change" }
  ],
  status: [{ required: true, message: "请选择项目状态", trigger: "change" }],
  projAddress: [{ required: true, message: "请选择工程地址", trigger: "blur" }],
  projNature: [
    { required: true, message: "请输入工程性质", trigger: "change" }
  ],
  buildUnit: [{ required: true, message: "请输入建设单位", trigger: "blur" }],
  contractUnit: [
    { required: true, message: "请输入承包单位", trigger: "blur" }
  ],
  projAmount: [{ required: true, message: "请输入工程造价", trigger: "blur" }],
  qualityLevel: [
    { required: true, message: "请输入质量等级", trigger: "blur" }
  ],
  htStartTime: [
    { required: true, message: "请选择合同开工日期", trigger: "change" }
  ],
  htEndTime: [
    { required: true, message: "请选择合同竣工日期", trigger: "change" }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetPro({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await Update(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await Create(formData.value);
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

//获取项目状态
async function GetProStatus() {
  const { data } = await GetProjStatusNV({ includeAll: false });
  ProStatusData.value = data || {};
}

//获取主合同列表
async function GetPrimaryList() {
  const { data } = await GetListPrimaryNV();
  PrimaryList.value = data || {};
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
              <el-form-item label="项目名称" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="项目编码" prop="code">
                <el-input
                  v-model="formData.code"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="负责人" prop="dutyStaffId">
                <el-select
                  v-model="formData.dutyStaffId"
                  :disabled="type == 'query'"
                  placeholder="请选择"
                  :style="{ width: '100%' }"
                  ><el-option
                    v-for="item in staffListNV"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                /></el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="合同信息" prop="projContractId">
                <el-select
                  v-model="formData.projContractId"
                  :disabled="type == 'querySecond'"
                  style="width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in PrimaryList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
                <!-- <el-input
                  placeholder="请输入合同信息"
                  :disabled="type == 'query'"
                  v-model="formData.projContractId"
                /> -->
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="项目状态" prop="status">
                <el-select
                  v-model="formData.status"
                  :disabled="type == 'query'"
                  style="width: 100%"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in ProStatusData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="工程地址" prop="projAddress">
                <el-input
                  v-model="formData.projAddress"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="工程性质" prop="projNature">
                <el-input
                  v-model="formData.projNature"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="建设单位" prop="buildUnit">
                <el-input
                  v-model="formData.buildUnit"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="质检单位" prop="qualityUnit">
                <el-input
                  v-model="formData.qualityUnit"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="设计单位" prop="designUnit">
                <el-input
                  v-model="formData.designUnit"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="承包单位" prop="contractUnit">
                <el-input
                  v-model="formData.contractUnit"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="质量等级" prop="qualityLevel">
                <el-input
                  v-model="formData.qualityLevel"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="工程造价(万元)" prop="projAmount">
                <el-input
                  v-model="formData.projAmount"
                  type="number"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12" :offset="0">
              <el-form-item label="合同开工日期" prop="htStartTime">
                <el-date-picker
                  placeholder="请选择合同开工日期"
                  :disabled="type == 'query'"
                  v-model="formData.htStartTime"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col> -->

            <!-- <el-col :span="12" :offset="0">
              <el-form-item label="合同竣工日期" prop="htEndTime">
                <el-date-picker
                  placeholder="请选择合同竣工日期"
                  :disabled="type == 'query'"
                  v-model="formData.htEndTime"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col> -->
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
