<script setup lang="ts">
import dayjs from "dayjs";
import { ref, computed } from "vue";
import { type FormInstance } from "element-plus";

import { useNav } from "@/layout/hooks/useNav";
import { GetReqOrderItem } from "@/api/reqOrderItem";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目ID
  projectFullName: "", //项目全称（只读）
  winBidCompanyName: "", //中标单位（只读）
  projectDutyStaffName: "", //项目负责人（只读）
  materialName: "", //物资名称
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialQty: "", //数量
  materialParams: "", //参数要求
  receiveTime: "", //到货日期
  remark: "", //备注
  isCollect: false, //是否领取
  collectStaffId: "", //领取人ID
  collectStaffName: "", //领取人
  collectTime: "", //领取时间
  isJoinSign: false, //是否已关联采购会签
  siteItems: [] //站点明细
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const type = ref("apply");
const stauts = ref("");
const siteLiset = ref([]); //获取站点列表

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "apply";
  }
  formData.value.staffName = staffName;
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "query" ? "查看待领采购单" : "";
});

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields();
};
function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetReqOrderItem({ id });
  formData.value = data || {};
  siteLiset.value = formData.value.siteItems;

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
    :width="700"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form ref="ruleFormRef" :model="formData" label-width="70px">
      <div>
        <el-row :gutter="20">
          <el-col :span="24" :offset="0">
            <el-form-item label="项目名称" prop="projectFullName">
              <el-input v-model="formData.projectFullName" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="设备名称" prop="materialName">
              <el-input v-model="formData.materialName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="单位" prop="materialUnit">
              <el-input v-model="formData.materialUnit" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="规格型号" prop="materialSpec">
              <el-input v-model="formData.materialSpec" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="参数要求" prop="materialParams">
              <el-input
                v-model="formData.materialParams"
                readonly
                :rows="3"
                type="textarea"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="formData.remark"
                :rows="2"
                type="textarea"
                readonly
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
                  align="left"
                  :min-width="100"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <span>{{ row.materialQty }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="到货日期"
                  align="center"
                  min-width="150"
                  show-overflow-tooltip
                >
                  <template #default="{ row }">
                    <span>{{
                      row.receiveTime ? formatDatetime(row.receiveTime) : "-"
                    }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="数量" prop="materialQty">
              <el-input-number
                v-model="formData.materialQty"
                readonly
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
      <!-- 查看详情 -->
      <el-button v-if="type == 'query'" @click="beforeClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
