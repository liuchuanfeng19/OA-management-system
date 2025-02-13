<script setup lang="ts">
import _ from "lodash";
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import { getSiteList } from "@/api/site";
import { GetListNVForApp } from "@/api/projectWinBid";
import { GetListBuyRecvAddress } from "@/api/buyRecvAddress";
import { createCollectItem, updateCollectItem } from "@/api/reqOrderItem";
// 表单校验规则;
const rules = {
  bidCompany: [{ required: true, message: "输入中标单位", trigger: "blur" }],
  buyRecvAddressId: [
    { required: true, message: "请输入收货地址", trigger: "blur" }
  ],
  materialName: [{ required: true, message: "输入设备名称", trigger: "blur" }],
  materialQty: [
    {
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          return callback(new Error("请输入数量"));
        } else {
          callback();
        }
      }
    }
  ],
  projectId: [{ required: true, message: "请选择项目名称", trigger: "change" }],
  materialPrice: [{ required: true, message: "输入采购单价", trigger: "blur" }]
};

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  materialName: "", //物资名称(设备名称)
  materialBrand: "", //品牌
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialPrice: 0,
  materialQty: 0, //数量
  materialParams: "", //参数要求
  subTotal: 0,
  remark: "", //备注
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  projectShortName: "", //项目简称（只读）
  winBidCompanyName: "", //中标单位（只读）
  dutyStaffName: "", //项目负责人（只读）
  sellContractId: "", //销售合同ID
  sellContractItemId: "", //销售合同明细ID
  buyRecvAddressId: "",
  recvName: "",
  recvMobile: "",
  materialType: 1, //物资类型 1-正常 2-配件 3-额外采购
  preParentId: "", //父ID
  siteItems: [] //站点明细
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const allAddress = ref([]);
const siteList = ref([]); //获取站点列表
const showType = ref("add");
const formVisible = ref(false);
const projectWinBidNV = ref([]); //获取中标项目列表
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "extraAdd"
    ? "添加下采项"
    : showType.value == "partsAdd"
      ? "添加下采配件"
      : "";
});

watch(
  siteList,
  newVal => {
    console.log("newVal", newVal);
    if (newVal.length < 1) return;
    let materialQty = 0;
    newVal.forEach(element => {
      materialQty += element.materialQty;
    });
    console.log("materialQty", materialQty);
    formData.value.materialQty = materialQty;
    formData.value.subTotal = materialQty;
  },
  { deep: true }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  showType.value = _showType;
  formVisible.value = true;
  if (_formData) {
    INITIAL_DATA.projectId = _formData.projectId;
    if (showType.value == "partsAdd") {
      INITIAL_DATA.materialType = 2;
      formData.value = { ...INITIAL_DATA };
      formData.value.preParentId = _formData.preId;
      handleProjectChange(formData.value.projectId);
    }
  } else {
    INITIAL_DATA.materialType = 3;
    formData.value = { ...INITIAL_DATA };
  }
};
defineExpose({ show });
//获取收货地址
async function getAddress() {
  const { data } = await GetListBuyRecvAddress({
    projectId: formData.value.projectId,
    pageIndex: 1,
    pageSize: 9999
  });
  allAddress.value = data.data || [];
  if (allAddress.value.length > 0) {
    formData.value.buyRecvAddressId = allAddress.value[0].id;
    handleAddressChange(allAddress.value[0].id);
  }
}

//获取中标项目列表NV;
async function getProjectSiteList() {
  const { data } = await getSiteList({
    pageIndex: 1,
    pageSize: 999,
    projectId: formData.value.projectId
  });
  if (data) {
    const _data = data.data || [];
    siteList.value = _data.map(item => {
      return {
        siteId: item.id,
        siteName: item.name,
        availableQty: 0,
        materialQty: 0,
        receiveTime: ""
      };
    });
  }
}

//获取中标项目列表NV;
async function getProjectWinBidNV() {
  const { data } = await GetListNVForApp();
  if (data) {
    projectWinBidNV.value = data;
  }
}

function handleProjectChange(val) {
  const project = projectWinBidNV.value.find(item => item.id == val);
  formData.value.dutyStaffName = project.dutyStaffName;
  formData.value.winBidCompanyName = project.winBidCompanyName;
  getProjectSiteList();
  getAddress();
}
//选择收货地址之后关联数据
function handleAddressChange(val) {
  const address = allAddress.value.find(item => item.id == val);
  formData.value.recvName = address.recvName;
  formData.value.recvMobile = address.recvMobile;
}
function handleMaterialTypeChange() {}

// 编辑表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formData.value.siteItems = siteList.value;
      if (showType.value == "partsAdd" || showType.value == "extraAdd") {
        const { code, message } = await createCollectItem(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        const { code, message } = await updateCollectItem(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      }
    }
  });
}, 300);
function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}
// 重置表单
const resetForm = () => {
  siteList.value = [];
  ruleFormRef.value.resetFields();
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
getProjectWinBidNV();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="820"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              placeholder="请选择"
              clearable
              filterable
              style="width: 100%"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in projectWinBidNV"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目负责人" prop="dutyStaffName">
            <el-input v-model="formData.dutyStaffName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="中标单位" prop="winBidCompanyName">
            <el-input v-model="formData.winBidCompanyName" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="12" :offset="0">
          <el-form-item label="物资类型" prop="materialType">
            <el-select
              v-model="formData.materialType"
              placeholder="请选择"
              style="width: 100%"
              @change="handleMaterialTypeChange"
            >
              <el-option label="正常" :value="1" :disabled="true" />
              <el-option label="配件" :value="2" />
              <el-option label="额外" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="设备名称" prop="materialName">
            <el-input v-model="formData.materialName" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="品牌" prop="materialBrand">
            <el-input v-model="formData.materialBrand" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="规格型号" prop="materialSpec">
            <el-input v-model="formData.materialSpec" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="参数要求" prop="materialParams">
            <el-input
              v-model="formData.materialParams"
              :rows="2"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="单位" prop="materialUnit">
            <el-input v-model="formData.materialUnit" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="采购单价" prop="materialPrice">
            <el-input
              v-model="formData.materialPrice"
              type="number"
              @input="
                val => {
                  formData.materialPrice =
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

        <el-col :span="24" :offset="0">
          <el-form-item label="收货地址" prop="buyRecvAddressId">
            <el-select
              v-model="formData.buyRecvAddressId"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @change="handleAddressChange"
            >
              <el-option
                v-for="item in allAddress"
                :key="item.id"
                :label="item.recvAddress"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收货人" prop="recvName">
            <el-input v-model="formData.recvName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="电话" prop="recvMobile">
            <el-input v-model="formData.recvMobile" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="站点" prop="">
            <el-table
              highlight-current-row
              :data="siteList"
              border
              stripe
              :max-height="280"
            >
              <el-table-column
                label="序号"
                type="index"
                width="60"
                fixed="left"
                align="center"
              />

              <el-table-column
                label="站点名称"
                :min-width="150"
                prop="siteName"
                show-overflow-tooltip
              />
              <el-table-column label="数量" :min-width="100" align="right">
                <template #default="{ row }">
                  <el-input-number
                    v-if="showType != 'query'"
                    v-model="row.materialQty"
                    :controls="false"
                    :min="0"
                    :step="1"
                    :precision="0"
                    step-strictly
                    value-on-clear="min"
                  />
                  <span v-else>{{ row.materialQty }}</span>
                </template>
              </el-table-column>
              <el-table-column label="到货日期" :min-width="150">
                <template #default="{ row }">
                  <el-date-picker
                    v-if="showType != 'query'"
                    v-model="row.receiveTime"
                    :style="{ width: '100%' }"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled="showType == 'query'"
                  />
                  <span v-else>{{ formatDatetime(row.receiveTime) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合计数量" prop="materialQty">
            <el-input-number
              v-model="formData.materialQty"
              :readonly="showType == 'query' || siteList.length > 0"
              :controls="false"
              :min="0"
              :precision="0"
              :step="1"
              step-strictly
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="beforeClose">
        {{ showType == "query" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'query'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
