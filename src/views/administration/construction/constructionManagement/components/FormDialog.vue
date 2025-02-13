<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance } from "element-plus";

import { GetForDrawing, UpdateForDrawing } from "@/api/sellContractItem";
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  seq: "", //序号
  materialName: "", //物资名称
  materialSpec: "", //规格型号
  materialUnit: "", //单位
  materialParams: "", //参数要求
  materialPrice: "", //单价
  drawingQty: 0, //图纸数量
  siteItems: [] //站点明细
};

// 表单校验规则
const fromRules = {
  materialName: [{ required: true, message: "输入物资名称", trigger: "blur" }]
  // drawingQty: [
  //   {
  //     trigger: "blur",
  //     validator: (rule: any, value: any, callback: any) => {
  //       if (!value) {
  //         return callback(new Error("请输入数量"));
  //       } else {
  //         callback();
  //       }
  //     }
  //   }
  // ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
const siteLiset = ref([]); //获取站点列表
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "edit"
    ? "编辑施工明细"
    : showType.value == "read"
      ? "查看施工明细"
      : "";
});

watch(
  siteLiset,
  newVal => {
    console.log("newVal", newVal);
    if (newVal.length < 1) return;
    let drawingQty = 0;
    newVal.forEach(element => {
      if (element.drawingQty == null || element.drawingQty == "") {
        element.drawingQty = 0;
      }
      drawingQty += element.drawingQty;
    });
    formData.value.drawingQty = drawingQty;
  },
  { deep: true }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    getDetail(_formData.id);
  }
};
defineExpose({ show });

// 根据Id获取详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await GetForDrawing({
    id
  });
  formData.value = data || {};
  siteLiset.value = formData.value.siteItems;
  loading.value = false;
};

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      formData.value.siteItems = siteLiset.value;
      UpdateForDrawing(formData.value)
        .then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            dialogVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        })
        .finally(() => {
          loading.value = false;
        });
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
    :width="632"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="物资名称" prop="materialName">
            <el-input v-model="formData.materialName" readonly />
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
              :rows="2"
              type="textarea"
              readonly
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="单位" prop="materialUnit">
            <el-input v-model="formData.materialUnit" readonly />
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
                    v-model="row.drawingQty"
                    :controls="false"
                    :min="0"
                    :step="1"
                    :precision="0"
                    step-strictly
                    value-on-clear="min"
                  />
                  <span v-else>{{ row.drawingQty }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="总数量" prop="drawingQty">
            <el-input-number
              v-model="formData.drawingQty"
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
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="loading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
