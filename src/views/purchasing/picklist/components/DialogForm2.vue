<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import {
  GetReqCartItem,
  createReqCartItem,
  UpdateReqCartItem,
  GetMyProjectListNV
} from "@/api/reqCartItem";
import { getSiteList } from "@/api/site";
import dayjs from "dayjs";
const props = defineProps({
  projectId: {
    type: String,
    default: ""
  }
});
// 表单校验规则;
const rules = {
  bidCompany: [{ required: true, message: "输入中标单位", trigger: "blur" }],
  recvAddress: [{ required: true, message: "请输入收货地址", trigger: "blur" }],
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
  remark: [
    {
      trigger: "blur",
      validator: (rule: any, value: any, callback: any) => {
        if (
          formData.value.materialQty != formData.value.availableQty &&
          !value &&
          showType.value == "edit" &&
          formData.value.sellContractId !=
            "00000000-0000-0000-0000-000000000000"
        ) {
          return callback(new Error("实际采购量与合同数量不符，请填写备注!"));
        } else {
          callback();
        }
      }
    }
  ],
  projectId: [{ required: true, message: "请选择项目名称", trigger: "change" }]
};

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  materialName: "", //物资名称(设备名称)
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: 0, //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "", //备注
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  projectShortName: "", //项目简称（只读）
  winBidCompanyName: "", //中标单位（只读）
  projectDutyStaffName: "", //项目负责人（只读）
  sellContractId: "", //销售合同ID
  sellContractItemId: "", //销售合同明细ID
  materialType: 2, //物资类型 1-正常 2-配件 3-额外采购
  parentId: "", //父ID
  availableQty: 0,
  siteItems: [] //站点明细
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const siteLiset = ref([]); //获取站点列表
const showType = ref("add");
const formVisible = ref(false);
const formLoading = ref(false);
const projectWinBidNV = ref([]); //获取中标项目列表
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请下采单"
    : showType.value == "read"
      ? "查看下采单"
      : showType.value == "edit"
        ? "编辑下采单"
        : showType.value == "undo"
          ? "撤回下采单"
          : showType.value == "add"
            ? "添加下采单"
            : showType.value == "partsAdd"
              ? "添加下采单配件"
              : showType.value == "extraAdd"
                ? "添加下采单"
                : "";
});

watch(
  siteLiset,
  newVal => {
    console.log("newVal", newVal);
    if (newVal.length < 1) return;
    let materialQty = 0;
    newVal.forEach(element => {
      materialQty += element.materialQty;
    });
    console.log("materialQty", materialQty);
    formData.value.materialQty = materialQty;
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
      formData.value.parentId = _formData.id;
      handleProjectChange(props.projectId);
    } else if (showType.value == "edit") {
      await getDetail(_formData.id);
    } else {
      await getDetail(_formData.id);
    }
  } else {
    INITIAL_DATA.projectId = props.projectId;
    INITIAL_DATA.materialType = 3;
    formData.value = { ...INITIAL_DATA };
    handleProjectChange(props.projectId);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetReqCartItem({ id });
  formData.value = data || { ...INITIAL_DATA };
  siteLiset.value = formData.value.siteItems;
  formLoading.value = false;
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
    siteLiset.value = _data.map(item => {
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
  const { data } = await GetMyProjectListNV();
  if (data) {
    projectWinBidNV.value = data;
  }
}

function handleProjectChange(val) {
  const project = projectWinBidNV.value.find(item => item.id == val);
  formData.value.winBidCompanyName = project.winBidCompanyName;
  getProjectSiteList();
}

function handleMaterialTypeChange() {}

// 编辑表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  formEl.validate(async valid => {
    if (valid) {
      formData.value.siteItems = siteLiset.value;
      if (showType.value == "partsAdd" || showType.value == "extraAdd") {
        const { code, message } = await createReqCartItem(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        const { code, message } = await UpdateReqCartItem(formData.value);
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
  siteLiset.value = [];
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
              :disabled="showType == 'read' || showType == 'edit'"
              :placeholder="
                showType == 'read' || showType == 'edit' ? '' : '请选择'
              "
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
          <el-form-item label="中标单位" prop="winBidCompanyName">
            <el-input v-model="formData.winBidCompanyName" readonly />
          </el-form-item>
        </el-col>
        <el-col v-if="false" :span="12" :offset="0">
          <el-form-item label="物资类型" prop="materialType">
            <el-select
              v-model="formData.materialType"
              :disabled="showType == 'read' || showType == 'edit'"
              :placeholder="
                showType == 'read' || showType == 'edit' ? '' : '请选择'
              "
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
            <el-input
              v-model="formData.materialName"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="规格型号" prop="materialSpec">
            <el-input
              v-model="formData.materialSpec"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="参数要求" prop="materialParams">
            <el-input
              v-model="formData.materialParams"
              :rows="2"
              type="textarea"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="单位" prop="materialUnit">
            <el-input
              v-model="formData.materialUnit"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="站点" prop="">
            <el-table
              highlight-current-row
              :data="siteLiset"
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
                    v-if="showType != 'read'"
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
                    v-if="showType != 'read'"
                    v-model="row.receiveTime"
                    :style="{ width: '100%' }"
                    type="date"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                    :disabled="showType == 'read'"
                  />
                  <span v-else>{{
                    row.receiveTime ? formatDatetime(row.receiveTime) : ""
                  }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合计数量" prop="materialQty">
            <el-input-number
              v-model="formData.materialQty"
              :readonly="showType == 'read' || siteLiset.length > 0"
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
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
