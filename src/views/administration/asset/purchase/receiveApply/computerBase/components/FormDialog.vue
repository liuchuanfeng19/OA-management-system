<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { FormInstance, ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { ComputerGet, ComputerUpdate } from "@/api/computer";
import { userDepartmentStoreHook } from "@/store/modules/department";

const rules = {
  belongCompanyId: [
    { required: true, message: "请选择设备归属", trigger: "change" }
  ]
};

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  belongCompanyId: "",
  belongCompanyName: "",
  state: "",
  stateName: "",
  name: "",
  code: "",
  brand: "",
  spec: "",
  deviceType: "",
  box: "",
  board: "",
  memory: "",
  hardDisk: "",
  screen: "",
  keyboard: "",
  mouse: "",
  mac: "",
  remark: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

const showType = ref("apply");
const formData = ref(null);
const formLoading = ref(false);
const formVisible = ref(false);
const activeName = ref("baseInfo");
const ruleFormRef = ref<FormInstance>();

const { getRootDeptList } = userDepartmentStoreHook();
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请"
    : showType.value == "edit"
      ? "编辑"
      : showType.value == "read"
        ? "查看"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };

  if (_formData) {
    showType.value = _type;
    await getDetail(_formData.id);
  } else {
    showType.value = "apply";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await ComputerGet({ id });
  formData.value = data || {};

  formLoading.value = false;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "edit") {
        ComputerUpdate(formData.value).then(({ code, message }) => {
          if (code == 0) {
            ElMessage.success(message);
            formVisible.value = false;
            resetForm(formEl);
            emit("search");
          }
        });
      }
      // else if (showType.value == "add") {
      //   formData.value.doTemp = flag;
      //   createProjCredit(formData.value).then(({ code, message }) => {
      //     if (code==0) {
      //       ElMessage.success(message);
      //       formVisible.value = false;
      //       resetForm(formEl);
      //       emit("search");
      //     }
      //   });
      // }
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
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="设备归属" prop="belongCompanyId">
            <el-cascader
              v-model="formData.belongCompanyId"
              :options="rootDepartment"
              placeholder="请选择"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="设备名称" prop="name">
            <el-input
              v-model="formData.name"
              :disabled="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请选择'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="设备编号" prop="code">
            <el-input
              v-model="formData.code"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="设备品牌" prop="brand">
            <el-input
              v-model="formData.brand"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="型号" prop="spec">
            <el-input
              v-model="formData.spec"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="类型" prop="deviceType">
            <el-input
              v-model="formData.deviceType"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="机箱" prop="box">
            <el-input
              v-model="formData.box"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="主板" prop="board">
            <el-input
              v-model="formData.board"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="内存" prop="memory">
            <el-input
              v-model="formData.memory"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="硬盘" prop="hardDisk">
            <el-input
              v-model="formData.hardDisk"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="显示器" prop="screen">
            <el-input
              v-model="formData.screen"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="键盘" prop="keyboard">
            <el-input
              v-model="formData.keyboard"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="鼠标" prop="mouse">
            <el-input
              v-model="formData.mouse"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="MAC" prop="mac">
            <el-input
              v-model="formData.mac"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :readonly="showType == 'read'"
              :placeholder="showType != 'edit' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>

      <el-button
        v-if="showType == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
