<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { FormInstance, ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { ReturnBack } from "@/api/computerCollect";
import { userDepartmentStoreHook } from "@/store/modules/department";
import { getStaffList as getStaffListByDeptid } from "@/api/staff";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();

const { staffListNV } = storeToRefs(userStaffStoreHook());

const rules = {
  returnDeptId: [
    { required: true, message: "请选择交还部门", trigger: "change" }
  ],

  returnTime: [
    { required: true, message: "请选择交还日期", trigger: "change" }
  ],
  returnStaffId: [
    { required: true, message: "请选择交还人", trigger: "change" }
  ],
  returnDeptStaffId: [
    { required: true, message: "请选择交还部门主管", trigger: "change" }
  ],
  returnAdminStaffId: [
    { required: true, message: "请选择管理员", trigger: "change" }
  ],
  returnPlace: [{ required: true, message: "请输入交还位置", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  returnTime: "", //归还日期
  returnDeptId: "", //归还部门
  returnDeptStaffId: "",
  returnDeptStaffName: "",
  returnAdminStaffId: "",
  returnAdminStaffName: "",
  returnDeptName: "",
  returnStaffId: "", //交还人
  returnStaffName: "",
  returnPlace: "" //交还位置
};

const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref([]);
const showType = ref("add");
const formData = ref({ ...INITIAL_DATA });
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const { getDepartmentTree } = userDepartmentStoreHook();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "in" ? "交还入库" : "";
});

watch(
  () => formData.value.returnDeptId,
  val => {
    if (val) {
      getStaffList(val);
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }

  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    formData.value.id = _formData.id;
    showType.value = _type;
  }
};
defineExpose({ show });

//申请人选项接口
async function getStaffList(val) {
  const { data } = await getStaffListByDeptid({
    deptId: val,
    pageIndex: 1,
    pageSize: 9999
  });
  staffList.value = data.data || [];
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      ReturnBack(formData.value).then(({ code, message }) => {
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      });
    }
  });
}, 300);

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
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      style="margin-top: 10px"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="交还部门" prop="returnDeptId">
            <el-cascader
              v-model="formData.returnDeptId"
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

        <el-col :span="12" :offset="0">
          <el-form-item label="交还人" prop="returnStaffId">
            <el-select
              v-model="formData.returnStaffId"
              placeholder="请选择"
              style="width: 100%"
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
          <el-form-item label="交还部门主管" prop="returnDeptStaffId">
            <el-select
              v-model="formData.returnDeptStaffId"
              placeholder="请选择"
              style="width: 100%"
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
          <el-form-item label="管理员" prop="returnAdminStaffId">
            <el-select
              v-model="formData.returnAdminStaffId"
              filterable
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
          <el-form-item label="交还日期" prop="returnTime">
            <el-date-picker
              v-model="formData.returnTime"
              placeholder="请选择"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="存放位置" prop="returnPlace">
            <el-input v-model="formData.returnPlace" placeholder="请输入" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>

      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
