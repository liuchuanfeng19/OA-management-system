<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
// import dayjs from "dayjs";
import { ref, computed } from "vue";
import { MyAssets } from "@/api/asset";
import { FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  assetsId: "",
  assetsName: "",
  price: "",
  qty: "",
  amount: "",
  specExpr: "",
  userTime: "",
  isNeedReturn: "",
  status: "",
  img: [],
  code: "",
  catId: "",
  catName: "",
  applyStatusExpr: "",
  currentReviewerId: "",
  canApprove: "",
  ccIds: "",
  isApproved: "",
  isReturnBack: "",
  comment: "",
  wdApplyReason: "",
  statusExpr: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ApproverData = ref([]); //审批人员
const { staffName } = useNav(); //用户名
// const indexNumber = ref(0);
const type = ref("add");
// const comment = ref("");
const stauts = ref("");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// 表单校验规则;
const rules = {
  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "query" ? "我的资产" : "";
});

// 提交审核表单
// const submitFormApproval = async (
//   formEl: FormInstance | undefined,
//   flag: boolean,
//   flag1: boolean
// ) => {
//   if (!formEl) return;
//   formEl.validate(async valid => {
//     if (valid) {
//       const { message } = await Approve({
//         isApproved: flag,
//         isReturnBack: flag1,
//         id: formData.value.id,
//         comment: comment.value
//       });
//       if (message == "审核成功") {
//         ElMessage.success(message);
//         formVisible.value = false;
//         resetForm(formEl);
//         emit("search");
//       } else {
//         ElMessage.error(message);
//       }
//     }
//   });
// };

//获取审批数据数组下标
// function getindex() {
//   ApproverData.value.findIndex((item: any, index: number) => {
//     if (item.isCurrentReviewer == true) {
//       indexNumber.value = index;
//     }
//   });
// }

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
  const { data } = await MyAssets({ id });
  formData.value = data || {};
  if (data) {
    // timeRange.value = [data.startTime, data.endTime];
    ApproverData.value = data.reviewers;
  }
  // getindex();
  formLoading.value = false;
}

// function reloadTimeRange() {
//   timeRange.value = [];
// }

// const form = reactive({
//   startTime: "",
//   endTime: ""
// });

//初始化时间段
// reloadTimeRange();
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
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="资产名称" prop="assetsName">
              <el-input v-model="formData.assetsName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="资产编号" prop="code">
              <el-input v-model="formData.code" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="领用资产数量" prop="qty">
              <el-input v-model="formData.qty" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="所属分类" prop="catName">
              <el-input v-model="formData.catName" readonly />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="规格型号" prop="staffName">
              <el-input v-model="formData.staffName" disabled />
            </el-form-item>
          </el-col> -->

          <el-col :span="12" :offset="0">
            <el-form-item label="领用时间" prop="userTime">
              <el-date-picker
                v-model="formData.userTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="是否需要归还">
              <el-switch v-model="formData.startTime" />
            </el-form-item>
          </el-col> -->
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
