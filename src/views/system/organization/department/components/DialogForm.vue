<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

import { userStaffStoreHook } from "@/store/modules/staff";
import { getDepartment, addDepartment } from "@/api/department";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { getStaffListNV } = userStaffStoreHook();
const { getDepartmentTree } = userDepartmentStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  parentId: undefined, //00000000-0000-0000-0000-000000000000
  parentDeptId: undefined,
  deptId: undefined,
  deptCode: "",
  deptCodeSel: "",
  parentDeptCode: "",
  deptMark: 0,
  fullName: "",
  managerStaffId: "",
  manager: "",
  assistantManagerStaffId: "",
  assistantManager: "",
  assistantManagerStaffId2: "",
  assistantManager2: "",
  hasChildren: true,
  sequence: 1,
  shortName: ""
};

// 表单校验规则
const rules = {
  fullName: [{ required: true, message: "请输入部门名称", trigger: "blur" }],
  shortName: [{ required: true, message: "请输入部门简称", trigger: "blur" }],
  deptCodeSel: [{ required: true, message: "请输入部门编号", trigger: "blur" }]
};

//el-cascader props属性值
const defaultProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  lazy: false,
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
defineProps({
  unitNatures: {
    type: Array<any>,
    default: () => {
      return [];
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const type = ref("add");
const cascaderRef = ref(null);
const formVisible = ref(false);
const formLoading = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const cascaderOptions = ref<CascaderOption[]>([]);
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加部门"
    : type.value == "edit"
      ? "编辑部门"
      : "";
});

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  getStaffListNV();
  await getDepartmentTree(); //同步刷新下全局状态的departmentTree
  cascaderOptions.value = JSON.parse(
    JSON.stringify(departmentTree.value)
  ) as CascaderOption[];
  if (_formData) {
    type.value = "edit";
    await getDetail(_formData.id);
    rebuildCascaderOptions(cascaderOptions.value, false);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 获取详情
const getDetail = async id => {
  const { data } = await getDepartment({ id });
  formData.value = data || {};
  formData.value.parentId = formData.value.parentDeptId;
  const deptCodes = formData.value.deptCode.split("-");
  if (deptCodes.length > 1) {
    formData.value.parentDeptCode = deptCodes
      .slice(0, deptCodes.length - 1)
      .join("-");
    formData.value.deptCodeSel = deptCodes[deptCodes.length - 1];
  } else {
    formData.value.parentDeptCode = "";
    formData.value.deptCodeSel = formData.value.deptCode;
  }
};

const rebuildCascaderOptions = (_cascaderOptions, isSelfOrChildren) => {
  _cascaderOptions = _cascaderOptions.map(item => {
    let _isSelfOrChildren = isSelfOrChildren;
    // 修改时父节点不能修改为当前节点
    if (item.id == formData.value.deptId) {
      console.log("禁用的部门", item.fullName);
      item.disabled = true;
      _isSelfOrChildren = true;
    } else {
      if (isSelfOrChildren) {
        item.disabled = true;
        _isSelfOrChildren = true;
        console.log("禁用的部门", item.fullName);
      } else {
        item.disabled = false;
        _isSelfOrChildren = false;
        console.log("可用的部门", item.fullName);
      }
    }
    if (item.children.length > 0) {
      rebuildCascaderOptions(item.children, _isSelfOrChildren);
    }
    return item;
  });
};

const handleDeptCodeSelChange = val => {
  console.log(val);
  if (formData.value.parentDeptCode) {
    formData.value.deptCode = `${formData.value.parentDeptCode}-${formData.value.deptCodeSel}`;
  } else {
    formData.value.deptCode = formData.value.deptCodeSel;
  }
};

// 父节点改变事件
const handleParentChange = (value: string) => {
  console.log(value);
  const checkedNodes = cascaderRef.value.getCheckedNodes();
  if (checkedNodes.length > 0) {
    formData.value.parentDeptCode = checkedNodes[0].data.deptCode;
    formData.value.deptCode = `${formData.value.parentDeptCode}-${formData.value.deptCodeSel}`;
  } else {
    formData.value.parentDeptCode = "";
    formData.value.deptCode = formData.value.deptCodeSel;
  }
};

const handleManagerChange = val => {
  const staff = staffListNV.value.find(item => item.value == val) || {};
  formData.value.manager = staff.name;
};
const handleAssistantManagerChange = val => {
  const staff = staffListNV.value.find(item => item.value == val) || {};
  formData.value.assistantManager = staff.name;
};
const handleAssistantManager2Change = val => {
  const staff = staffListNV.value.find(item => item.value == val) || {};
  formData.value.assistantManager2 = staff.name;
};

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  data.parentDeptId = data.parentId ? data.parentId : undefined;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await addDepartment(data);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :destroy-on-close="true"
    :width="596"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="78px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="父节点" prop="parentId">
            <el-cascader
              ref="cascaderRef"
              v-model="formData.parentId"
              style="width: 100%"
              :options="cascaderOptions"
              placeholder="请选择"
              clearable
              class="w-100/100"
              :props="defaultProps"
              :show-all-levels="false"
              @change="handleParentChange"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="企业性质" prop="deptMark">
            <el-select
              v-model="formData.deptMark"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in unitNatures"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门名称" prop="fullName">
            <el-input v-model.trim="formData.fullName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门简称" prop="shortName">
            <el-input v-model.trim="formData.shortName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门编号" prop="deptCodeSel">
            <el-input
              v-model.trim="formData.deptCodeSel"
              placeholder="请输入"
              @change="handleDeptCodeSelChange"
            >
              <template v-if="formData.parentDeptCode" #prepend
                >{{ formData.parentDeptCode }}-</template
              >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="主负责人" prop="managerStaffId">
            <el-select
              v-model="formData.managerStaffId"
              clearable
              filterable
              placeholder="请选择"
              style="width: 100%"
              @change="handleManagerChange"
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
          <el-form-item label="副负责人1" prop="assistantManagerStaffId">
            <el-select
              v-model="formData.assistantManagerStaffId"
              clearable
              filterable
              placeholder="请选择"
              style="width: 100%"
              @change="handleAssistantManagerChange"
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
          <el-form-item label="副负责人2" prop="assistantManagerStaffId2">
            <el-select
              v-model="formData.assistantManagerStaffId2"
              clearable
              filterable
              placeholder="请选择"
              style="width: 100%"
              @change="handleAssistantManager2Change"
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
          <el-form-item label="排序" prop="sequence">
            <el-input-number
              v-model="formData.sequence"
              :min="1"
              :max="999"
              :step="1"
              step-strictly
              :precision="0"
              value-on-clear="min"
              :controls="true"
              controls-position="right"
              style="width: 180px !important"
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
