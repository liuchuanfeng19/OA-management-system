<script setup lang="ts">
import { ref, computed } from "vue";
import {
  GetNotify,
  UpdateNotify,
  GetBuildsNotifyTypeNV,
  CreateNotify
} from "@/api/builds";
import { ElMessage, FormInstance } from "element-plus";
import { getAllAliveStaffNV } from "@/api/staff";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  type: 1,
  typeExpr: "",
  advancedPeriod: "1",
  notifyInterval: "1",
  receiverIds: ""
};

// 表单校验规则
const rules = {
  type: [{ required: true, message: "请选择租赁类型", trigger: "change" }],
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
const BuildsNotifyTypes = ref([]); //房屋到期提醒类型
const JobtreeData = ref([]); //人员
const staffList = ref([]);
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
  getAllAliveStaffList();
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
  const { data } = await GetNotify({ id: id });
  formData.value = data || {};
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        const { code, message } = await CreateNotify(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await UpdateNotify(formData.value);
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

const getStaffListByName = async staffName => {
  if (staffName) {
    setTimeout(async () => {
      const data = staffList.value.filter(item => {
        return item.name.toLowerCase().includes(staffName.toLowerCase());
      });
      JobtreeData.value = data;
    }, 200);
  } else {
    JobtreeData.value = staffList.value;
  }
};

// 根据部门Id获取人员
const getAllAliveStaffList = async () => {
  const { data = {} } = await getAllAliveStaffNV();
  staffList.value = data;
  JobtreeData.value = data;
};

//房屋租赁类型
async function BuildsNotify() {
  const { data } = await GetBuildsNotifyTypeNV();
  BuildsNotifyTypes.value = data || [];
}
BuildsNotify();
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
    :width="340"
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
        <el-col :span="24" :offset="0">
          <el-form-item label="租赁类型" prop="type">
            <el-select
              v-model="formData.type"
              :disabled="type == 'query'"
              :placeholder="type == 'query' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in BuildsNotifyTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="提醒周期(天)" prop="notifyInterval">
            <el-input
              v-model="formData.notifyInterval"
              type="number"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="提前通知天数" prop="advancedPeriod">
            <el-input
              v-model="formData.advancedPeriod"
              type="number"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
            <!-- <el-input-number
              style="width: 210px !important"
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

        <el-col :span="24" :offset="0">
          <el-form-item label="提醒通知接收人" prop="receiverIds">
            <el-select
              v-model="formData.receiverIds"
              :disabled="type == 'query'"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :style="{ width: '100%' }"
              :placeholder="type == 'query' ? '' : '请选择'"
              remote
              :remote-method="getStaffListByName"
              multiple
              filterable
              :reserve-keyword="true"
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

        <!-- <el-col :span="12" :offset="0">
          <el-form-item label="提醒通知接收人" prop="receiverIds">
            <el-select
              :disabled="type == 'query'"
              multiple
              v-model="formData.receiverIds"
              placeholder="请选择通知人员"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in JobtreeData"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col> -->
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
