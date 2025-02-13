<script setup lang="ts">
//node_modules引用
import _ from "lodash";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { ref, computed, watch } from "vue";
import type { FormInstance } from "element-plus";

//本地资源引用开始
import { CreateReqOrder } from "@/api/reqOrder";
import { GetListBuyRecvAddress } from "@/api/buyRecvAddress";

//常量定义
const COMPANY_MODEL = {
  materialName: "", //物资名称(设备名称)
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: "", //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "", //备注
  siteItems: []
};
// 表单模型
const INITIAL_DATA = {
  id: "",
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  projectShortName: "", //项目简称（只读）
  winBidCompanyName: "", //中标单位（只读）
  projectDutyStaffName: "", //项目负责人（只读）
  buyRecvAddressId: "", //收货地址ID
  recvName: "", //收货人姓名（只读）
  recvMobile: "", //收货人联系方式（只读）
  recvAddress: "", //收货地址
  reqOrderItems: [
    {
      ...COMPANY_MODEL
    }
  ],
  reqCartItemIds: [] //选择明细id集合
};
// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  reqOrderItems: [
    { required: true, message: "请添加投标单位", trigger: "blur" }
  ]
};
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  projectList: [],
  multipleSelection: []
});
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const IdData = ref([]);
const columnList = ref([]);
const allAddress = ref([]);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加购物车采购项"
    : showType.value == "apply"
      ? "申请购物车采购项"
      : showType.value == "edit"
        ? "编辑购物车采购项"
        : showType.value == "read"
          ? "查看购物车采购项"
          : "";
});

watch(
  () => props.multipleSelection,
  val => {
    if (val.length > 0) {
      IdData.value = val.map(item => {
        return item.id;
      });
      formData.value.reqCartItemIds = IdData.value;
      formData.value.id = val[0].id;
      formData.value.projectId = val[0].projectId;
      formData.value.projectFullName = val[0].projectFullName;
      formData.value.reqOrderItems = val;
      if (formData.value.reqOrderItems.length > 0) {
        const item = formData.value.reqOrderItems[0];
        columnList.value = item.siteItems || [];
      }
      getAddress();
      console.log("formData.value.reqOrderItems", formData.value.reqOrderItems);
      console.log("columnList.value", columnList.value);
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
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
    handleProjectChange(allAddress.value[0].id);
  }
}

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

//选择收货地址之后关联数据
function handleProjectChange(val) {
  const address = allAddress.value.find(item => item.id == val);
  formData.value.recvName = address.recvName;
  formData.value.recvMobile = address.recvMobile;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await CreateReqOrder(formData.value);
      if (code == 0) {
        ElMessage.success(message);
        dialogVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
}, 300);

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
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="820"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="68px"
    >
      <el-row :gutter="20">
        <el-col :span="16" :offset="0">
          <el-form-item label="项目名称" prop="projectFullName">
            <el-input
              v-model="formData.projectFullName"
              :show-word-limit="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="0">
          <el-form-item label="收货人" prop="recvName">
            <el-input v-model="formData.recvName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="16" :offset="0">
          <el-form-item label="收货地址" prop="buyRecvAddressId">
            <el-select
              v-model="formData.buyRecvAddressId"
              placeholder="请选择"
              clearable
              style="width: 100%"
              @change="handleProjectChange"
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
        <el-col :span="8" :offset="0">
          <el-form-item label="手机号" prop="recvMobile">
            <el-input v-model="formData.recvMobile" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="设备明细">
            <el-table
              highlight-current-row
              :data="formData.reqOrderItems"
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
                label="设备名称"
                :width="120"
                show-overflow-tooltip
                fixed="left"
                prop="materialName"
              />
              <el-table-column
                label="规格型号"
                :width="120"
                show-overflow-tooltip
                prop="materialSpec"
              />
              <el-table-column
                label="参数要求"
                :width="120"
                show-overflow-tooltip
                prop="materialParams"
              />
              <el-table-column
                label="单位"
                :width="90"
                show-overflow-tooltip
                prop="materialUnit"
              />
              <el-table-column
                v-for="(item, idx) in columnList"
                :key="item.siteId"
                :label="item.siteName"
                width="100"
                align="center"
              >
                <el-table-column
                  label="数量"
                  align="right"
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
                  width="120"
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
              </el-table-column>
              <el-table-column
                label="合计数量"
                :width="90"
                align="right"
                prop="materialQty"
              />
              <el-table-column
                label="备注"
                :width="120"
                show-overflow-tooltip
                prop="remark"
              />
            </el-table>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">{{
        showType == "read" ? "关闭" : "取消"
      }}</el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
