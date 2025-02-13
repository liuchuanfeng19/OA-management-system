<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import dayjs from "dayjs";
import { ref, computed } from "vue";
import {
  GetListNV,
  GetListPrimaryNV,
  GetPrepareInvoice,
  UpdateInvoice,
  CreateInvoice,
  ApproveInvoice,
  GetInvoice
} from "@/api/project";
import { ElMessage, type FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projId: "",
  projName: "",
  projContractId: "",
  projContractCode: "",
  projContractName: "",
  staffId: "",
  staffName: "",
  deptName: "",
  mobile: "",
  amount: 0,
  reason: "",
  applyStatus: 1,
  applyStatusExpr: "",
  applyTime: "",
  receiveStaffId: "",
  receiveDeptName: "",
  receiveTime: "",
  currentReviewerId: "",
  currentReviewerIds: "",
  reviewerIds: "",
  hReviewerIds: "",
  canApprove: true,
  comment1: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ProData = ref([]); //项目列表
const ListPrimaryData = ref([]); //合同列表
const PrepareData = ref([]); //关联数据
const approverData = ref([]); //审批人员
const { staffName } = useNav(); //用户名
const stepActive = ref(-1);
const stepStatus = ref<"wait" | "success" | "error" | "process" | "finish">(
  "wait"
);
const type = ref("apply");
// const comment = ref(""); //审批意见
const stauts = ref("");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  GetProStatus();
  GetPrimaryList();
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "apply";
    formData.value = { ...INITIAL_DATA };
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

// 表单校验规则;

const rules = {
  projId: [{ required: true, message: "请选择项目名称", trigger: "blur" }],

  reason: [{ required: true, message: "请输入申请理由", trigger: "blur" }],
  amount: [{ required: true, message: "请输入本次收款金额", trigger: "blur" }],
  progress: [
    { required: true, message: "请输入本次收款进度", trigger: "blur" }
  ],
  content: [{ required: true, message: "请输入收款内容", trigger: "blur" }],
  // cancelReason: [
  //   { required: true, message: "请填写撤回理由", trigger: "blur" }
  // ],
  comment1: [{ required: true, message: "请填写审批意见", trigger: "blur" }]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "apply"
    ? "申请项目开票"
    : type.value == "query"
      ? "查看项目开票"
      : type.value == "edit"
        ? "编辑项目开票"
        : // : type.value == "undo"
          // ? "撤回采购"
          type.value == "audit"
          ? "审核项目开票"
          : "";
});

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateInvoice(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateInvoice(formData.value);
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

// 提交审核表单
const submitFormApproval = async (
  formEl: FormInstance | undefined,
  flag: boolean
  // flag1: boolean
) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await ApproveInvoice({
        isApproved: flag,
        // isReturnBack: flag1,
        id: formData.value.id,
        comment1: formData.value.comment1
      });
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetInvoice({ id });
  formData.value = data || {};
  if (data) {
    approverData.value = data.reviewers;
  }
  stepActive.value = approverData.value.findIndex(
    item => item.isCurrentReviewer
  );
  const currentReviewer =
    stepActive.value == -1
      ? approverData.value[approverData.value.length - 1]
      : approverData.value[stepActive.value];

  stepStatus.value = currentReviewer.hasApproved
    ? currentReviewer.isApproved
      ? stepActive.value == -1
        ? "success"
        : "success"
      : "error"
    : stepActive.value == 0
      ? "process"
      : "wait"; //wait / process / finish / error / success
  console.log("stepStatus.value", stepStatus.value);
  console.log("stepActive.value", stepActive.value);
  formLoading.value = false;
}

// 提交撤回表单
// const submitFormQuery = async (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(async valid => {
//     if (valid) {
//       const { code,message } = await Cancel({
//         id: formData.value.id,
//         cancelReason: formData.value.cancelReason
//       });
//       if (code==0) {
//         ElMessage.success(message);
//         formVisible.value = false;
//         resetForm(formEl);
//         emit("search");
//       }
//     }
//   });
// };

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  approverData.value = [];
  // timeRange.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};

// //获取项目列表
async function GetProStatus() {
  const { data } = await GetListNV();
  ProData.value = data || {};
}

//获取主合同列表
async function GetPrimaryList() {
  const { data } = await GetListPrimaryNV();
  ListPrimaryData.value = data || {};
}

//根据id获取准备数据
async function GetProPrepare(val) {
  const { data } = await GetPrepareInvoice({ projContractId: val });
  PrepareData.value = data || {};
  if (data) {
    formData.value.projContractCode = data.projContractCode;
    formData.value.projContractName = data.projContractName;
    formData.value.staffName = data.staffName;
    formData.value.deptName = data.deptName;
    formData.value.mobile = data.mobile;
  }
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
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
      <div>
        <el-steps
          v-if="type != 'apply'"
          :active="stepActive == -1 ? approverData.length - 1 : stepActive"
          :space="200"
          align-center
          finish-status="success"
          :process-status="stepStatus"
        >
          <el-step v-for="(item, i) in approverData" :key="i">
            <template #title>
              <span>{{ item.reviewerName }}</span>
            </template>
            <template #description>
              <p>
                {{
                  item.isStarter && item.comment
                    ? "申请事由:" + item.comment
                    : !item.isStarter && item.comment
                      ? "审核意见:" + item.comment
                      : !item.isStarter &&
                          item.isApproved == "false" &&
                          item.comment
                        ? "驳回原因:" + item.comment
                        : "暂无审核数据"
                }}
              </p>
              <p>
                {{
                  item.approveTime
                    ? dayjs(item.approveTime).format("YYYY-MM-DD HH:mm")
                    : ""
                }}
              </p>
            </template>
          </el-step>
        </el-steps>
        <el-divider
          v-if="type == 'query' || type == 'edit' || type == 'audit'"
        />

        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="项目名称" prop="projId">
              <el-select
                v-model="formData.projId"
                :disabled="type == 'query' || type == 'edit' || type == 'audit'"
                style="width: 100%"
                :placeholder="
                  type == 'query' || type == 'edit' || type == 'audit'
                    ? ''
                    : '请选择'
                "
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
          <el-col :span="12" :offset="0">
            <el-form-item label="合同" prop="projContractId">
              <el-select
                v-model="formData.projContractId"
                :disabled="type == 'query' || type == 'edit' || type == 'audit'"
                style="width: 100%"
                :placeholder="
                  type == 'query' || type == 'edit' || type == 'audit'
                    ? ''
                    : '请选择'
                "
                @change="GetProPrepare"
              >
                <el-option
                  v-for="item in ListPrimaryData"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同编码" prop="projContractCode">
              <el-input v-model="formData.projContractCode" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同名称" prop="projContractName">
              <el-input v-model="formData.projContractName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="申请人" prop="staffName">
              <el-input v-model="formData.staffName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="部门" prop="deptName">
              <el-input v-model="formData.deptName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="电话" prop="mobile">
              <el-input v-model="formData.mobile" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="申请开票金额" prop="amount">
              <el-input
                v-model="formData.amount"
                type="number"
                :disabled="type == 'query' || type == 'audit'"
              />
            </el-form-item>
          </el-col>

          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="收款内容" prop="content">
              <el-input
                v-model="formData.content"
                :disabled="type == 'query' || type == 'audit'"
              />
            </el-form-item>
          </el-col> -->

          <el-col :span="24" :offset="0">
            <el-form-item label="申请理由" prop="reason">
              <el-input
                v-model="formData.reason"
                :disabled="type == 'query' || type == 'audit'"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col
            :span="24"
            :offset="0"
            v-if="type == 'audit' || type == 'query'"
          >
            <el-form-item label="驳回原因" prop="rejectComment">
              <el-input
                v-model="formData.rejectComment"
                :rows="2"
                type="textarea"
                placeholder="请输入驳回原因"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col> -->
          <el-col :span="24" :offset="0">
            <el-form-item
              v-if="type == 'audit'"
              label="审批意见"
              prop="comment1"
            >
              <el-input v-model="formData.comment1" :rows="2" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <div
          v-if="type == 'undo' || (type == 'query' && stauts == '撤回')"
          style="padding-bottom: 20px"
        >
          <el-form-item label="撤回理由" prop="cancelReason">
            <el-input
              v-model="formData.cancelReason"
              :disabled="type == 'query'"
            />
          </el-form-item>
        </div> -->
        <!-- <div>
          <el-form-item v-if="type == 'audit'" label="审批意见" prop="comment">
            <el-input v-model="comment" />
          </el-form-item>
        </div> -->
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'apply' || type == 'audit' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <!-- 新增申请 -->
      <el-button
        v-if="type == 'apply' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <!-- 审核通过/驳回 -->
      <el-button
        v-if="type == 'audit'"
        type="primary"
        @click="submitFormApproval(ruleFormRef, true)"
        >同意
      </el-button>
      <el-button
        v-if="type == 'audit'"
        type="danger"
        @click="submitFormApproval(ruleFormRef, false)"
        >驳回</el-button
      >
      <!-- 撤销申请 -->
      <!-- <el-button
        v-if="type == 'undo'"
        @click="submitFormQuery(ruleFormRef)"
        type="danger"
        >撤回</el-button
      > -->

      <!-- 查看详情 -->
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
