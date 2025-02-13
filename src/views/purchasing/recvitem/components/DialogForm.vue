<script setup lang="ts">
import { ref, computed } from "vue";
import { GetAccDetail } from "@/api/joinSign";
// import moment from "moment";
import type { FormInstance } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  customer: "", //采购主体名称/中标单位
  projectId: "", //项目id
  projectShortName: "", //项目名称
  taxRate: 0, //税率
  amount: 0, //合同价款
  unTaxAmount: 0, //未税金额
  taxAmount: 0, //税金
  payMethod: "", //付款方式
  payTime: "", //付款日期
  payTotal: "", //付款金额
  sellContractCode: "", //合同编号
  supplyId: "", //乙方单位ID
  supplyName: "", //乙方单位名称（只读）
  supplyContractTime: "", //供应商合同日期
  attachContract: "", //附件合同资料
  handDeptName: "", //承办部门
  handStaffId: "", //采购负责人
  handStaffName: "", //采购负责人
  remark: "", //备注
  qualityTime: "", //质保期
  qualityAmount: "", //质保金额
  unPayTime: "", //未付款到期日
  payAmount: "", //合同已付(只读)
  unPayAmount: "", //合同未付(只读)
  invoiceAmount: "", //发票已开(只读)
  unInvoiceAmount: "", //发票未开(只读)
  joinSignAttachContract: "", //合同会签扫描件
  buyPayAttach: "", //发票扫描件
  recvSignAttach: "", //签收单
  payDownAttach: "", //付款底单
  contractContent: "", //合同内容
  isContractReturn: false, //合同原件是否返还
  isContractReturnName: "", //合同原件是否返回 描述
  isRecvSignReturn: false, //签收单/验收单是否返还
  isRecvSignReturnName: "", //签收单/验收单是否返还 描述
  businessType: "" //类别
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const type = ref("add");
const stauts = ref("");

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
    // formData.value.recvTime = moment().format("YYYY/MM/DD");
  }
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "query" ? "查看项目合同台账" : "";
});

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields();
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAccDetail({ id });
  formData.value = data || {};

  formLoading.value = false;
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="940"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form ref="ruleFormRef" :model="formData" label-width="160px">
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="签订主体名称" prop="customer">
              <el-input v-model="formData.customer" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="项目名称" prop="projectShortName">
              <el-input v-model="formData.projectShortName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同日期" prop="supplyContractTime">
              <el-date-picker
                v-model="formData.supplyContractTime"
                :style="{ width: '100%' }"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同编号" prop="sellContractCode">
              <el-input v-model="formData.sellContractCode" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="类别" prop="businessTypeName">
              <el-input v-model="formData.businessTypeName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同内容" prop="contractContent">
              <el-input v-model="formData.contractContent" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="供应单位名称" prop="supplyName">
              <el-input v-model="formData.supplyName" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="税率" prop="taxRateStr">
              <el-input v-model="formData.taxRateStr" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="未税金额" prop="unTaxAmount">
              <el-input v-model.trim="formData.unTaxAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="税金" prop="taxAmount">
              <el-input v-model.trim="formData.taxAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同金额" prop="amount">
              <el-input v-model="formData.amount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="质保金额" prop="qualityAmount">
              <el-input v-model="formData.qualityAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="采购负责人" prop="handStaffName">
              <el-input v-model.trim="formData.handStaffName" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="合同已付" prop="payAmount">
              <el-input v-model.trim="formData.payAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同未付" prop="unPayAmount">
              <el-input v-model.trim="formData.unPayAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="发票已开" prop="invoiceAmount">
              <el-input v-model.trim="formData.invoiceAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="发票未开" prop="unInvoiceAmount">
              <el-input v-model.trim="formData.unInvoiceAmount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="签收单/验收单是否返还"
              prop="isRecvSignReturnName"
            >
              <el-input v-model="formData.isRecvSignReturnName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同原件是否返还" prop="isContractReturnName">
              <el-input v-model="formData.isContractReturnName" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model.trim="formData.remark"
                :rows="2"
                type="textarea"
                readonly
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <!-- 查看详情 -->
      <el-button v-if="type == 'query'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
