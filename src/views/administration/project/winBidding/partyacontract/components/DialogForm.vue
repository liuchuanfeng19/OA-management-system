<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import moment from "moment";
import {
  CreateSellContract,
  GetSellContract,
  UpdateSellContract,
  GetSellContractType
} from "@/api/projectAccount";
import { uploadImg } from "@/api/common";
import { getBidCompanyNVList } from "@/api/bidCompany";
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";
import _ from "lodash";
import { userProjectStoreHook } from "@/store/modules/project";

const { getProjectWinBidNVList } = userProjectStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目ID
  projectFullName: "", //项目名称
  projectShortName: "", //立项名称
  projectAddress: "", //项目地点
  customerName: "", //甲方名称
  contractName: "", //甲方合同名称
  contractCode: "", //甲方合同编号
  contractAmount: 0, //甲方合同金额
  thirdName: "", //丙方合同名称
  thirdCode: "", //丙方合同编号
  supplyContractTime: "", //乙方/下游合同日期
  secondName: "", //乙方名称/下游合同厂家名称
  secondCode: "", //乙方合同编号
  supplyContractAmount: 0, //乙方/下游合同金额
  payCondition: "", //合同付款条件
  prePayPoint: "", //预估付款节点
  unInvoiceAmount: 0, //未开金额
  qualityAmount: 0, //质保金额
  qualityPercent: "", //质保比例
  qualityStartTime: "", //质保开始日期
  qualityEndTime: "", //质保结束日期
  ensureAmount: 0, //履约保证金
  originAttach: "", //附件
  remark: "", //备注
  invoiceTime: "", //开票日期
  invoiceAmount: 0, //开票金额
  invoiceLeft: 0, //未开金额
  invoicePercent: "", //开票比例
  invoiceRemark: "", //开票备注
  returnType: "", //回款方式
  returnTotal: 0, //回款款项
  returnTime: "", //回款日期
  returnAmount: 0, //回款收款金额
  returnLeft: 0, //回款未收金额
  otherTime: "", //其他项扣款日期
  otherTotal: 0, //其他项扣款款项
  projectGrossProfit: 0, //项目毛利
  planPayNode: "", //预估付款节点

  contractType: undefined //项目合同类型
};

// 表单校验规则
const rules = {
  projectId: [
    {
      required: true,
      message: "请选择项目",
      trigger: "change"
    }
  ],
  contractType: [
    { required: true, message: "请选择合同类型", trigger: "change" }
  ],

  projectAddress: [
    { required: true, message: "请输入项目地点", trigger: "blur" }
  ],
  originAttach: [
    { required: true, message: "请上传合同附件", trigger: "change" }
  ],
  contractAmount: [{ required: true, message: "请输入金额", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const type = ref("add");
const sellContractType = ref([]);
const bidCompanyList = ref([]); // 投标单位列表
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加甲方合同台账"
    : type.value == "subAdd"
      ? "添加甲方子合同台账"
      : type.value == "edit"
        ? "编辑甲方合同台账"
        : type.value == "query"
          ? "查看甲方合同台账"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getBidCompanyList();
  getProjectWinBidNVList();
  type.value = _type;
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.originAttach = "";
  if (_formData) {
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
    formData.value.contractType = "主合同";
    formData.value.qualityStartTime = moment().format("YYYY/MM/DD");
    formData.value.qualityEndTime = moment().format("YYYY/MM/DD");
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetSellContract({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.originAttach != null && formData.value.originAttach != ""
      ? [
          {
            name: formData.value.originAttach.substr(
              formData.value.originAttach.lastIndexOf("/") + 1
            ),
            url: formData.value.originAttach
          }
        ]
      : [];
  if (type.value == "add") {
    formData.value.contractType = "主合同";
  } else if (type.value == "subAdd") {
    formData.value.contractType = "子合同";
  } else {
    if (formData.value.contractType == 1) {
      formData.value.contractType = "主合同";
    } else {
      formData.value.contractType = "子合同";
    }
  }
  if (formData.value.contractType == "子合同") {
    formData.value.payCondition = "";
    formData.value.planPayNode = "";
    formData.value.qualityAmount = 0;
    formData.value.qualityPercent = "";
    formData.value.qualityStartTime = "";
    formData.value.qualityEndTime = "";
  }
  formLoading.value = false;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.contractType == "主合同") {
        formData.value.contractType = 1;
      } else {
        formData.value.contractType = 2;
      }
      if (type.value == "add" || type.value == "subAdd") {
        const { code, message } = await CreateSellContract(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { code, message } = await UpdateSellContract(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
      if (formData.value.contractType == 1) {
        formData.value.contractType = "主合同";
      } else {
        formData.value.contractType = "子合同";
      }
    }
  });
}, 300);

//获取销售合同类型
async function getSellContractType() {
  const { data } = await GetSellContractType();
  if (data) {
    sellContractType.value = data;
  }
}
getSellContractType();

//选择中标项目之后关联数据
function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectShortName = project.remark;
}

// 获取投标列表数据
function getBidCompanyList() {
  getBidCompanyNVList()
    .then(({ data }) => {
      bidCompanyList.value = data || [];
    })
    .catch(() => {
      bidCompanyList.value = [];
    });
}

async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    console.log("res", res);
    formData.value[options.action] = res["data"][0];
    // formData.value.originAttach.unshift(res["data"][0]);
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
function handleRemove(action: string) {
  formData.value[action] = "";
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
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
    :width="800"
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
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="
                type == 'query' ||
                type == 'edit' ||
                formData.contractType == '子合同'
              "
              :placeholder="type == 'query' || type == 'edit' ? '' : '请选择'"
              @change="handleProjectChange"
              ><el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="立项名称" prop="projectShortName">
            <el-input v-model="formData.projectShortName" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item
            label="合同名称"
            prop="contractName"
            :class="formData.contractType == '子合同' ? 'item' : ''"
          >
            <el-input
              v-model="formData.contractName"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同类型" prop="contractType">
            <el-input v-model="formData.contractType" readonly />
            <!-- <el-select
              :disabled="type == 'query'"
              v-model="formData.contractType"
              :placeholder="type == 'query' ? '' : '请选择'"
              ><el-option
                v-for="item in sellContractType"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select> -->
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item
            label="甲方合同编号"
            prop="contractCode"
            :class="formData.contractType == '子合同' ? 'item' : ''"
          >
            <el-input
              v-model="formData.contractCode"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="甲方名称" prop="customerName">
            <el-input
              v-model="formData.customerName"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item
            label="乙方合同编号"
            prop="secondCode"
            :class="formData.contractType == '子合同' ? 'item' : ''"
          >
            <el-input
              v-model="formData.secondCode"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="乙方名称" prop="secondName">
            <el-input
              v-model="formData.secondName"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
            <!-- <el-select
              :disabled="type == 'query'"
              v-model="formData.reBidCompanyId"
              :placeholder="type == 'query' ? '' : '请选择'"
              clearable
              style="width: 100%"
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="item in bidCompanyList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select> -->
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item
            label="丙方合同编号"
            prop="thirdCode"
            :class="formData.contractType == '子合同' ? 'item' : ''"
          >
            <el-input
              v-model="formData.thirdCode"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="丙方合同名称" prop="thirdName">
            <el-input
              v-model="formData.thirdName"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item
            label="金额"
            prop="contractAmount"
            :class="formData.contractType == '子合同' ? 'item' : ''"
          >
            <el-input
              v-model="formData.contractAmount"
              :readonly="type == 'query'"
              type="number"
              @input="
                val => {
                  formData.contractAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同付款条件" prop="payCondition">
            <el-input
              v-model="formData.payCondition"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预估付款节点" prop="planPayNode">
            <el-input
              v-model="formData.planPayNode"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="质保金额" prop="qualityAmount">
            <el-input
              v-model="formData.qualityAmount"
              type="number"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              @input="
                val => {
                  formData.qualityAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="质保比例" prop="qualityPercent">
            <el-input
              v-model="formData.qualityPercent"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="质保开始日期" prop="qualityStartTime">
            <el-date-picker
              v-model="formData.qualityStartTime"
              :disabled="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请选择'
              "
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="质保结束日期" prop="qualityEndTime">
            <el-date-picker
              v-model="formData.qualityEndTime"
              :disabled="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请选择'
              "
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            label="项目地点"
            :prop="formData.contractType == '子合同' ? '' : 'projectAddress'"
          >
            <el-input
              v-model="formData.projectAddress"
              :readonly="type == 'query' || formData.contractType == '子合同'"
              :placeholder="
                type == 'query' || formData.contractType == '子合同'
                  ? ''
                  : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="合同附件" prop="originAttach">
            <el-upload
              ref="uploadRef"
              :disabled="type == 'query'"
              accept=".doc,.docx,.pdf"
              :file-list="fileList"
              :auto-upload="true"
              :http-request="fileUpload"
              :limit="1"
              action="originAttach"
              :on-exceed="handleExceed"
              :on-remove="
                () => {
                  handleRemove('originAttach');
                }
              "
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button v-if="type != 'query'" type="primary" text
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit' || type == 'subAdd'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit' || type == 'subAdd'"
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
