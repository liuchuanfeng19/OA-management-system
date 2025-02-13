<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { ElMessage, FormInstance } from "element-plus";

import {
  getOfficeStuff,
  OfficeStuffUpdate,
  OfficeStuffCreate
} from "@/api/officeStuff";
import { getOfficeObject } from "@/api/officeObject";
import { GetOfficeListNV } from "@/api/officeObject";
import { storeToRefs } from "pinia";
import { userStaffStoreHook } from "@/store/modules/staff";
import { getStaffList as getStaffListByDeptid } from "@/api/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { getStaffListNV } = userStaffStoreHook();
const rules = {
  ayStaffId: [{ required: true, message: "请选择领用人", trigger: "change" }],
  qty: [{ required: true, message: "请输入领用数量", trigger: "blur" }],
  ayDeptId: [{ required: true, message: "请选择领用部门", trigger: "change" }],
  ayTime: [{ required: true, message: "请选择领用日期", trigger: "change" }],
  ayPlace: [{ required: true, message: "请输入存放位置", trigger: "blur" }],
  adminStaffId: [
    { required: true, message: "请选择管理员", trigger: "change" }
  ],
  officeObjectId: [
    { required: true, message: "请选择设备名称", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
const { getDepartmentTree } = userDepartmentStoreHook();

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  officeObjectId: "",
  assetsName: "", //物品名称
  assetsCode: "", //设备编号
  assetsSpec: "", //型号
  assetsValue: "", //价值
  qty: "", //数量
  state: "",
  stateName: "",
  ayStaffId: "", //领用人
  ayStaffName: "",
  ayDeptId: "", //领用部门
  ayDeptName: "",
  ayTime: "", //领用日期
  ayReturnTime: "", //交还日期
  ayPlace: "", //存放位置
  adminStaffId: "", //管理员ID
  adminStaffName: "",
  remark: "" //备注
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { staffListNV } = storeToRefs(userStaffStoreHook());
const stauts = ref("");
const showType = ref("apply");
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const ruleFormRef = ref<FormInstance>();
const staffList = ref([]);
const officeList = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : "";
});

watch(
  () => formData.value.ayDeptId,
  newVal => {
    if (!newVal) {
      formData.value.ayDeptName = "";
      return;
    }
    getStaffList(newVal);
  }
);

//设备NV列表
async function getOfficeList(id) {
  const { data } = await GetOfficeListNV({ id: id });
  officeList.value = data || [];
}

//申请人选项接口
async function getStaffList(val) {
  const { data } = await getStaffListByDeptid({
    deptId: val,
    pageIndex: 1,
    pageSize: 9999
  });
  staffList.value = data.data || [];
}

function handleStaff(val) {
  const staff = staffList.value.find(item => item.staffId == val);
  formData.value.ayStaffName = staff.staffName;
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  getStaffListNV();

  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
    await getOfficeList(formData.value.officeObjectId);
  } else {
    showType.value = "apply";
    getOfficeList(null);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getOfficeStuff({ id });
  formData.value = data || {};

  formLoading.value = false;
}

//根据办公用品ID获取详情
async function getDetails(val) {
  formLoading.value = true;
  const { data } = await getOfficeObject({ id: val });
  formData.value.assetsCode = data.assetsCode;
  formData.value.assetsSpec = data.assetsSpec;
  formData.value.assetsValue = data.amount;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "edit") {
        OfficeStuffUpdate(formData.value).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        });
      } else if (showType.value == "apply") {
        OfficeStuffCreate(formData.value).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        });
      }
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
    :class="showType == 'apply' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="85px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="设备名称" prop="officeObjectId">
            <el-select
              v-model="formData.officeObjectId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="getDetails"
            >
              <el-option
                v-for="item in officeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="设备编号" prop="assetsCode">
            <el-input v-model="formData.assetsCode" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="型号/参数" prop="assetsSpec">
            <el-input v-model="formData.assetsSpec" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="价值" prop="assetsValue">
            <el-input v-model="formData.assetsValue" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="数量" prop="qty">
            <el-input
              v-model="formData.qty"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="管理员" prop="adminStaffId">
            <el-select
              v-model="formData.adminStaffId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
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

        <el-col :span="24" :offset="0">
          <el-form-item label="存放位置" prop="ayPlace">
            <el-input
              v-model="formData.ayPlace"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="领用部门" prop="ayDeptId">
            <el-cascader
              v-model="formData.ayDeptId"
              :options="departmentTree"
              :disabled="showType == 'read'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
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
          <el-form-item label="领用人" prop="ayStaffId">
            <el-select
              v-model="formData.ayStaffId"
              filterable
              :disabled="showType == 'read'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
            >
              <el-option
                v-for="item in staffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
                @change="handleStaff"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="领用时间" prop="ayTime">
            <el-date-picker
              v-model="formData.ayTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="showType == 'read'"
              :placeholder="showType != 'apply' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :placeholder="showType == 'read' ? '' : '请输入'"
              :readonly="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
