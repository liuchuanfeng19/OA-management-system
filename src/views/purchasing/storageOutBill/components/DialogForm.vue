<script setup lang="ts">
import type {
  UploadUserFile,
  UploadInstance,
  FormInstance,
  UploadProps
} from "element-plus";
import moment from "moment";
import { ref, computed, watch, nextTick, onBeforeUpdate } from "vue";
import { ElMessage, UploadRawFile, genFileId } from "element-plus";

import {
  getOutStock,
  createOutStock,
  editOutStock,
  getOutStockItems,
  doInStock,
  GetItemsFromPssEx
  // genInStockCode
} from "@/api/outStock";
import { uploadImg } from "@/api/common";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { getReqInvoiceProjectList } from "@/api/reqInvoice";
import { DownloadButton } from "@/components/DownloadButton";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  curatorStaffList: $config.RoleCodeCurator,
  handStaffList: $config.RoleCodePurchasingSpecialist,
  accountantList: $config.RoleCodeAccountingTrainee
};
interface Device {
  id: undefined;
  // outStockId: "";//出库单ID
  pssManageId: string; //购销存ID
  materialName: string; //物资名称
  materialSpec: string; //规格型号
  materialUnit: string; //单位
  materialQty: number; //数量
  materialPrice: number; //单价
  subTotal: number; //金额
  remark: string; //备注
  isChecked: boolean; //是否勾选
  needChecked: boolean; //是否需要勾选
}

// const COMPANY_MODEL = {
//   id: undefined,
//   // outStockId: "";//出库单ID
//   pssManageId: "", //购销存ID
//   materialName: "", //物资名称
//   materialSpec: "", //规格型号
//   materialUnit: "", //单位
//   materialQty: 0, //数量
//   materialPrice: 0, //单价
//   subTotal: 0, //金额
//   remark: "", //备注
//   isChecked: false, //是否勾选
//   needChecked: false //是否需要勾选
// };
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  projectShortName: "", //项目简称
  reqInvoiceId: "", //开票ID
  outStockCode: "", //出库单号
  outStockTime: "", //出库时间
  auditTime: "", //审核时间
  customerName: "", //单位名称
  secondName: "", //销售合同乙方单位名称
  amount: 0, //开票金额
  amountUnit: "", //开票金额单位
  handStaffId: "", //经办人ID
  keepStaffName: "", //保管
  keepStaffId: null, //保管Id
  finaStaffId: "", //会计ID
  accountantStaffName: "",
  joinSignHandStaffName: "", //实际经办人

  totalAmount: 0, //合计金额（未税）
  attach: "", //附件
  items: [
    // {
    //   ...COMPANY_MODEL
    // }
  ]
};
const tableRef = ref();
const deviceList = ref<Device[]>([]); //设备明细列表
const sureDisabled = computed(() => {
  const selectedItem = deviceList.value.find(item => item.isChecked);
  return selectedItem && rowFormValidate.value ? false : true;
});

// 表单校验规则
const fromRules = {
  // reqInvoiceId: [
  //   { required: true, message: "请选择开票申请单", trigger: "change" }
  // ],
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  secondName: [
    { required: true, message: "请输入销售合同乙方单位", trigger: "blur" }
  ],
  items: [{ required: true, message: "请勾选设备明细", trigger: "blur" }],
  handStaffId: [{ required: true, message: "请选择经办人", trigger: "blur" }],
  keepStaffId: [{ required: true, message: "请选择保管", trigger: "blur" }],
  outStockTime: [
    { required: true, message: "请选择出库日期", trigger: "change" }
  ],
  auditTime: [{ required: true, message: "请选择审核日期", trigger: "change" }],
  attach: [{ required: true, message: "请上传出库单", trigger: "change" }]
};

const emit = defineEmits(["search"]);
let rowFormRefs = [];

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  curatorStaffList: [],
  handStaffList: [],
  accountantList: []
});
const showType = ref("add");
const projectList = ref([]);
const pssIdsList = ref([]);
const formLoading = ref(false);
const dialogVisible = ref(false);
const rowFormValidate = ref(true);
const ruleFormRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加出库单"
    : showType.value == "edit"
      ? "编辑出库单"
      : showType.value == "read"
        ? "查看出库单"
        : showType.value == "receive"
          ? "出库单出库"
          : "";
});

watch(
  () => formData.value.projectId,
  newVal => {
    if (!newVal) {
      formData.value.projectFullName = "";
      deviceList.value = [];
      rowFormRefs = [];
      return;
    }
    if (showType.value == "add") {
      deviceList.value = [];
      getOutStockItemList();
    }
    const project = projectList.value.find(item => item.projectId == newVal);
    if (!project) {
      return;
    }
    formData.value.projectFullName = project.projectFullName;
  }
);

watch(
  () => formData.value.totalAmount,
  newVal => {
    if (showType.value != "add" && showType.value != "edit") {
      return;
    }
    console.log("watch formData.value.totalAmount", newVal);
    // 根据总价和数量计算明细中的单价
    // computedPrice();
  },
  {}
);
watch(
  deviceList,
  newVal => {
    if (showType.value != "add" && showType.value != "edit") {
      return;
    }
    console.log("watch deviceList", newVal);
    console.log("watch rowFormRefs", rowFormRefs);
    rowFormValidate.value = true;
    rowFormRefs.forEach((element, index) => {
      console.log(element, index);
      element.validate(valid => {
        console.log(index, valid);
        console.log("rowFormValidate1", rowFormValidate.value);
        rowFormValidate.value = rowFormValidate.value && valid;
        console.log("rowFormValidate2", rowFormValidate.value);
      });
    });

    // //下面是根据数量和单价算总价
    // let _totalAmount = 0;
    // newVal.forEach(element => {
    //   if (element.isChecked) {
    //     _totalAmount += element.materialQty * element.materialPrice;
    //   }
    // });
    // formData.value.totalAmount = _totalAmount;
    // 下面是根据总价和数量计算明细中的单价
    // computedPrice();
  },
  {
    deep: true
  }
);
/**
 * 根据总价和数量计算明细中的单价
 */
// function computedPrice() {
//   deviceList.value.forEach(element => {
//     if (element.subTotal == null || element.subTotal == undefined) {
//       element.subTotal = 0;
//     }
//     if (element.isChecked) {
//       if (element.materialQty == 0) {
//         element.materialPrice = 0;
//       } else {
//         element.materialPrice = element.subTotal / element.materialQty;
//       }
//     } else {
//       element.materialPrice = 0;
//       element.subTotal = 0;
//     }
//   });
// }
// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  getProjectList();
  dialogVisible.value = true;
  showType.value = _showType;
  INITIAL_DATA.items = [];
  formData.value = { ...INITIAL_DATA };
  formData.value.items = [
    // {
    //   ...COMPANY_MODEL
    // }
  ];
  if (_showType != "add") {
    getDetail(_formData.id);
  } else {
    // getInStockCode();
  }
};
defineExpose({ show });

// 根据部门Id获取员工列表
const getDetail = async id => {
  const { data = {} } = await getOutStock({
    id
  });
  formData.value = data || {};
  deviceList.value = formData.value.items.map(item => {
    item.isChecked = true;
    item.needChecked = true;
    // item.subTotal = item.materialPriceNoTax * item.materialQty;
    return item;
  });
  if (deviceList.value) {
    pssIdsList.value = deviceList.value.map(item => {
      return item.pssManageId;
    });
  }

  if (
    showType.value != "read" &&
    (formData.value.outStockTime == null || formData.value.outStockTime == "")
  ) {
    formData.value.outStockTime = moment().format("YYYY-MM-DD");
  }
  if (
    showType.value != "read" &&
    (formData.value.auditTime == null || formData.value.auditTime == "")
  ) {
    formData.value.auditTime = moment().format("YYYY-MM-DD");
  }
  if (formData.value.attach && formData.value.attach.length > 0) {
    fileList.value = [formData.value.attach].map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  formLoading.value = false;
};

// 获取项目列表数据
function getProjectList() {
  getReqInvoiceProjectList()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// // 获取出库单号
// const getInStockCode = async () => {
//   const { data = {} } = await genInStockCode();
//   formData.value.outStockCode = data || "";
//   formLoading.value = false;
// };

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

// 获取出库明细
const getOutStockItemList = async () => {
  const { data = [] } = await getOutStockItems({
    // reqInvoiceId: formData.value.reqInvoiceId,
    projectId: formData.value.projectId
  });
  const _data = data || [];
  if (_data.length > 0) {
    deviceList.value = _data.map(item => {
      item.isChecked = true;
      item.needChecked = true;
      // item.subTotal = item.materialPriceNoTax * item.materialQty;
      return item;
    });
  } else {
    ElMessage.error("暂无更多数据");
  }

  // formData.value.reqInvoiceId = data.reqInvoiceId;
  // formData.value.outStockCode = data.reqInvoiceReqCode;
  // formData.value.auditTime = data.reqInvoceApprovedTime;
  // formData.value.outStockTime = data.reqInvoceApprovedTime;
  // formData.value.amount = data.reqInvoiceAmount;

  // let _sellContractItemList = [];
  // let __sellContractItemList = []; //已经添加并添加完了，在未销售合同明细没有，详情里有的数据
  // if (showType.value == "edit") {
  //   _sellContractItemList = formData.value.items;
  //   if (_data.length > 0) {
  //     _sellContractItemList.forEach(element => {
  //       const _element = _data.find(item => item.id == element.sellContractItemId);
  //       if (!_element) {
  //         element.isChecked = false;
  //         element.needChecked = true;
  //         // element.availableQty = 0;
  //         __sellContractItemList.push(element);
  //       }
  //     });
  //   } else {
  //     __sellContractItemList = _sellContractItemList;
  //   }
  //   console.log("_sellContractItemList", _sellContractItemList);
  //   console.log("__sellContractItemList", __sellContractItemList);
  // }
  // deviceList.value = _data.map(item => {
  //   if (_sellContractItemList.length > 0) {
  //     const currentItem = _sellContractItemList.find(
  //       _item => _item.sellContractItemId == item.id
  //     );
  //     console.log("currentItem", currentItem);
  //     if (currentItem) {
  //       item.id = currentItem.id;
  //       item.sellContractItemId = currentItem.sellContractItemId;
  //       item.materialQty = currentItem.materialQty;
  //       item.isChecked = false;
  //       item.needChecked = true;
  //       item.subTotal = currentItem.subTotal;
  //       console.log("item", item);
  //     } else {
  //       item.isChecked = false;
  //       item.needChecked = false;
  //       item.subTotal = item.materialPriceNoTax * item.materialQty;
  //     }
  //   } else {
  //     item.isChecked = false;
  //     item.needChecked = false;
  //     item.subTotal = item.materialPriceNoTax * item.materialQty;
  //   }
  //   return item;
  // });
  // 编辑时，如果有明细被申请完了，回显本次已经开过的明细
  // if (showType.value == "edit") {
  //   deviceList.value = deviceList.value.concat(
  //     __sellContractItemList.map(item => {
  //       item.isChecked = false;
  //       item.needChecked = true;
  //       item.inStockQty = item.materialQty;
  //       item.availableQty = 0;
  //       return item;
  //     })
  //   );
  // }
  console.log("deviceList", deviceList.value);
  const selection = tableRef.value.getSelectionRows();
  console.log("selection", selection);
  nextTick(() => {
    deviceList.value.forEach(element => {
      if (element.needChecked) {
        tableRef.value.toggleRowSelection(element, undefined);
      }
    });
  });
};

function getRowFormRef(el) {
  console.log("getRowFormRef", el);
  if (!el || el == null) return;
  rowFormRefs.push(el);
  rowFormRefs = [...new Set(rowFormRefs)];
}

function handleProject(val) {
  const project = projectList.value.find(item => item.projectId == val) || {};
  console.log("project", project);
  formData.value.customerName = project.invoiceCompanyName;
}

function handleHandChange(val) {
  const staff = staffList.value.handStaffList.find(item => item.staffId == val);
  formData.value.joinSignHandStaffName = staff.staffName;
  ruleFormRef.value.validateField("handStaffId", () => null);
}

function handleKeepChange(val) {
  const staff = staffList.value.curatorStaffList.find(
    item => item.staffId == val
  );
  formData.value.keepStaffName = staff.staffName;
  ruleFormRef.value.validateField("keepStaffId", () => null);
}
function handleAccountantChange(val) {
  const staff = staffList.value.accountantList.find(
    item => item.staffId == val
  );
  formData.value.accountantStaffName = staff.staffName;
  ruleFormRef.value.validateField("finaStaffId", () => null);
}
// 表格行选中回调resetForm
function handleSelectionChange(selection) {
  console.log("handleSelectionChange", selection);
  deviceList.value.forEach(item => {
    const finder = selection.find(
      _item => _item.pssManageId == item.pssManageId
    );
    item.isChecked = finder ? true : false;
  });
}
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

const handleError = () => {
  uploadRef.value.clearFiles();
};

//上传文件
async function fileUpload(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList.value
      .map((item: any) => (item.url ? item.url : item.raw.temp))
      .join();
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove(action: string) {
  // formData.value[action] = "";
  console.log("fileList", fileList.value);
  formData.value[action] = fileList.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
  console.log("fileList", fileList.value);
  console.log(`${formData.value[action]}`, formData.value[action]);
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = _files => {
  uploadRef.value!.clearFiles();
  const file = _files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

function handleNumberChange(val, row) {
  console.log(val);
  let value = val ? parseInt(val) : 0;
  value = value > row.availableQty ? row.availableQty : value;
  row.materialQty = value;
  row.subTotal = row.materialPrice * value;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const params = { ...formData.value };
        params.items = deviceList.value
          .filter(item => item.isChecked != undefined && item.isChecked)
          .map(item => {
            return {
              id: undefined, //
              // outStockId: undefined,
              pssManageId: item.pssManageId, //购销存ID
              // taxCategory: item.taxCategory, //税收类别
              materialName: item.materialName, //物资名称
              materialSpec: item.materialSpec, //规格型号
              materialUnit: item.materialUnit, //单位
              materialQty: item.materialQty, //数量
              materialPrice: item.materialPrice, //单价
              subTotal: item.subTotal, //小计
              remark: item.remark //备注
            };
          });
        const { code, message } = await createOutStock(params);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const params = { ...formData.value };
        params.items = deviceList.value
          .filter(item => item.isChecked)
          .map(item => {
            return {
              id: item.id ? item.id : undefined, //
              // outStockId: item.outStockId,
              pssManageId: item.pssManageId ? item.pssManageId : item.id, //购销存ID
              // taxCategory: item.taxCategory, //税收类别
              materialName: item.materialName, //物资名称
              materialSpec: item.materialSpec, //规格型号
              materialUnit: item.materialUnit, //单位
              materialQty: item.materialQty, //数量
              materialPrice: item.materialPrice, //单价
              subTotal: item.subTotal, //小计
              remark: item.remark //备注
            };
          });
        const { code, message } = await editOutStock(params);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "receive") {
        const { code, message } = await doInStock({
          id: formData.value.id,
          keepStaffId: formData.value.keepStaffId,
          outStockTime: formData.value.outStockTime,
          attach: formData.value.attach
        });
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

//新增设备明细
async function handleAdd() {
  const { data = [] } = await GetItemsFromPssEx({
    projectId: formData.value.projectId,
    excludePssIds: pssIdsList.value
  });
  const _data = data || [];
  if (_data.length > 0) {
    _data.forEach(item => {
      deviceList.value.push(item);
    });
  } else {
    ElMessage.error("暂无更多数据");
  }
  // deviceList.value.push({ ...COMPANY_MODEL });
  // getOutStockItemList();
  // const { data = [] } = await getOutStockItems({
  //   projectId: formData.value.projectId
  // });
  // const _data = data || [];
  // let aList = [];
  // aList = _data.map(item => {
  //   deviceList.value.map(aitem => {
  //     if (item.pssManageId != aitem.pssManageId) {
  //       return item;
  //     }
  //   });
  // });
  // console.log("aList", aList);
  // deviceList.value = aList;
}

//移除设备明细
function handleDelete(index) {
  deviceList.value.splice(index, 1);
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  deviceList.value = [];
  projectList.value = [];
  if (!formEl) return;
  formEl.resetFields();
  fileList.value = [];
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};

onBeforeUpdate(() => {
  console.log("onBeforeUpdate");
  rowFormRefs = [];
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="showType == 'add' ? 1162 : 1092"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="78px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-if="showType == 'add'"
              v-model="formData.projectId"
              placeholder="请选择"
              :disabled="showType != 'add'"
              :title="showType != 'add' ? '仅添加出库时可选择项目名称' : ''"
              :style="{ width: '100%' }"
              @change="handleProject"
            >
              <el-option
                v-for="item in projectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
            <el-input
              v-else
              v-model="formData.projectFullName"
              placeholder=""
              :disabled="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="乙方单位" prop="secondName">
            <el-input
              v-model="formData.secondName"
              :disabled="showType != 'add' && showType != 'edit'"
              :placeholder="true ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="单位名称" prop="customerName">
            <el-input
              v-model="formData.customerName"
              :disabled="showType != 'add' && showType != 'edit'"
              :placeholder="true ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="出库单号" prop="outStockCode">
            <el-input
              v-model="formData.outStockCode"
              :disabled="showType != 'add' && showType != 'edit'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="开票金额" prop="amount">
            <el-input-number
              v-model="formData.amount"
              :disabled="showType != 'add' && showType != 'edit'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="单位" prop="amountUnit">
            <el-input
              v-model="formData.amountUnit"
              :disabled="showType != 'add' && showType != 'edit'"
              placeholder=""
              :clearable="false"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="经办人" prop="handStaffId">
            <el-select
              v-model="formData.handStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              clearable
              @change="handleHandChange"
            >
              <el-option
                v-for="item in staffList.handStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="保管" prop="keepStaffId">
            <el-select
              v-model="formData.keepStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              clearable
              @change="handleKeepChange"
            >
              <el-option
                v-for="item in staffList.curatorStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="会计" prop="finaStaffId">
            <el-select
              v-model="formData.finaStaffId"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              clearable
              @change="handleAccountantChange"
            >
              <el-option
                v-for="item in staffList.accountantList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="6" :offset="0">
          <el-form-item label="出库日期" prop="outStockTime">
            <el-date-picker
              v-model="formData.outStockTime"
              type="date"
              :disabled="showType == 'read'"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="审核日期" prop="auditTime">
            <el-date-picker
              v-model="formData.auditTime"
              type="date"
              :disabled="showType == 'read'"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="设备明细">
            <el-card
              shadow="never"
              :body-style="{ padding: '0px', border: 'none' }"
            >
              <template v-if="showType == 'edit'" #header>
                <div class="flex justify-between items-center">
                  <span />
                  <el-button type="primary" plain @click="handleAdd">
                    追加
                  </el-button>
                </div>
              </template>
              <el-table
                ref="tableRef"
                max-height="400px"
                :data="deviceList"
                border
                stripe
                @selection-change="handleSelectionChange"
              >
                <el-table-column
                  v-if="showType != 'read' && showType != 'audit'"
                  type="selection"
                  width="60"
                  fixed="left"
                  align="center"
                />
                <el-table-column
                  label="序号"
                  type="index"
                  width="60"
                  fixed="left"
                  align="center"
                />
                <el-table-column
                  v-if="false"
                  prop="taxCategory"
                  label="税收类别"
                  min-width="120"
                  show-overflow-tooltip
                  align="left"
                  fixed="left"
                >
                  <template #default="{ row, $index }">
                    <el-form
                      v-if="showType != 'read' && showType != 'audit'"
                      :ref="getRowFormRef"
                      :key="$index"
                      :model="row"
                      :data-key="$index"
                      label-width="0"
                      :inline="false"
                    >
                      <el-form-item
                        label=""
                        prop="taxCategory"
                        :show-message="false"
                        label-width="0"
                        :rules="[
                          {
                            required: true,
                            message: 'Please input email address',
                            trigger: 'blur'
                          }
                        ]"
                      >
                        <el-input v-model.trim="row.taxCategory" />
                      </el-form-item>
                    </el-form>
                    <span v-else>{{ row.taxCategory }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="materialName"
                  label="产品名称"
                  min-width="200"
                  show-overflow-tooltip
                  align="left"
                  fixed="left"
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.materialName"
                    />
                    <span v-else>{{ row.materialName }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="materialSpec"
                  label="规格型号"
                  min-width="100"
                  show-overflow-tooltip
                  align="left"
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.materialSpec"
                    />
                    <span v-else>{{ row.materialSpec }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="materialUnit"
                  label="单位"
                  width="90"
                  show-overflow-tooltip
                  align="center"
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.materialUnit"
                    />
                    <span v-else>{{ row.materialUnit }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="数量"
                  align="right"
                  :width="showType == 'add' || showType == 'edit' ? 144 : 84"
                  prop="materialQty"
                >
                  <template #default="{ row }">
                    <el-input
                      v-if="showType != 'read' && showType != 'audit'"
                      v-model="row.materialQty"
                      :disabled="!row.isChecked"
                      :title="!row.isChecked ? '请先选中该行' : ''"
                      placeholder=""
                      clearable
                      :step="1"
                      :min="1"
                      :max="row.availableQty"
                      type="number"
                      @change="handleNumberChange($event, row)"
                    />
                    <span v-else>{{ row.materialQty }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="false"
                  prop="inStockQty"
                  label="已出库数量"
                  width="100"
                  align="right"
                />
                <el-table-column
                  v-if="false"
                  label="有效数量"
                  align="right"
                  prop="availableQty"
                  width="90"
                />
                <el-table-column
                  label="单价"
                  align="right"
                  prop="materialPrice"
                  width="90"
                  :formatter="
                    ({ materialPrice }) => {
                      return materialPrice != null && materialPrice != undefined
                        ? materialPrice.toFixed(2)
                        : 0;
                    }
                  "
                />
                <!-- <el-table-column label="单价" min-width="120" align="right">
            <template #default="{ row }">
              <el-input-number
                v-if="showType == 'edit'"
                v-model="row.materialPriceNoTax"
                :controls="false"
                :min="0"
                value-on-clear="min"
              />
              <span v-else>{{ row.materialPriceNoTax }}</span>
            </template>
          </el-table-column> -->

                <el-table-column
                  label="金额"
                  align="right"
                  min-width="100"
                  prop="subTotal"
                >
                  <!-- <template #default="{ row }">
                  <el-input-number
                    v-if="showType != 'read' && showType != 'audit'"
                    v-model="row.subTotal"
                    :disabled="!row.isChecked"
                    :title="
                      !row.isChecked
                        ? '请先选中该行'
                        : ''
                    "
                    :controls="false"
                    :min="0"
                    controls-position="right"
                    value-on-clear="min"
                  />
                  <span v-else>{{ row.subTotal }}</span>
                </template> -->
                </el-table-column>
                <el-table-column
                  v-if="false"
                  label="出库状态"
                  width="120"
                  align="center"
                  prop="materialStateName"
                >
                  <template #default="{ row }">
                    <el-tag :type="row.materialState == 1 ? 'info' : 'success'">
                      {{ row.materialStateName }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="remark"
                  label="备注"
                  min-width="200"
                  align="left"
                  show-overflow-tooltip
                />
                <el-table-column
                  v-if="showType == 'add' || showType == 'edit'"
                  label="操作"
                  min-width="100"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ $index }">
                    <el-button type="text" @click="handleDelete($index)">
                      移除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6" :offset="0">
          <el-form-item label="合计金额（未税）">
            <el-input-number
              v-model="formData.totalAmount"
              :readonly="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6" :offset="0">
          <el-form-item label="合计金额">
            <el-input-number
              v-model="formData.totalAmount"
              :readonly="showType == 'read'"
              :controls="false"
              :min="0"
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="24" :offset="0">
          <el-form-item label="出库单" prop="attach" label-width="92px">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :disabled="showType != 'edit' && showType != 'add'"
              accept="*"
              action="attach"
              :auto-upload="true"
              :limit="1"
              :show-file-list="showType != 'read'"
              :http-request="fileUpload"
              :on-exceed="handleExceed"
              :on-error="handleError"
              :on-remove="
                () => {
                  handleRemove('attach');
                }
              "
              :on-success="handleSuccess"
            >
              <el-button v-if="showType != 'read'" type="primary" text>
                选择文件
              </el-button>
              <DownloadButton
                v-else-if="fileList.length > 0"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-else> 未上传 </span>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="sureDisabled"
        :title="sureDisabled ? '请勾选需要出库的设备明细' : ''"
        type="primary"
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

:deep(.el-table__cell) {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
