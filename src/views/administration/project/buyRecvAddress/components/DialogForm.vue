<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import {
  BuyRecvAddressCreate,
  UpdateBuyRecvAddress,
  GetBuyRecvAddress
} from "@/api/buyRecvAddress";
import { ElMessage, type FormInstance } from "element-plus";
import _ from "lodash";
import { isPhone } from "@pureadmin/utils";
import { isTel } from "@/utils/validate";
import { userProjectStoreHook } from "@/store/modules/project";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目ID
  projectFullName: "", //项目全称
  recvName: "", //收货人姓名
  recvMobile: "", //收货人联系方式
  recvAddress: "", //收货地址
  recvArea: "", //所在地区
  isDefault: false, //是否默认
  remark: "" //备注
};
const { getProjectWinBidNVList } = userProjectStoreHook();
// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  recvName: [{ required: true, message: "请输入收货人姓名", trigger: "blur" }],
  recvAddress: [{ required: true, message: "请输入收货地址", trigger: "blur" }],

  recvMobile: {
    required: true, //编辑的时候为必填
    trigger: "blur",
    validator: (rule, value, callback) => {
      if (value) {
        if (!isPhone(value) && !isTel(value)) {
          callback(new Error("电话格式不正确"));
        } else {
          callback();
        }
      } else {
        callback(new Error("请输入收货人联系电话"));
      }
    }
  }
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const dialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const showType = ref("add");
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加地址"
    : showType.value == "edit"
      ? "编辑地址"
      : showType.value == "query"
        ? "查看地址"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  getProjectWinBidNVList();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await GetBuyRecvAddress({ id });
  formData.value = data || {};
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await BuyRecvAddressCreate(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await UpdateBuyRecvAddress(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
}, 300);

function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectFullName = project.name;
}

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
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              filterable
              :disabled="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请选择'"
              @change="handleProjectChange"
              ><el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收货人姓名" prop="recvName">
            <el-input
              v-model.trim="formData.recvName"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="联系电话" prop="recvMobile">
            <el-input
              v-model.trim="formData.recvMobile"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="所在地区" prop="recvArea">
            <el-input
              v-model.trim="formData.recvArea"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否默认" prop="isDefault">
            <el-radio-group
              v-model="formData.isDefault"
              :disabled="showType == 'query'"
            >
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="收货地址" prop="recvAddress">
            <el-input
              v-model.trim="formData.recvAddress"
              type="textarea"
              show-word-limit
              :maxlength="255"
              :readonly="showType == 'query'"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model.trim="formData.remark"
              :readonly="showType == 'query'"
              type="textarea"
              show-word-limit
              :maxlength="255"
              :placeholder="showType == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType == "query" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'query'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
