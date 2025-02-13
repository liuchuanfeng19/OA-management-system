<script setup lang="ts">
// import { useNav } from "@/layout/hooks/useNav";
// import dayjs from "dayjs";
import { ref, computed } from "vue";
import { Broken, GetAsset } from "@/api/asset";
import { ElMessage, type FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  code: "",
  name: "",
  catId: "",
  catType: "",
  buyTime: "",
  price: "",
  qty: "",
  amount: "",
  applyQty: "",
  usedQty: "",
  dutyStaffId: "",
  dutyStaffName: "",
  storeAddress: "",
  storeInTime: "",
  specExpr: "",
  status: "",
  statusExpr: "",
  img: "",
  userId: "",
  userName: "",
  userDepart: "",
  userTime: "",
  remark: "",
  isNeedReturn: "",
  catName: "",
  brokenComment: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ApproverData = ref([]); //审批人员

// const { staffName } = useNav(); //用户名
// const indexNumber = ref(0);
const type = ref("add");

// const stauts = ref("");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    type.value = _type;

    // stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  // formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// 表单校验规则;
const rules = {
  brokenComment: [
    { required: true, message: "请输入报废原因", trigger: "blur" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "broke" ? "报废资产" : "";
});

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { message, data } = await Broken(formData.value);
      if (data) {
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
  ApproverData.value = [];
  // timeRange.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  // reloadTimeRange();
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAsset({ id });
  formData.value = data || {};
  if (data) {
    // timeRange.value = [data.startTime, data.endTime];
    ApproverData.value = data.reviewers;
  }
  // getindex();
  formLoading.value = false;
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="320"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="90px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="报废原因" prop="brokenComment">
            <el-input v-model="formData.brokenComment" type="textarea" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >报废
      </el-button>
    </template>
  </el-dialog>
</template>
