<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { saveStaff, updateStaff } from "@/api/staff";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";
import { nationalList } from "@/utils/nationalList";
import { GetListNVByDeptId } from "@/api/jobs";
import { isPhone } from "@pureadmin/utils";
import { isIdCard, isTel } from "@/utils/validate";
import { GeJobStatusListNv } from "@/api/personnel";

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  staffId: undefined, // 新增初始值必须为undefind
  deptName: "",
  deptId: "",
  staffCode: "",
  staffName: "",
  sex: "男",
  nativePlace: "",
  nationality: "汉族",
  birthday: "",
  mobile: "",
  shortNumber: "",
  idcard: "",
  jobStatus: 1,
  jobTitleId: "",
  jobLevel: "",
  officePhone: "",
  homeAddress: "",
  remarks: ""
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  list: {
    type: Array,
    default: () => {
      return [];
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const JobtreeData = ref([]);
const formVisible = ref(false);
const formData = ref(null);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");
const jobStatusData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加职工"
    : type.value == "edit"
      ? "编辑职工"
      : "";
});

const validatePhone = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isPhone(value)) {
    callback(new Error("手机号格式不正确"));
  } else {
    callback();
  }
};
const validateIDCard = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isIdCard(value)) {
    callback(new Error("身份证号格式不正确"));
  } else {
    callback();
  }
};
const validateTel = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback();
  }
  if (!isTel(value)) {
    callback(new Error("办公电话格式不正确"));
  } else {
    callback();
  }
};
// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => props.list,
  (val: CascaderOption[]) => {
    if (val) {
      cascaderOptions.value = val;
    }
  }
);
// 表单校验规则
const rules = {
  deptId: [
    { required: true, message: "请输入选择所属部门", trigger: "change" }
  ],
  staffCode: [{ required: true, message: "请输入工号", trigger: "blur" }],
  staffName: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  birthday: [{ required: true, message: "请选择出生日期", trigger: "change" }],
  mobile: [{ required: false, validator: validatePhone, trigger: "blur" }],
  idCard: [{ required: false, validator: validateIDCard, trigger: "blur" }],
  officePhone: [{ required: false, validator: validateTel, trigger: "blur" }]
};

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  cascaderOptions.value = JSON.parse(
    JSON.stringify(props.list)
  ) as CascaderOption[];
  if (_formData) {
    type.value = "edit";
    formData.value = { ..._formData };
    jobname(_formData.deptId);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

//岗位选项接口
async function jobname(val) {
  const { data } = await GetListNVByDeptId({ deptId: val });
  JobtreeData.value = data || [];
}

// “所属部门”改变事件
const handleDeptChange = val => {
  jobname(val);
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  delete data.allowTime;
  delete data.lockDate;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await saveStaff(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (type.value == "edit") {
        const { code, message } = await updateStaff(data);
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
  //姓名列表在对话框关闭前需要重置，否则下次打开对话框可以选择上次的用户列表
  resetForm(ruleFormRef.value);
};

//员工在职状态
async function jobstatus() {
  const { data } = await GeJobStatusListNv();
  jobStatusData.value = data || [];
}

// mounted周期函数
onMounted(async () => {
  jobstatus();
});
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="580"
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
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="所属部门" prop="deptId">
            <el-cascader
              v-model="formData.deptId"
              style="width: 100%"
              :options="cascaderOptions"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              @change="handleDeptChange"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工编号" prop="staffCode">
            <el-input v-model="formData.staffCode" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="员工姓名" prop="staffName">
            <el-input v-model="formData.staffName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item label="性别">
            <el-input v-model="formData.sex" placeholder="请输入性别" />
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="formData.sex" style="width: 100%">
              <el-option label="男" value="男" />
              <el-option label="女" value="女" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="籍贯">
            <el-input v-model="formData.nativePlace" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="民族" prop="nationality">
            <el-select
              v-model="formData.nationality"
              style="width: 100%"
              placeholder="请选择"
              value-key="name"
            >
              <el-option
                v-for="item in nationalList"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birthday">
            <el-date-picker
              v-model="formData.birthday"
              format="YYYY-MM-DD"
              placeholder="请选择"
              style="width: 100%"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机">
            <el-input v-model="formData.mobile" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="短号">
            <el-input
              v-model="formData.shortNumber"
              type="number"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="身份证号">
            <el-input v-model="formData.idCard" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="在职状态">
            <el-select v-model="formData.jobStatus" placeholder="请选择">
              <el-option
                v-for="item in jobStatusData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职务" prop="jobTitleId">
            <el-select
              v-model="formData.jobTitleId"
              placeholder="请选择"
              :style="{ width: '480px' }"
            >
              <el-option
                v-for="item in JobtreeData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职称">
            <el-input v-model="formData.jobLevel" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办公电话">
            <el-input
              v-model="formData.officePhone"
              type="number"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="家庭住址">
            <el-input v-model="formData.homeAddress" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="formData.remarks"
              placeholder="请输入"
              show-word-limit
              maxlength="255"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
