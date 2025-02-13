<script setup lang="ts">
import { ref, computed } from "vue";
import {
  GetQualiCategoriesNV,
  Get,
  Createdq,
  GetQualiTypesByCategoryNV,
  Updatedq
} from "@/api/qualification";
import { ElMessage, FormInstance } from "element-plus";
import { getAllAliveStaffNV } from "@/api/staff";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  qualiType: 1,
  qualiCategory: "",
  qualiTypeName: "",
  advancedPeriod: "1",
  notifyInterval: "1",
  receiverIds: "",
  qualiTypeIdExpr: "",
  qualiCategoryExpr: ""
};

// 表单校验规则
const rules = {
  qualiCategory: [
    { required: true, message: "请选择资质分类", trigger: "change" }
  ],
  qualiTypeName: [
    { required: true, message: "请选择资质类型", trigger: "change" }
  ],
  advancedPeriod: [
    { required: true, message: "请输入提前通知天数", trigger: "blur" }
  ],
  notifyInterval: [
    { required: true, message: "请输入提醒周期(天)", trigger: "blur" }
  ],
  receiverIds: [{ required: true, message: "请选择通知人员", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref(null);
const type = ref("add");
const certTypes = ref([]);
const JobtreeData = ref([]);
const staffList = ref([]);
const QualiType = ref([]);
const staffLoading = ref(false);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加到期提醒"
    : type.value == "edit"
      ? "编辑到期提醒"
      : type.value == "query"
        ? "查看到期提醒"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  jobname();
  //getStaffListByName("");
  getStaffList();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await Get({ id: id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await Createdq(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await Updatedq(formData.value);
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

// 根据部门Id获取人员
const getStaffListByName = async staffName => {
  if (staffName) {
    staffLoading.value = true;
    setTimeout(async () => {
      staffLoading.value = false;
      const data = staffList.value.filter(item => {
        return item.name.toLowerCase().includes(staffName.toLowerCase());
      });
      JobtreeData.value = data;
    }, 200);
  } else {
    JobtreeData.value = staffList.value;
  }
  // staffLoading.value = true;
  // setTimeout(async () => {
  //   const { data = {} } = await getAllAliveStaffNV({
  //     deptId: "",
  //     staffName: staffName
  //   });
  //   JobtreeData.value = data;
  //   staffLoading.value = false;
  // }, 200);
};

const getStaffList = async () => {
  const { data = {} } = await getAllAliveStaffNV();
  staffList.value = data;
  JobtreeData.value = data;
};

//资质证书分类
async function jobname() {
  const { data } = await GetQualiCategoriesNV();
  certTypes.value = data || [];
}

//资质证书类型
async function getQualiType(val) {
  const { data } = await GetQualiTypesByCategoryNV({ qualiCategory: val });
  QualiType.value = data || [];
}
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
    :width="660"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="资质分类" prop="qualiCategory">
            <el-select
              v-model="formData.qualiCategory"
              :disabled="type == 'query'"
              :placeholder="type == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              @change="getQualiType"
            >
              <el-option
                v-for="item in certTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="资质类型" prop="qualiTypeName">
            <el-select
              v-model="formData.qualiTypeName"
              :disabled="type == 'query'"
              :placeholder="type == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in QualiType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="提前通知天数" prop="advancedPeriod">
            <el-input
              v-model="formData.advancedPeriod"
              type="number"
              :disabled="type == 'query'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
            <!-- <el-input-number
              style="width: 180px !important"
              :disabled="type == 'query'"
              v-model="formData.advancedPeriod"
              :min="1"
              :max="9999"
              :step="1"
              :step-strictly="true"
              :precision="0"
              :controls="false"
              value-on-clear="min"
              controls-position="right"
            /> -->
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="提醒周期(天)" prop="notifyInterval">
            <el-input
              v-model="formData.notifyInterval"
              type="number"
              :disabled="type == 'query'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
            <!-- <el-input-number
              style="width: 180px !important"
              :disabled="type == 'query'"
              v-model="formData.notifyInterval"
              :min="1"
              :max="9999"
              :step="1"
              :step-strictly="true"
              :precision="0"
              :controls="false"
              value-on-clear="min"
              controls-position="right"
            /> -->
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="提醒通知接收人" prop="receiverIds">
            <el-select
              :disabled="type == 'query'"
              multiple
              reserve-keyword
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :remote-method="getStaffListByName"
              v-model="formData.receiverIds"
              placeholder="请选择"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in JobtreeData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col> -->
        <el-col :span="12" :offset="0">
          <el-form-item label="提醒通知接收人" prop="receiverIds">
            <el-select
              v-model="formData.receiverIds"
              :disabled="type == 'query'"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :style="{ width: '100%' }"
              :placeholder="type == 'read' ? '' : '请选择'"
              remote
              :remote-method="getStaffListByName"
              multiple
              filterable
              :reserve-keyword="true"
              :loading="staffLoading"
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
      </el-row>
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
        >确定</el-button
      >
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
