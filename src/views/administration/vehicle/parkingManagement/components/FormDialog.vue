<script setup lang="ts">
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";
import { uploadImg } from "@/api/common";
import { Create, Update, Get } from "@/api/parkingPlace";
import { GetTreeByDeptId } from "@/api/department";
import { userStaffStoreHook } from "@/store/modules/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { getStaffListNV } = userStaffStoreHook();
const { getRootDeptList } = userDepartmentStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffName: "", //姓名
  staffId: "",
  companyId: "", //公司
  companyName: "",
  parkingSpaceNumber: "", //车位号
  carNumber: "", //车牌号
  startDate: "", //开始日期
  endDate: "", //结束日期
  deptId: "", //部门
  remark: "", //备注
  leaseFile: "" //附件
};

// 表单校验规则
const fromRules = {
  companyId: [{ required: true, message: "请选择所属公司", trigger: "change" }],

  startDate: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endDate: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  parkingSpaceNumber: [
    { required: true, message: "请输入车位号", trigger: "blur" }
  ],
  carNumber: [{ required: true, message: "请输入车牌号", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const loading = ref(false);
const showType = ref("add");
const dialogVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const departmentList = ref([]); //部门
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加车位"
    : showType.value == "edit"
      ? "编辑车位"
      : showType.value == "read"
        ? "查看车位"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
  }
  getStaffListNV();
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    await getDetail(_formData.id);
    await getDepartmentList(formData.value.companyId);
  } else {
    fileList.value = [];
    showType.value = "add";
  }
};
defineExpose({ show });

// 根据Id获取费用报销详情
const getDetail = async id => {
  loading.value = true;
  const { data = {} } = await Get({
    id
  });
  formData.value = data || {};
  fileList.value =
    formData.value.leaseFile != null && formData.value.leaseFile != ""
      ? [
          {
            name: formData.value.leaseFile.substr(
              formData.value.leaseFile.lastIndexOf("/") + 1
            ),
            url: formData.value.leaseFile
          }
        ]
      : [];
  loading.value = false;
};

/**
 * 根据公司Id获取部门列表
 * @param companyId 公司Id
 */
async function getDepartmentList(companyId) {
  if (companyId != null && companyId != "") {
    const { data } = await GetTreeByDeptId({ deptId: companyId });
    departmentList.value = data || [];
  } else {
    departmentList.value = [];
  }
}

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      if (showType.value == "add") {
        Create(formData.value)
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
      } else if (showType.value == "edit") {
        Update(formData.value)
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
    }
  });
}, 300);

async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    console.log("res", res);
    formData.value[options.action] = res["data"][0];
    // formData.value.attach.unshift(res["data"][0]);
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField(options.action, () => null);
  });
}
function handleRemove(action: string) {
  formData.value[action] = "";
}
const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

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
    :width="680"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="公司名称" prop="companyId">
            <el-select
              v-model="formData.companyId"
              :disabled="showType == 'read'"
              clearable
              filterable
              :placeholder="showType == 'read' ? '' : '请选择'"
              @change="getDepartmentList"
              ><el-option
                v-for="item in rootDepartment"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="部门" prop="deptId">
            <el-select
              v-model="formData.deptId"
              :disabled="showType == 'read'"
              clearable
              filterable
              :placeholder="showType == 'read' ? '' : '请选择'"
              ><el-option
                v-for="item in departmentList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="姓名" prop="staffId">
            <el-select
              v-model="formData.staffId"
              :disabled="showType == 'read'"
              clearable
              filterable
              :placeholder="showType == 'read' ? '' : '请选择'"
              ><el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="车位号" prop="parkingSpaceNumber">
            <el-input
              v-model.trim="formData.parkingSpaceNumber"
              :readonly="showType == 'read'"
              show-word-limit
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="车牌号" prop="carNumber">
            <el-input
              v-model.trim="formData.carNumber"
              :readonly="showType == 'read'"
              show-word-limit
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="租赁开始时间" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="租赁结束时间" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model.trim="formData.remark"
              :readonly="showType == 'read'"
              type="textarea"
              show-word-limit
              :maxlength="255"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="leaseFile">
            <el-upload
              ref="uploadRef"
              accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg,.png"
              :file-list="fileList"
              :auto-upload="true"
              :http-request="fileUpload"
              :limit="1"
              action="leaseFile"
              :on-exceed="handleExceed"
              :on-remove="
                () => {
                  handleRemove('leaseFile');
                }
              "
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button
                v-if="showType == 'add' || showType == 'edit'"
                type="primary"
                text
                >选择文件</el-button
              >
            </el-upload>
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
