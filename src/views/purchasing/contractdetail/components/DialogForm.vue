<script setup lang="ts">
import dayjs from "dayjs";
import { ref, computed, watch } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import { getMyCollectItem, updateCollectItem } from "@/api/reqOrderItem";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  winBidCompanyName: "", //中标单位（只读）
  dutyStaffName: "", //项目负责人（只读）
  materialName: "", //物资/设备名称
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: "", //数量
  materialPrice: 0, //单价
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "", //备注
  isCollect: false, //是否领取
  collectStaffId: "", //领取人ID
  collectStaffName: "", //领取人
  collectTime: "", //领取时间
  isJoinSign: false, //是否已关联采购会签
  recvName: "", //收货人姓名(只读)
  recvMobile: "", //收货人联系方式(只读)
  recvAddress: "", //收货地址(只读)
  siteItems: [], //站点明细
  materialBrand: "" //品牌
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const type = ref("apply");
const canTemp1 = ref("");
const siteLiset = ref([]); //获取站点列表

function formatDatetime(dt) {
  if (dt != null && dt != "") {
    return dayjs(dt).format("YYYY-MM-DD");
  } else {
    return "";
  }
}

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "apply";
  }
};
defineExpose({ show });

// 表单校验规则;

const rules = {
  // materialQty: [{ required: true, message: "请输入数量", trigger: "blur" }],

  materialPrice: [{ required: true, message: "请输入单价", trigger: "blur" }]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "query"
    ? "查看待采单"
    : type.value == "edit"
      ? "编辑待采单"
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

// 提交编辑表单
const submitForm = async (formEl: FormInstance) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formData.value.siteItems = siteLiset.value;
      if (formData.value.id) {
        const { message, data } = await updateCollectItem(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      }
    }
  });
};

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

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getMyCollectItem({ id });
  formData.value = data || {};
  siteLiset.value = formData.value.siteItems;
  if (data) {
    canTemp1.value = data.canTemp;
  }

  formLoading.value = false;
}

function reloadTimeRange() {}

//初始化时间段
reloadTimeRange();
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
      label-width="85px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="项目名称" prop="projectFullName">
              <el-input v-model="formData.projectFullName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="项目负责人" prop="projectDutyStaffName">
              <el-input v-model="formData.projectDutyStaffName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="中标单位" prop="winBidCompanyName">
              <el-input v-model="formData.winBidCompanyName" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0" :class="type == 'query' ? '' : 'item'">
            <el-form-item label="设备名称" prop="materialName">
              <el-input
                v-model="formData.materialName"
                :readonly="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0" :class="type == 'query' ? '' : 'item'">
            <el-form-item label="品牌" prop="materialBrand">
              <el-input
                v-model="formData.materialBrand"
                :readonly="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              label="规格型号"
              prop="materialSpec"
              :class="type == 'query' ? '' : 'item'"
            >
              <el-input
                v-model="formData.materialSpec"
                :readonly="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item
              label="参数要求"
              prop="materialParams"
              :class="type == 'query' ? '' : 'item'"
            >
              <el-input
                v-model="formData.materialParams"
                :readonly="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0" :class="type == 'query' ? '' : 'item'">
            <el-form-item label="单位" prop="materialUnit">
              <el-input
                v-model="formData.materialUnit"
                :readonly="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0" :class="type == 'query' ? '' : 'item'">
            <el-form-item label="采购单价" prop="materialPrice">
              <el-input
                v-model="formData.materialPrice"
                :readonly="type == 'query'"
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
            <el-form-item label="收货地址" prop="recvAddress">
              <el-input
                v-model.trim="formData.recvAddress"
                :readonly="type == 'query' || type == 'edit'"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="收货人" prop="recvName">
              <el-input
                v-model="formData.recvName"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请输入'"
                :readonly="type == 'query' || type == 'edit'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="电话" prop="recvMobile">
              <el-input
                v-model="formData.recvMobile"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请输入'"
                :readonly="type == 'query' || type == 'edit'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                :rows="2"
                type="textarea"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请输入'"
                :readonly="type == 'query' || type == 'edit'"
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
                :max-height="200"
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
                <el-table-column
                  label="数量"
                  :label-class-name="type == 'edit' ? 'blue' : ''"
                  :min-width="100"
                >
                  <template #default="{ row }">
                    <el-input-number
                      v-if="type != 'query'"
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
                <el-table-column
                  label="到货日期"
                  :label-class-name="type == 'edit' ? 'blue' : ''"
                  :min-width="150"
                >
                  <template #default="{ row }">
                    <el-date-picker
                      v-if="type != 'query'"
                      v-model="row.receiveTime"
                      :style="{ width: '100%' }"
                      type="date"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                      :disabled="type == 'query'"
                    />
                    <span v-else>{{ formatDatetime(row.receiveTime) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="数量" prop="materialQty">
              <el-input-number
                v-model="formData.materialQty"
                :readonly="type == 'query' || siteLiset.length > 0"
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
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'apply' || type == 'edit' || type == 'draft'"
        @click="beforeClose"
        >取消</el-button
      >

      <el-button
        v-if="type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>

      <!-- 查看详情 -->
      <el-button v-if="type == 'query'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.item .el-form-item__label {
  color: blue;
}

:deep() {
  .blue {
    color: blue !important;
  }
}
</style>
