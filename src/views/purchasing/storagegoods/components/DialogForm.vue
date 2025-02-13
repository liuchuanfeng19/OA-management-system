<script setup lang="ts">
import type {
  UploadFile,
  UploadFiles,
  FormInstance,
  UploadUserFile,
  UploadInstance
} from "element-plus";
import moment from "moment";
import {
  ref,
  computed,
  onBeforeMount,
  watch,
  nextTick,
  onBeforeUpdate
} from "vue";
import { ElMessage } from "element-plus";

import {
  getRecvInStock,
  createRecvInStock,
  editRecvInStock,
  doInStock,
  genInStockCode
} from "@/api/recvInStock";
import { uploadImg } from "@/api/common";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { getListForInStock } from "@/api/joinSignItem";
import { GetJoinSignNV, getListNVByJoinSignId } from "@/api/purchasing";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  curatorStaffList: $config.RoleCodeCurator,
  handStaffList: $config.RoleCodePurchasingSpecialist
};
// const COMPANY_MODEL = {
//   id: undefined,
//   projectId: "", //项目Id
//   joinSignId: "", //会签合同ID
//   joinSignItemId: "", //会签合同清单明细ID
//   recvInStockId: "", //入库单ID
//   materialName: "", //物资名称
//   materialSpec: "", //规格型号
//   materialUnit: "", //单位
//   materialQty: 0, //数量
//   materialParams: "", //参数要求
//   materialPrice: 0, //单价(含税)
//   materialPriceNoTax: 0, //单价(未税)
//   subTotalNoTax: 0, //金额/小计
//   materialState: 0, //入库状态
//   remark: "" //备注
// };
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  joinSignId: "", //会签合同ID
  supplyName: "", //乙方单位
  projectId: "", //项目Id
  projectFullName: "", //项目名称
  inStockTime: "", //入库时间
  inStockCode: "", //入库单号
  projectShortName: "", //项目简称
  recvAddress: "", //收获地址
  recvName: "", //收获人
  keepStaffId: null, //保管员Id
  keepStaffName: "", //保管员
  handStaffId: "", //经办人ID
  joinSignHandStaffName: "", //实际经办人
  openTime: "", //开标时间
  recvMobile: "", //收货人电话
  totalAmount: 0, //合计金额（未税）
  attach: [], //附件
  recvInStockItems: [
    // {
    //   ...COMPANY_MODEL
    // }
  ]
};
const sellContractItemList = ref([]); //合同明细列表
const tableRef = ref();
const sureDisabled = computed(() => {
  const selectedItem = sellContractItemList.value.find(item => item.isChecked);
  return selectedItem && rowFormValidate.value ? false : true;
});

// 表单校验规则
const fromRules = {
  joinSignId: [
    { required: true, message: "请选择会签合同", trigger: "change" }
  ],
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  recvInStockItems: [
    { required: true, message: "请添加投标单位", trigger: "blur" }
  ],
  handStaffId: [{ required: true, message: "请选择经手人", trigger: "change" }],
  keepStaffId: [{ required: true, message: "请选择保管员", trigger: "change" }],
  inStockTime: [
    { required: true, message: "请选择入库日期", trigger: "change" }
  ],
  attach: [{ required: true, message: "请上传入库单", trigger: "change" }]
};

const emit = defineEmits(["search"]);
let rowFormRefs = [];

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  curatorStaffList: [],
  handStaffList: []
});
const showType = ref("add");
const joinSignNoList = ref([]);
const formLoading = ref(false);
const dialogVisible = ref(false);
const rowFormValidate = ref(true);
const joinSignProjectList = ref([]);
const ruleFormRef = ref<FormInstance>();

const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();

const attachContractUploading = ref(false);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加入库单"
    : showType.value == "edit"
      ? "编辑入库单"
      : showType.value == "read"
        ? "查看入库单"
        : showType.value == "receive"
          ? "入库单入库"
          : "";
});

watch(
  () => formData.value.projectId,
  newVal => {
    if (!newVal) {
      formData.value.projectFullName = "";
      sellContractItemList.value = [];
      rowFormRefs = [];
      return;
    }
    if (showType.value == "add" || showType.value == "edit") {
      getRecvInStockItems();
    }
    const project = joinSignProjectList.value.find(
      item => item.projectId == newVal
    );
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
  sellContractItemList,
  newVal => {
    if (showType.value != "add" && showType.value != "edit") {
      return;
    }
    console.log("watch sellContractItemList", newVal);
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
    //     _totalAmount += element.materialQty * element.materialPriceNoTax;
    //   }
    // });
    // formData.value.totalAmount = _totalAmount;
    // 下面是根据总价和数量计算明细中的单价
    computedPrice();
  },
  {
    deep: true
  }
);
/**
 * 根据总价和数量计算明细中的单价
 */
function computedPrice() {
  sellContractItemList.value.forEach(element => {
    if (element.materialQty == "" || element.materialQty == null) {
      return;
    }
    if (element.subTotalNoTax == null || element.subTotalNoTax == undefined) {
      element.subTotalNoTax = 0;
    }
    if (element.isChecked) {
      if (element.materialQty == 0) {
        element.materialPriceNoTax = 0;
      } else {
        element.materialPriceNoTax =
          element.subTotalNoTax / element.materialQty;
      }
    } else {
      element.materialPriceNoTax = 0;
      element.subTotalNoTax = 0;
    }
  });
}
// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  dialogVisible.value = true;
  showType.value = _showType;
  INITIAL_DATA.recvInStockItems = [];
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];
  formData.value.recvInStockItems = [
    // {
    //   ...COMPANY_MODEL
    // }
  ];
  if (_showType != "add") {
    getDetail(_formData.id);
  } else {
    getInStockCode();
  }
};
defineExpose({ show });

// 根据部门Id获取员工列表
const getDetail = async id => {
  const { data = {} } = await getRecvInStock({
    id
  });
  formData.value = data || {};
  if (showType.value != "edit") {
    sellContractItemList.value = formData.value.recvInStockItems;
  }
  if (
    showType.value != "read" &&
    (formData.value.inStockTime == null || formData.value.inStockTime == "")
  ) {
    formData.value.inStockTime = moment().format("YYYY-MM-DD");
  }
  fileList.value =
    formData.value.attach != null && formData.value.attach.length > 0
      ? formData.value.attach.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  getJoinSignProjects(data.joinSignId);
  formLoading.value = false;
};

// 获取入库单号
const getInStockCode = async () => {
  const { data = {} } = await genInStockCode();
  formData.value.inStockCode = data || "";
  formLoading.value = false;
};

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

// 获取合同编号
const getJoinSignNos = async () => {
  const { data = {} } = await GetJoinSignNV();
  joinSignNoList.value = data || [];
};

// 获取合同项目
const getJoinSignProjects = async ids => {
  const { data = {} } = await getListNVByJoinSignId({ joinSignId: ids });
  joinSignProjectList.value = data || [];
};

// 获取合同项目明细
const getRecvInStockItems = async () => {
  const { data = {} } = await getListForInStock({
    joinSignId: formData.value.joinSignId,
    projectId: formData.value.projectId,
    pageIndex: 1,
    pageSize: 99999
  });
  const _data = data.data || [];
  sellContractItemList.value = _data.map(item => {
    item.isChecked = false;
    item.needChecked = true;
    item.editable = false;
    item.needEditable = true;
    // item.subTotalNoTax = item.materialPriceNoTax * item.materialQty;
    return item;
  });
  // let _sellContractItemList = [];
  // let __sellContractItemList = []; //已经添加并添加完了，在未开票明细没有，详情里有的数据
  // if (showType.value == "edit") {
  //   _sellContractItemList = formData.value.recvInStockItems;
  //   if (_data.length > 0) {
  //     _sellContractItemList.forEach(element => {
  //       const _element = _data.find(item => item.id == element.joinSignItemId);
  //       if (!_element) {
  //         element.isChecked = false;
  //         element.needChecked = true;
  //         element.editable = false;
  //         element.needEditable = true;
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
  // sellContractItemList.value = _data.map(item => {
  //   if (_sellContractItemList.length > 0) {
  //     const currentItem = _sellContractItemList.find(
  //       _item => _item.joinSignItemId == item.id
  //     );
  //     console.log("currentItem", currentItem);
  //     if (currentItem) {
  //       item.id = currentItem.id;
  //       item.joinSignId = currentItem.joinSignId;
  //       item.joinSignItemId = currentItem.joinSignItemId;
  //       item.materialQty = currentItem.materialQty;
  //       item.isChecked = false;
  //       item.needChecked = true;
  //       item.editable = false;
  //       item.needEditable = true;
  //       item.subTotalNoTax = currentItem.subTotalNoTax;
  //       console.log("item", item);
  //     } else {
  //       item.isChecked = false;
  //       item.needChecked = false;
  //       item.editable = false;
  //       item.needEditable = false;
  //       item.subTotalNoTax = item.materialPriceNoTax * item.materialQty;
  //     }
  //   } else {
  //     item.isChecked = false;
  //     item.needChecked = false;
  //     item.editable = false;
  //     item.needEditable = false;
  //     item.subTotalNoTax = item.materialPriceNoTax * item.materialQty;
  //   }
  //   return item;
  // });
  // 编辑时，如果有明细被申请完了，回显本次已经开过的明细
  // if (showType.value == "edit") {
  //   sellContractItemList.value = sellContractItemList.value.concat(
  //     __sellContractItemList.map(item => {
  //       item.isChecked = false;
  //       item.needChecked = true;
  //       item.editable = false;
  //       item.needEditable = true;
  //       item.inStockQty = item.materialQty;
  //       item.availableQty = 0;
  //       return item;
  //     })
  //   );
  // }
  console.log("sellContractItemList", sellContractItemList.value);
  const selection = tableRef.value.getSelectionRows();
  console.log("selection", selection);
  nextTick(() => {
    sellContractItemList.value.forEach(element => {
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

function hanndleJoinSign(val) {
  joinSignProjectList.value = [];
  formData.value.recvInStockItems = [];
  formData.value.projectFullName = "";
  formData.value.projectId = "";
  getJoinSignProjects(val);
}

function handleProject() {
  // formData.value.recvInStockItems = [];
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
// 表格行选中回调resetForm
function handleSelectionChange(selection) {
  sellContractItemList.value.forEach(item => {
    const finder = selection.find(_item => _item.id == item.id);
    item.isChecked = finder ? true : false;
  });
}

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError1 = () => {
  uploadRef1.value.clearFiles();
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

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const params = { ...formData.value };
        params.recvInStockItems = sellContractItemList.value
          .filter(item => item.isChecked)
          .map(item => {
            return {
              id: undefined, //
              joinSignItemId: item.joinSignItemId, //会签采购合同明细ID
              taxCategory: item.taxCategory, //税收类别
              materialName: item.materialName, //物资名称
              materialSpec: item.materialSpec, //规格型号
              materialUnit: item.materialUnit, //单位
              materialQty: item.materialQty, //数量
              materialPrice: item.materialPriceNoTax, //单价
              subTotalNoTax: item.subTotalNoTax //小计
            };
          });
        const { code, message } = await createRecvInStock(params);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const params = { ...formData.value };
        params.recvInStockItems = sellContractItemList.value
          .filter(item => item.isChecked)
          .map(item => {
            return {
              id: item.id ? item.id : undefined, //
              joinSignItemId: item.joinSignItemId
                ? item.joinSignItemId
                : item.id, //会签合同明细ID
              taxCategory: item.taxCategory, //税收类别
              materialName: item.materialName, //物资名称
              materialSpec: item.materialSpec, //规格型号
              materialUnit: item.materialUnit, //单位
              materialQty: item.materialQty, //数量
              materialPrice: item.materialPriceNoTax, //单价
              subTotalNoTax: item.subTotalNoTax //小计
            };
          });
        const { code, message } = await editRecvInStock(params);
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
          inStockTime: formData.value.inStockTime,
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

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  sellContractItemList.value = [];
  joinSignProjectList.value = [];
  if (!formEl) return;
  formEl.resetFields();
  fileList.value = [];
};

//关闭对话框
const closeDialog = () => {
  resetForm(ruleFormRef.value);
};

onBeforeMount(() => {
  getJoinSignNos();
});
onBeforeUpdate(() => {
  console.log("onBeforeUpdate");
  rowFormRefs = [];
});
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1330"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="124px"
    >
      <el-row :gutter="20">
        <el-col :span="6" :offset="0">
          <el-form-item label="入库单号" prop="inStockCode">
            <el-input v-model="formData.inStockCode" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="会签合同" prop="joinSignId">
            <el-select
              v-model="formData.joinSignId"
              :placeholder="showType == 'read' ? '' : '请选择'"
              filterable
              :disabled="showType == 'read'"
              @change="hanndleJoinSign"
            >
              <el-option
                v-for="item in joinSignNoList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="showType != 'add'" :span="6" :offset="0">
          <el-form-item label="乙方单位" prop="supplyName">
            <el-input
              v-model="formData.supplyName"
              :disabled="true"
              :placeholder="true ? '' : '请选择'"
            /> </el-form-item
        ></el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              :style="{ width: '100%' }"
              @change="handleProject"
            >
              <el-option
                v-for="item in joinSignProjectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6" :offset="0">
          <el-form-item label="收货人" prop="recvName">
            <el-input v-model="formData.recvName" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6" :offset="0">
          <el-form-item label="电话" prop="recvMobile">
            <el-input v-model="formData.recvMobile" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="6" :offset="0">
          <el-form-item label="收货地址" prop="recvAddress">
            <el-input v-model="formData.recvAddress" :disabled="true" />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="经手人" prop="handStaffId">
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
          <el-form-item label="保管员" prop="keepStaffId">
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
          <el-form-item label="入库日期" prop="inStockTime">
            <el-date-picker
              v-model="formData.inStockTime"
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
            <el-table
              ref="tableRef"
              :data="sellContractItemList"
              border
              stripe
              class="mb-4"
              @selection-change="handleSelectionChange"
            >
              <el-table-column
                v-if="showType != 'read'"
                label=""
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
                label="名称"
                min-width="200"
                show-overflow-tooltip
                align="left"
                fixed="left"
              />
              <el-table-column
                prop="materialSpec"
                label="规格"
                min-width="100"
                show-overflow-tooltip
                align="left"
              />
              <el-table-column
                prop="materialUnit"
                label="单位"
                width="100"
                align="center"
              />
              <el-table-column label="数量" align="right" width="120">
                <template #default="{ row }">
                  <el-input-number
                    v-if="showType != 'read' && showType != 'audit'"
                    v-model="row.materialQty"
                    :disabled="!row.isChecked"
                    :title="
                      !row.isChecked
                        ? '请先选中该行'
                        : !row.editable
                          ? '请先点击编辑按钮'
                          : ''
                    "
                    :controls="true"
                    :min="1"
                    :max="row.availableQty"
                    controls-position="right"
                    :step="1"
                    :precision="0"
                    step-strictly
                    value-on-clear="min"
                  />
                  <span v-else>{{ row.materialQty }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="inStockQty"
                label="已入库数量"
                width="100"
                align="right"
              />
              <el-table-column
                v-if="showType != 'read' && showType != 'audit'"
                label="有效数量"
                align="right"
                prop="availableQty"
                width="90"
              />
              <el-table-column
                label="单价"
                align="right"
                prop="materialPriceNoTax"
                width="100"
                :formatter="
                  ({ materialPriceNoTax }) => {
                    return materialPriceNoTax != null &&
                      materialPriceNoTax != undefined &&
                      materialPriceNoTax != ''
                      ? materialPriceNoTax.toFixed(2)
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
                prop="subTotalNoTax"
              >
                <template #default="{ row }">
                  <el-input-number
                    v-if="showType != 'read' && showType != 'audit'"
                    v-model="row.subTotalNoTax"
                    :disabled="!row.isChecked"
                    :title="
                      !row.isChecked
                        ? '请先选中该行'
                        : !row.editable
                          ? '请先点击编辑按钮'
                          : ''
                    "
                    :controls="false"
                    :min="0"
                    controls-position="right"
                    value-on-clear="min"
                  />
                  <span v-else>{{ row.subTotalNoTax }}</span>
                </template>
              </el-table-column>
              <el-table-column
                v-if="false"
                label="入库状态"
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
            </el-table>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
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
        <el-col :span="24" :offset="0">
          <el-form-item label="入库单" prop="attach" label-width="92px">
            <el-upload
              ref="uploadRef"
              :disabled="showType != 'edit' && showType != 'add'"
              accept="*"
              action="attach"
              :auto-upload="true"
              :file-list="fileList"
              :http-request="fileUpload1"
              :multiple="true"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove1(uploadFile, uploadFiles, 'attach');
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
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType != "read" ? "取消" : "关闭"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        :disabled="sureDisabled"
        :title="sureDisabled ? '请勾选需要入库的设备明细' : ''"
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
