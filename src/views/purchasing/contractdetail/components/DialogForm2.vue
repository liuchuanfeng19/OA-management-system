<script setup lang="ts">
import type {
  UploadFile,
  UploadFiles,
  FormInstance,
  UploadUserFile,
  UploadInstance
} from "element-plus";
// import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";

import { uploadImg } from "@/api/common";
import { getUserInfo } from "@/api/user";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { convertCurrency } from "@/utils/validate";
import { getConfigNameValueListByKey } from "@/api/config";
import { CreateJoinSign, GetSupplyListNV } from "@/api/purchasing";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  handStaffIdList: $config.RoleCodePurchasingSpecialist
};

const COMPANY_MODEL = {
  materialName: "", //物资名称(设备名称)
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialPrice: 0, //采购单价
  materialQty: 0, //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  joinSignRemark: "", //备注
  siteItems: []
};
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
  workAddress: "", //实施地点
  handDeptId: "", //承办部门ID
  handDeptName: "", //承办部门
  handStaffId: "", //承办人ID
  handStaffName: "", //承办人
  joinSignRemark: "",
  remark: "",
  taxRateStr: "6", //税率
  supplyContractTime: "", //合同日期
  unTaxAmount: 0, //未税金额
  taxAmount: 0, //税金
  qualityMoneyTime: "", //质保金到期日
  qualityTime: "", //质保期
  unPayTime: "", //未付款到期日
  attachContract: [], //附件合同资料
  attachSupplyDoc: [], //供方资信履历材料
  businessType: "", //业务类型（合同类型）
  qualityPercent: 0, //质保比例
  reqOrderItems: [
    {
      ...COMPANY_MODEL
    }
  ],
  myCollectItemIds: []
};

// 表单校验规则
const fromRules = {
  title: [{ required: true, message: "请填写合同摘要", trigger: "blur" }],
  payMethod: [{ required: true, message: "填写付款方式", trigger: "blur" }],
  customer: [{ required: true, message: "请选择甲方单位", trigger: "change" }],
  attachContract: [
    { required: true, message: "请上传合同文件", trigger: "change" }
  ],
  taxRateStr: [{ required: true, message: "请选择税率", trigger: "change" }],
  supplyId: [{ required: true, message: "请选择乙方单位", trigger: "change" }],
  handStaffId: [{ required: true, message: "请选择承办人", trigger: "change" }],
  // supplyContractCode: [
  //   { required: true, message: "请填写卖方合同编号", trigger: "blur" }
  // ],
  qualityTime: [{ required: true, message: "请选择质保期", trigger: "change" }],
  supplyContractTime: [
    { required: true, message: "请选择合同日期", trigger: "change" }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  multipleSelection: []
});
const emit = defineEmits(["search"]);
const { getDepartmentTree } = userDepartmentStoreHook();

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  handStaffIdList: []
});
//el-cascader props属性值
// const selProps = {
//   children: "children",
//   label: "fullName",
//   multiple: false,
//   emitPath: false,
//   value: "id",
//   checkStrictly: true
// };

const showType = ref("add");
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const ruleFormRef = ref<FormInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const uploadRef1 = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();
const supplyList = ref([]); //供应商列表
const IdData = ref([]);
const allBusinessType = ref([]); //合同类型列表
const allSellTaxRate = ref([]); //税率
const activeName = ref("baseInfo");
const columnList = ref([]);
const attachContractUploading = ref(false);
const attachSupplyDocUploading = ref(false);
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add" ? "生成采购清单" : "";
});

const sureDisabled = computed(() => {
  return attachContractUploading.value || attachSupplyDocUploading.value
    ? true
    : false;
});

watch(
  () => props.multipleSelection,
  val => {
    if (val.length > 0) {
      let total = 0;
      IdData.value = val.map(item => {
        total += item.materialQty * item.materialPrice;
        return item.id;
      });
      formData.value.amount = total;
      formData.value.myCollectItemIds = IdData.value;
      formData.value.id = val[0].id;
      formData.value.customer = val[0].winBidCompanyName;
      formData.value.reqOrderItems = val;
      if (formData.value.reqOrderItems.length > 0) {
        const item = formData.value.reqOrderItems[0];
        columnList.value = item.siteItems || [];
      }

      // formData.value.unTaxAmount = parseFloat(
      //   (
      //     formData.value.amount /
      //     (parseFloat(formData.value.taxRateStr) / 100 + 1)
      //   ).toFixed(2)
      // );
    }
  }
);
watch(
  () => formData.value.amount,
  newVal => {
    if (newVal) {
      handleBlur();
    }
  }
);

// watch(
//   () => formData.value.taxRateStr,
//   newVal => {
//     if (newVal && formData.value.amount) {
//       formData.value.unTaxAmount = parseFloat(
//         (
//           formData.value.amount /
//           (parseFloat(formData.value.taxRateStr) / 100 + 1)
//         ).toFixed(2)
//       );
//     }
//   }
// );

// watch(
//   () => formData.value.unTaxAmount,
//   newVal => {
//     if (newVal != 0 && formData.value.amount) {
//       formData.value.taxAmount = parseFloat(
//         (formData.value.amount - newVal).toFixed(2)
//       );
//     } else {
//       formData.value.taxAmount = formData.value.amount;
//     }
//   }
// );

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attachContract = [];
  INITIAL_DATA.attachSupplyDoc = [];
  dialogVisible.value = true;
  showType.value = _showType;
  getUser();
};
defineExpose({ show });

// function formatDatetime(dt) {
//   return dayjs(dt).format("YYYY-MM-DD");
// }

//根据乙方选项判断是否为首次合作
function supplyData(val) {
  const project = supplyList.value.find(item => item.id == val);
  if (project.isFirst == true) {
    ElMessage.success("该供应商为首次签订!");
  }
}

//获取当前登录人员信息
const getUser = async () => {
  const { data } = await getUserInfo();
  formData.value.handDeptName = data.departmentName;
  formData.value.handStaffId = data.staffId;
};

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleBusiChange(val) {
  const staff = staffList.value.handStaffIdList.find(
    item => item.staffId == val
  );
  formData.value.handStaffName = staff.staffName;
  ruleFormRef.value.validateField("handStaffId", () => null);
}

function handleDelete(index) {
  formData.value.reqOrderItems.splice(index, 1);
  formData.value.myCollectItemIds.splice(index, 1);
  let total = 0;
  formData.value.reqOrderItems.forEach(item => {
    total += item.materialQty * item.materialPrice;
  });
  formData.value.amount = total;
  // formData.value.unTaxAmount = parseFloat(
  //   (
  //     formData.value.amount /
  //     (parseFloat(formData.value.taxRateStr) / 100 + 1)
  //   ).toFixed(2)
  // );
}

function handleBlur() {
  formData.value.amountCHN = convertCurrency(formData.value.amount);
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await CreateJoinSign(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

// 获取税率下拉选项
function getSellTaxRateList() {
  getConfigNameValueListByKey({
    catalogKey: "SellTaxRate"
  })
    .then(({ data }) => {
      allSellTaxRate.value = data || [];
    })
    .catch(() => {
      allSellTaxRate.value = [];
    });
}
getSellTaxRateList();

// 获取合同类型列表数据
function getInvoiceCategoryList() {
  getConfigNameValueListByKey({
    catalogKey: "OAJoinSignBusinessType"
  })
    .then(({ data }) => {
      allBusinessType.value = data || [];
    })
    .catch(() => {
      allBusinessType.value = [];
    });
}
getInvoiceCategoryList();

// 获取供应商列表
const getSupply = async () => {
  const { data = {} } = await GetSupplyListNV();
  supplyList.value = data || [];
};

//供应商列表
getSupply();

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
  fileList.value = [];
  fileList1.value = [];
  uploadRef.value!.clearFiles();
  uploadRef1.value!.clearFiles();
};

//上传合同附件
async function handleUpLoadImg1(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList1.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError1 = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess1 = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove1(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}

//上传供方资信履历材料
async function handleUpLoadImg(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1000"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-tabs
      v-if="showType == 'add'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="设备明细" name="materiaInfo" />
    </el-tabs>
    <el-form
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="130px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="合同摘要" prop="title" class="item">
            <el-input
              v-model="formData.title"
              :placeholder="showType == 'query' ? '' : '请输入'"
              :readonly="showType == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="合同文件" prop="attachContract">
            <el-upload
              ref="uploadRef1"
              accept="*"
              action="attachContract"
              :auto-upload="true"
              :file-list="fileList1"
              :http-request="handleUpLoadImg1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'attachContract');
                }
              "
              :on-error="handleError1"
              :on-success="handleSuccess1"
            >
              <el-button type="primary" text :loading="attachContractUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="是否含税" prop="hasTax">
            <el-select
              v-model="formData.hasTax"
              :disabled="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请选择'"
              clearable
            >
              <el-option label="含税" :value="true" />
              <el-option label="不含税" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="合同价款" prop="amount">
            <el-input
              v-model="formData.amount"
              readonly
              @input="
                val => {
                  formData.amount = val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
              @blur="handleBlur"
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="付款方式" prop="payMethod">
            <el-input
              v-model="formData.payMethod"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同价款(大写)" prop="amountCHN">
            <el-input v-model="formData.amountCHN" readonly />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="税金" prop="taxAmount">
            <el-input
              v-model="formData.taxAmount"
              :readonly="showType == 'query'"
              type="number"
              @input="
                val => {
                  formData.taxAmount =
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
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="未税金额" prop="unTaxAmount">
            <el-input
              v-model="formData.unTaxAmount"
              :readonly="showType == 'query'"
              type="number"
              @input="
                val => {
                  formData.unTaxAmount =
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

        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="甲方单位" prop="customer">
            <el-input
              v-model="formData.customer"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="买方合同编号" prop="sellContractCode">
            <el-input v-model="formData.sellContractCode" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="乙方单位" prop="supplyId">
            <!-- <el-input v-model="formData.openAddress" placeholder="请输入" /> -->
            <el-select
              v-model="formData.supplyId"
              :disabled="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请选择'"
              style="width: 100%"
              clearable
              @change="supplyData"
            >
              <el-option
                v-for="item in supplyList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0" class="item">
          <el-form-item label="卖方合同编号" prop="supplyContractCode">
            <el-input
              v-model="formData.supplyContractCode"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="6" :offset="0">
          <el-form-item label="承办部门" prop="handDeptName">
            <!-- <el-cascader
              readonly
              style="width: 120px"
              v-model="formData.handDeptId"
              :options="departmentTree"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader> -->
            <el-input
              v-model="formData.handDeptName"
              style="width: 120px"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0" class="item">
          <el-form-item
            label="承办人"
            prop="handStaffId"
            label-width="105px !important"
          >
            <el-select
              v-model="formData.handStaffId"
              filterable
              :disabled="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请选择'"
              style="width: 120px"
              @change="handleBusiChange"
            >
              <el-option
                v-for="item in staffList.handStaffIdList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="实施地点" prop="workAddress" class="item">
            <el-input
              v-model="formData.workAddress"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item
            label="供方单位资信履约能力材料是否齐全"
            prop="attachSupplyDoc"
            class="item"
          >
            <el-upload
              ref="uploadRef"
              accept="*"
              action="attachSupplyDoc"
              :auto-upload="true"
              :file-list="fileList"
              :http-request="handleUpLoadImg"
              :on-error="handleError"
              :on-success="handleSuccess"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove(uploadFile, uploadFiles, 'attachSupplyDoc');
                }
              "
            >
              <el-button type="primary" text :loading="attachSupplyDocUploading"
                >选择文件</el-button
              >
            </el-upload>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0" class="item">
          <el-form-item label="备注" prop="joinSignRemark">
            <el-input
              v-model="formData.joinSignRemark"
              :rows="2"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form
      v-if="showType == 'add'"
      v-show="activeName == 'materiaInfo'"
      ref="auditFormRef"
    >
      <el-card shadow="never" :body-style="{ padding: '0px', border: 'none' }">
        <template #header>
          <div class="flex justify-between items-center">
            <span>设备明细</span>
          </div>
        </template>
        <el-table
          highlight-current-row
          :data="formData.reqOrderItems"
          border
          stripe
          height="400"
        >
          <el-table-column
            label="序号"
            type="index"
            width="60"
            fixed="left"
            align="center"
          />

          <el-table-column
            fixed="left"
            label="设备名称"
            :min-width="180"
            show-overflow-tooltip
            prop="materialName"
          />
          <el-table-column
            label="规格型号"
            :width="100"
            show-overflow-tooltip
            prop="materialSpec"
          />
          <el-table-column
            label="参数要求"
            :min-width="300"
            show-overflow-tooltip
            prop="materialParams"
          />
          <el-table-column
            label="单位"
            :min-width="60"
            show-overflow-tooltip
            prop="materialUnit"
          />
          <el-table-column
            label="采购单价"
            :min-width="100"
            show-overflow-tooltip
            prop="materialPrice"
          />
          <el-table-column
            label="数量"
            :min-width="60"
            show-overflow-tooltip
            prop="materialQty"
          />

          <el-table-column
            label="备注"
            :width="120"
            show-overflow-tooltip
            prop="remark"
          />
          <!-- <el-table-column
            v-for="(item, idx) in columnList"
            :key="item.siteId"
            :label="item.siteName"
            width="100"
            align="center"
          >
            <el-table-column
              label="数量"
              align="center"
              width="100"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{ row.siteItems[idx].materialQty }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="到货日期"
              align="center"
              width="150"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <span>{{
                  row.siteItems[idx].receiveTime
                    ? formatDatetime(row.siteItems[idx].receiveTime)
                    : "-"
                }}</span>
              </template>
            </el-table-column>
          </el-table-column> -->
          <el-table-column
            v-if="showType == 'add'"
            label="操作"
            width="100"
            fixed="right"
            align="center"
          >
            <template #default="{ $index }">
              <el-button
                type="text"
                :disabled="formData.reqOrderItems.length < 2"
                @click="handleDelete($index)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "query" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'query'"
        type="primary"
        :disabled="sureDisabled"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px;
}

:deep(.el-form-item) {
  &:nth-last-of-type(1) {
    margin-right: 0;
  }
}

.item .el-form-item__label {
  color: blue;
}
</style>
