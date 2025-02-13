<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, FormInstance, UploadUserFile } from "element-plus";

import {
  CreateJoinSign,
  ApproveJoinSign,
  GetJoinSign,
  UpdateJoinSignV2,
  CancelJoinSign
} from "@/api/purchasing";
import { UpdateOriginAttach } from "@/api/joinSign";
import { getConfigNameValueListByKey } from "@/api/config";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { PreviewButton } from "@/components/PreviewButton";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";
import FileUpload from "@/components/FileUpload";

enum AuditResult {
  agree,
  refuse,
  back
}

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  title: "", //合同摘要
  hasTax: true, //是否含税
  qty: 0, //数量
  amount: 0, //合同价款小写
  amountCHN: "", //合同价款大写
  payMethod: "", //付款方式
  sellContractCode: "", //买方合同编号
  customer: "", //甲方单位
  supplyId: "", //乙方单位ID
  supplyName: "", //乙方单位名称（只读）
  supplyContractCode: "", //卖方合同编号
  attachSupplyDoc: "", //供方资信履历材料
  workAddress: "", //实施地点
  handDeptId: "", //承办部门ID
  handDeptName: "", //承办部门
  handStaffId: "", //承办人ID
  handStaffName: "", //承办人
  joinSignRemark: "",
  remark: "",
  taxRateStr: "", //税率
  supplyContractTime: "", //合同日期
  unTaxAmount: 0, //未税金额
  taxAmount: 0, //税金
  qualityMoneyTime: "", //质保金到期日
  qualityTime: "", //质保期
  unPayTime: "", //未付款到期日
  attachContract: "", //附件
  originAttach: [],
  businessType: "", //业务类型（合同类型）
  businessTypeName: "",
  qualityPercent: 0, //质保比例
  reqOrderItems: [],
  reqOrderItemIds: [],
  canEditSellContractCode: false
};
// 表单校验规则;
const fromRules = {
  comment1: [{ required: true, message: "请填写审批意见", trigger: "blur" }]
};

const validateAuditForm = (rule: any, value: any, callback: any) => {
  if (!value && auditResult.value != AuditResult.agree) {
    return callback(new Error("审核意见不能为空"));
  } else {
    callback();
  }
};

//审核表单验证规则
const auditFormRules = {
  comment1: [
    {
      message: "审核意见不能为空",
      validator: validateAuditForm
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const showType = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const uploading = ref(false);
const busiTypeList = ref([]); //会签采购合同类型
const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "read"
    ? "查看会签采购合同"
    : showType.value == "edit"
      ? "编辑会签采购合同"
      : showType.value == "audit"
        ? "审核会签采购合同"
        : showType.value == "upload"
          ? "合同原件上传"
          : showType.value == "undo"
            ? "撤回会签采购合同"
            : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getJoinSignBusinessTypes();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  showType.value = _type;
  INITIAL_DATA.originAttach = [];
  if (_formData) {
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
  }
  formData.value.staffName = staffName;
  activeName.value = "baseInfo";
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetJoinSign({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.originAttach != null &&
    formData.value.originAttach.length > 0
      ? formData.value.originAttach.map(item => {
          return { name: item.substr(item.lastIndexOf("/") + 1), url: item };
        })
      : [];

  if (formData.value.businessType == 0) {
    formData.value.businessType = "";
  }

  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
  }
  formLoading.value = false;
}
//获取发票类型
async function getJoinSignBusinessTypes() {
  const { data } = await getConfigNameValueListByKey({
    catalogKey: "OAJoinSignBusinessType"
  });
  busiTypeList.value = data || [];
}

function handleFileChange({ name }) {
  console.log("name", name);
  ruleFormRef.value.validateField(name, () => null);
}

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        formData.value.doTemp = flag;
        const { message, data } = await UpdateJoinSignV2(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        formData.value.doTemp = flag;
        const { message, data } = await CreateJoinSign(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      }
    }
  });
};

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await CancelJoinSign({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        beforeClose();
        emit("search");
      }
    }
  });
};

// 原始合同上传
const submitFormUpload = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      UpdateOriginAttach({
        id: formData.value.id,
        originAttach: formData.value.originAttach
      }).then(({ code, message }) => {
        if (code == 0) {
          ElMessage.success(message);
          beforeClose();
          emit("search");
        }
      });
    }
  });
};

// 提交审核表单
const submitAuditForm = async (
  formEl: FormInstance | undefined,
  _auditResult: AuditResult
) => {
  if (!formEl) return;
  auditResult.value = _auditResult;
  formEl.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      const param = {
        id: formData.value.id,
        isApproved:
          _auditResult == AuditResult.agree
            ? true
            : _auditResult == AuditResult.refuse
              ? false
              : false,
        isReturnBack: _auditResult == AuditResult.back ? true : false,
        comment1: auditData.value.comment1
      };
      if (formData.value.canEditSellContractCode) {
        param["sellContractCode"] = formData.value.sellContractCode;
      }
      ApproveJoinSign(param)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            beforeClose();
          }
        })
        .catch()
        .finally(() => {
          formLoading.value = false;
        });
    }
  });
};

// 重置表单
const resetForm = () => {
  activeName.value = "baseInfo";
  INITIAL_DATA.originAttach = [];
  if (ruleFormRef.value) {
    ruleFormRef.value.resetFields();
  }
  if (auditFormRef.value != null) {
    auditFormRef.value.resetFields();
  }
  reviewers.value = [];
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="920"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="beforeClose"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="20"
    />
    <el-tabs
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="审核信息" name="auditInfo" />
    </el-tabs>
    <!-- 表单内容 -->
    <ReadDescriptions
      v-if="showType == 'audit' || showType == 'read' || showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      title=""
      :columnData="tableColumnData"
      :rowData="formData"
      :column="2"
    />
    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="130px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="合同摘要" prop="title">
              <el-input v-model="formData.title" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合同文件" prop="attachContract">
              <PreviewButton
                v-if="
                  formData.attachContract && formData.attachContract.length > 0
                "
                :srcList="formData.attachContract"
                size="default"
              />
              <span v-else>暂无附件</span>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="合同文件" prop="attachContract">
              <el-upload
                v-if="showType == 'apply' || showType == 'edit'"
                :file-list="fileList1"
                :http-request="fileUpload1"
                class="uploader"
                action="#"
                :limit="1"
                :on-exceed="handleExceed1"
                style="width: 100%"
              >
                <el-button type="primary">选择文件</el-button>
              </el-upload>
              <PreviewButton
                v-else
                :srcList="formData.attachContract"
                size="default"
                :title="fileName1"
              />
            </el-form-item>
          </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item
              label="会签合同类型"
              prop="businessType"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-if="showType == 'read' || showType == 'audit'"
                v-model="formData.businessTypeName"
                readonly
              />
              <el-select
                v-else
                v-model="formData.businessType"
                :disabled="showType == 'upload'"
                clearable
                placeholder="请选择"
                ><el-option
                  v-for="item in busiTypeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="是否含税" prop="hasTax">
              <el-input
                v-if="formData.hasTax"
                model-value="含税"
                readonly
                style="width: 150px"
              />
              <el-input
                v-else
                model-value="不含税"
                readonly
                style="width: 150px"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6" :offset="0">
            <el-form-item
              label="税率"
              prop="taxRateStr"
              label-width="115px !important"
            >
              <el-input
                v-model="formData.taxRateStr"
                readonly
                style="width: 90px"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6" :offset="0">
            <el-form-item label="合同价款" prop="amount">
              <el-input
                v-model="formData.amount"
                readonly
                style="width: 90px"
                @input="
                  val => {
                    formData.amount = val == '' ? 0 : Math.abs(parseFloat(val));
                  }
                "
              >
                <template #suffix>
                  <p>{{ "元" }}</p>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="6" :offset="0">
            <el-form-item
              label="合同价款"
              prop="amountCHN   "
              label-width="80px !important"
            >
              <el-input
                v-model="formData.amountCHN"
                style="width: 125px"
                readonly
                placeholder="大写"
              />
            </el-form-item>
          </el-col>

          <el-col :span="6" :offset="0">
            <el-form-item label="付款方式" prop="payMethod">
              <el-input
                v-model="formData.payMethod"
                readonly
                style="width: 150px"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item
              label="数量"
              prop="qty"
              label-width="115px !important"
            >
              <el-input
                v-model="formData.qty"
                style="width: 90px"
                readonly
                type="number"
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="合同类型" prop="businessType">
              <el-input v-model="formData.businessTypeName" readonly />
            </el-form-item>
          </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item
              label="合同日期"
              prop="supplyContractTime"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-date-picker
                v-model="formData.supplyContractTime"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请选择'
                "
                :disabled="showType != 'edit'"
                :style="{ width: '100%' }"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="税金" prop="taxAmount">
              <el-input
                v-model="formData.taxAmount"
                type="number"
                readonly
                @input="
                  val => {
                    formData.taxAmount =
                      val == '' ? 0 : Math.abs(parseFloat(val));
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="未税金额" prop="unTaxAmount">
              <el-input
                v-model="formData.unTaxAmount"
                type="number"
                readonly
                @input="
                  val => {
                    formData.unTaxAmount =
                      val == '' ? 0 : Math.abs(parseFloat(val));
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="甲方单位" prop="customer">
              <el-input v-model="formData.customer" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="买方合同编号"
              prop="sellContractCode"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.sellContractCode"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  (showType == 'audit' && !formData.canEditSellContractCode)
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="乙方单位" prop="supplyId">
              <el-input v-model="formData.supplyName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="卖方合同编号"
              prop="supplyContractCode"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.supplyContractCode"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
          <el-form-item label="供方资信履历材料" prop="attachSupplyDoc">
            <el-input v-model="formData.attachSupplyDoc" placeholder="请输入" />
          </el-form-item>
        </el-col> -->
          <el-col :span="12" :offset="0">
            <el-form-item
              label="实施地点"
              prop="workAddress"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.workAddress"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="质保比例"
              prop="qualityPercent"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-input
                v-model="formData.qualityPercent"
                type="number"
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请输入'
                "
                :readonly="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
                @input="
                  val => {
                    formData.qualityPercent =
                      val == '' ? 0 : Math.abs(parseFloat(val));
                  }
                "
              >
                <template #suffix>
                  <p>{{ "%" }}</p>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="质保期"
              prop="qualityTime"
              :class="showType == 'edit' ? 'item' : ''"
            >
              <el-date-picker
                v-model="formData.qualityTime"
                :disabled="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请选择'
                "
                :style="{ width: '100%' }"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="12"
            :offset="0"
            :class="showType == 'edit' ? 'item' : ''"
          >
            <el-form-item label="未付款到期日" prop="unPayTime">
              <el-date-picker
                v-model="formData.unPayTime"
                :disabled="
                  showType == 'upload' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                "
                :placeholder="
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'audit'
                    ? ''
                    : '请选择'
                "
                :style="{ width: '100%' }"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item label="承办部门" prop="handDeptName">
              <el-input
                v-model="formData.handDeptName"
                style="width: 140px"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="6" :offset="0">
            <el-form-item
              label="承办人"
              prop="handStaffId"
              label-width="110px !important"
            >
              <el-input
                v-model="formData.handStaffName"
                style="width: 95px"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item
              label="供方单位资信履约能力材料是否齐全"
              prop="attachSupplyDoc"
            >
              <PreviewButton
                v-if="
                  formData.attachSupplyDoc &&
                  formData.attachSupplyDoc.length > 0
                "
                :srcList="formData.attachSupplyDoc"
                size="default"
              />
              <span v-else>暂无附件</span>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0" class="remark">
            <el-form-item label="备注" prop="joinSignRemark">
              <el-input
                v-model="formData.joinSignRemark"
                :rows="2"
                type="textarea"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="showType != 'add' && showType != 'edit'"
            :span="24"
            :offset="0"
          >
            <el-form-item label="原始合同" prop="originAttach">
              <FileUpload
                v-model="formData.originAttach"
                v-model:file-list="fileList"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png,.zip"
                action="attachWzhtqd"
                :limit="0"
                :showType="showType"
                fieldName="attachWzhtqd"
                :disabled="uploading || showType != 'upload'"
                :uploading="uploading"
                :show-file-list="showType != 'read'"
                @change="handleFileChange"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <el-form
      v-if="showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      ref="canceFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="68px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' || (stauts == '已撤销' && showType == 'read')
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :rows="2"
              placeholder="请输入"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <AuditForm
      v-if="
        (showType == 'read' || showType == 'undo' || showType == 'audit') &&
        activeName == 'auditInfo'
      "
      v-show="activeName == 'auditInfo'"
      :showType="showType"
      :reviewers="reviewers"
    />
    <el-form
      v-if="showType == 'audit'"
      ref="auditFormRef"
      class="audit-form"
      :class="{ 'mt-4': activeName == 'baseInfo' }"
      :model="auditData"
      :rules="auditFormRules"
      :inline="false"
      :label-width="activeName == 'auditInfo' ? '92px' : '130px'"
    >
      <el-form-item label="审核意见" prop="comment1">
        <el-input
          v-model.trim="auditData.comment1"
          type="textarea"
          :rows="2"
          show-word-limit
          :maxlength="255"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="beforeClose">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType == 'apply' || showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        type="primary"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="false && showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
      <el-button
        v-if="showType == 'upload'"
        type="primary"
        :loading="formLoading"
        @click="submitFormUpload(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.remark {
  margin-top: 20px;
}
</style>
