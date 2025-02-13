<script setup lang="ts">
import dayjs from "dayjs";
import { Layer } from "../types";
import { ref, watch, computed } from "vue";
import { saveUser, updateUser } from "@/api/user";
import { getStaffList } from "@/api/staff";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  userId: undefined, // 新增初始值必须为undefind
  deptId: "", // 部门Id
  allowTime: [
    dayjs().format("YYYY-MM-DD HH:mm:ss"),
    dayjs().add(100, "year").format("YYYY-MM-DD HH:mm:ss")
  ],
  allowStartTime: "",
  allowEndTime: "",
  lockDate: [
    dayjs().subtract(2, "minute").format("YYYY-MM-DD HH:mm:ss"),
    dayjs().subtract(1, "minute").format("YYYY-MM-DD HH:mm:ss")
  ],
  lockStartDate: "",
  lockEndDate: "",
  loginName: "",
  staffId: "",
  staffName: "",
  layer: 10,
  remarks: ""
};

// 表单校验规则
const rules = {
  deptId: [
    { required: true, message: "请输入选择所属部门", trigger: "change" }
  ],
  staffId: [{ required: true, message: "请输入选择用户", trigger: "change" }],
  loginName: [{ required: true, message: "请输入登录名", trigger: "blur" }]
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
    default: () => []
  },
  layerList: {
    type: Array as () => Array<Layer>,
    default: () => []
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const staffList = ref([]);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加用户"
    : type.value == "edit"
      ? "编辑用户"
      : "";
});

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formData.value?.deptId,
  val => {
    if (val) {
      getStaffListByDeptId();
    }
  }
);
watch(
  () => props.list,
  (val: CascaderOption[]) => {
    if (val) {
      cascaderOptions.value = val;
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  cascaderOptions.value = JSON.parse(
    JSON.stringify(props.list)
  ) as CascaderOption[];
  if (_formData) {
    type.value = "edit";
    formData.value = {
      ..._formData,
      allowTime: [_formData.allowStartTime, _formData.allowEndTime],
      lockDate: [_formData.lockStartDate, _formData.lockEndDate]
    };
    console.log("formData", formData.value);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// “所属部门”改变事件
const handleDeptChange = val => {
  console.log(val);
  formData.value.staffId = "";
};

// 根据部门Id获取员工列表
const getStaffListByDeptId = async () => {
  const { data = {} } = await getStaffList({
    deptId: formData.value.deptId,
    staffName: "",
    pageIndex: 1,
    pageSize: 255
  });
  staffList.value = data.data;
};

// “姓名”改变事件
const handleUserChange = val => {
  const staff = staffList.value.find(item => item.staffId == val) || {};
  formData.value.staffName = staff.staffName;
  formData.value.loginName = staff.staffCode;
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  delete data.type;
  data.allowStartTime = data.allowTime?.length > 0 ? data.allowTime[0] : "";
  data.allowEndTime = data.allowTime?.length > 0 ? data.allowTime[1] : "";
  data.lockStartDate = data.lockDate?.length > 0 ? data.lockDate[0] : "";
  data.lockEndDate = data.lockDate?.length > 0 ? data.lockDate[1] : "";
  delete data.allowTime;
  delete data.lockDate;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await saveUser(data);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (type.value == "edit") {
        const { code, message } = await updateUser(data);
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
  staffList.value = [];
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="620"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
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
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffId">
            <el-select
              v-model="formData.staffId"
              placeholder="请选择"
              :disabled="type == 'edit'"
              style="width: 100%"
              @change="handleUserChange"
            >
              <el-option
                v-for="item in staffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="用户名" prop="loginName">
            <el-input
              v-model.trim="formData.loginName"
              :disabled="type == 'edit'"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="级别">
            <el-select
              v-model="formData.layer"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in props.layerList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="允许登录时间">
            <el-date-picker
              v-model="formData.allowTime"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期时间"
              :editable="false"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="锁定登录时间">
            <el-date-picker
              v-model="formData.lockDate"
              style="width: 100%"
              class="put"
              format="YYYY-MM-DD HH:mm:ss"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              :editable="false"
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              show-word-limit
              :rows="3"
              :maxlength="255"
              placeholder="请输入"
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
