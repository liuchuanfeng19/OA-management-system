<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import {
  GetListNV,
  GetListNVProjCost,
  CreateCostpeople,
  GetCostpeople,
  UpdateCostpeople
} from "@/api/project";
import { getalljobtitle } from "@/api/jobs";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projCostId: "",
  projId: "",
  projName: "",
  staffId: "",
  staffName: "",
  deptId: "",
  deptName: "",
  mobile: "",
  timeRange: "",
  controlSalary: 0,
  basicSalary: 0,
  jobTitleSalary: 0,
  benefitSalary: 0,
  workSalary: 0,
  punishAmount: 0,
  mealAmount: 0,
  bxStandard: 0,
  bxBalance: 0,
  bxAmount: 0,
  bxReward: 0,
  bxRewardComment: "",
  bxOther: 0,
  bxAvailable: 0,
  total1: 0,
  total2: 0,
  comSocialAmount: 0,
  comHouseAmount: 0,
  comYearAmount: 0,
  staffSocialAmount: 0,
  staffHouseAmount: 0,
  staffYearAmount: 0,
  staffTaxAmount: 0,
  shouldSalary: 0,
  realSalary: 0,
  reserveSalary: 0,
  total: 0
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
const CostData = ref([]); //项目成本月度
const JobData = ref([]); //岗位名称
const { staffName } = useNav(); //用户名
const type = ref("add");
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  jobname();
  GetProStatus();
  getStaffListNV();
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
    ? "添加人员成本"
    : type.value == "edit"
      ? "编辑人员成本"
      : type.value == "query"
        ? "查看人员成本"
        : "";
});

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "blur" }],
  projCostId: [{ required: true, message: "请选择月度", trigger: "blur" }],
  staffId: [{ required: true, message: "请选择人员", trigger: "blur" }],
  controlSalary: [
    { required: true, message: "请输入工资控制标准", trigger: "blur" }
  ],
  basicSalary: [{ required: true, message: "请输入基本工资", trigger: "blur" }],
  jobTitleSalary: [
    { required: true, message: "请输入岗位工资", trigger: "blur" }
  ],
  benefitSalary: [
    { required: true, message: "请输入效益工资", trigger: "blur" }
  ],
  workSalary: [{ required: true, message: "请输入考勤工资", trigger: "blur" }],
  bxAmount: [
    { required: true, message: "请输入当月实际报销", trigger: "blur" }
  ],
  comSocialAmount: [
    { required: true, message: "请输入公司社保缴纳金额", trigger: "blur" }
  ],
  comHouseAmount: [
    { required: true, message: "请输入公司公积金缴纳基数", trigger: "blur" }
  ],
  comYearAmount: [
    { required: true, message: "请输入公司年金金额", trigger: "blur" }
  ],
  staffSocialAmount: [
    { required: true, message: "请输入个人社保缴纳金额", trigger: "blur" }
  ],
  staffHouseAmount: [
    { required: true, message: "请输入个人公积金缴纳基数", trigger: "blur" }
  ],
  staffYearAmount: [
    { required: true, message: "请输入个人年金金额", trigger: "blur" }
  ],
  staffTaxAmount: [
    { required: true, message: "请输入个人所得税", trigger: "blur" }
  ]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetCostpeople({ id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateCostpeople(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateCostpeople(formData.value);
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
async function GetProCost(val) {
  const { data } = await GetListNVProjCost({ projId: val });
  CostData.value = data || {};
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
    :width="660"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
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
                  @change="GetProCost"
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
              <el-form-item label="人员姓名" prop="staffId">
                <el-select
                  v-model="formData.staffId"
                  :disabled="type == 'query'"
                  placeholder="请选择"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in staffListNV"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="电话" prop="mobile">
                <el-input
                  v-model="formData.mobile"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="工资控制标准" prop="controlSalary">
                <el-input
                  v-model="formData.controlSalary"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="基本工资" prop="basicSalary">
                <el-input
                  v-model="formData.basicSalary"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="岗位工资" prop="jobTitleSalary">
                <el-input
                  v-model="formData.jobTitleSalary"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="效益工资" prop="benefitSalary">
                <el-input
                  v-model="formData.benefitSalary"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="考勤工资" prop="workSalary">
                <el-input
                  v-model="formData.workSalary"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12" :offset="0">
              <el-form-item label="罚款" prop="punishAmount">
                <el-input
                  v-model="formData.punishAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="餐补" prop="mealAmount">
                <el-input
                  v-model="formData.mealAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="基本报销准则" prop="bxStandard">
                <el-input
                  v-model="formData.bxStandard"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="当月实际报销" prop="bxAmount">
                <el-input
                  v-model="formData.bxAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="奖励报销" prop="bxReward">
                <el-input
                  v-model="formData.bxReward"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="奖励报销备注" prop="bxRewardComment">
                <el-input
                  v-model="formData.bxRewardComment"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="其他报销" prop="bxOther">
                <el-input
                  v-model="formData.bxOther"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="社保(公司)" prop="comSocialAmount">
                <el-input
                  v-model="formData.comSocialAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="公积金(公司)" prop="comHouseAmount">
                <el-input
                  v-model="formData.comHouseAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="年金(公司)" prop="comYearAmount">
                <el-input
                  v-model="formData.comYearAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="社保(个人)" prop="staffSocialAmount">
                <el-input
                  v-model="formData.staffSocialAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="公积金(个人)" prop="staffHouseAmount">
                <el-input
                  v-model="formData.staffHouseAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="年金(个人)" prop="staffYearAmount">
                <el-input
                  v-model="formData.staffYearAmount"
                  placeholder="请输入"
                  :disabled="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12" :offset="0">
              <el-form-item label="个人所得税" prop="staffTaxAmount">
                <el-input
                  v-model="formData.staffTaxAmount"
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
