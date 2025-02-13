<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import type { FormInstance } from "element-plus";

import { updateForItem } from "@/api/sellContractItem";
import { ElMessage } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  materialName: "",
  materialQty: 0,
  seq: "",
  innerSeq: 0,
  items: []
};

// 表单校验规则
const fromRules = {
  seq: [{ required: true, message: "请输入序号", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formData = ref({ ...INITIAL_DATA });
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const siteItems = ref([]);
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "编辑销售合同明细";
});

watch(
  siteItems,
  newVal => {
    console.log("siteItems", newVal);
    formData.value.materialQty = newVal.reduce(
      (accumulator, currentValue: any) =>
        accumulator + currentValue.materialQty,
      formData.value.materialQty
    );
  },
  {
    deep: true
  }
);

// 子组件暴露给父组件调用的方法
const show = async _data => {
  dialogVisible.value = true;
  formData.value = Object.assign(
    { ...INITIAL_DATA },
    JSON.parse(JSON.stringify(_data))
  );
  siteItems.value = formData.value.items;
};
defineExpose({ show });

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const param = {};
      param["id"] = formData.value.id;
      param["seq"] = formData.value.seq;
      param["materialQty"] = formData.value.materialQty;
      param["innerSeq"] = formData.value.innerSeq;
      const sites = [];
      siteItems.value.forEach(item => {
        const obj = {};
        obj["siteId"] = item.siteId;
        obj["siteName"] = item.siteName;
        obj["materialQty"] = item.materialQty;
        sites.push(obj);
      });
      param["siteItems"] = sites;
      const { code, message } = await updateForItem(param);
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
    :width="600"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form ref="ruleFormRef" :model="formData" :rules="fromRules">
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="物资名称" prop="materialName">
            <el-input v-model="formData.materialName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="序号" prop="seq">
            <el-input v-model="formData.seq" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="显示顺序" prop="innerSeq">
            <el-input-number
              v-model="formData.innerSeq"
              :step="1"
              :controls="false"
              :min="0"
              :precision="0"
              step-strictly
              value-on-clear="min"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label-width="0">
            <div>站点</div>
            <el-table
              highlight-current-row
              :data="siteItems"
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
                    v-model="row.materialQty"
                    :controls="false"
                    :min="0"
                    :step="1"
                    :precision="0"
                    step-strictly
                    value-on-clear="min"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false"> 取消 </el-button>
      <el-button type="primary" @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
