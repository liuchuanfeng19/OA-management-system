<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import {
  Create,
  Update,
  GetCarStatusTypesNV,
  Get,
  GetDriverListNV
} from "@/api/vehicle";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { uploadImg } from "@/api/common";
import moment from "moment";
import { DownloadButton } from "@/components/DownloadButton";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  userId: "",
  carName: "",
  carImage: [],
  carBrand: "",
  carType: "",
  carLicensePlate: "",
  carLicenseUnit: "",
  carColor: "",
  carBuyDate: "",
  carForm: 0,
  userName: "",
  userMobile: "",
  carStall: "",
  carPreMaintainDate: "",
  carPreMaintainDateContent: "",
  carNextMaintainDate: "",
  carInsurance: "",
  carInsuranceDate: "",
  carPreAnnualSurveyDate: "",
  carNextAnnualSurveyDate: "",
  carTrafficControl: 1,
  carStatus: 1,
  carStatusExpr: "",
  carLicenceDocNo: ""
};

// vue3 在 <script setup> 中使用 defineProps API 来声明 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(props.data);
const formLoading = ref(false);
const CarStatuData = ref([]); //车辆状态
const CarDriverData = ref([]); //司机列表
const { staffName } = useNav(); //用户名
const type = ref("add");
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  // getApprover();
  GetDriver();
  GetCarStatus();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
    driver(_formData);
  } else {
    type.value = "add";
    formData.value.carBuyDate = moment().format("YYYY/MM/DD");
    formData.value.carPreAnnualSurveyDate = moment().format("YYYY/MM/DD");
    formData.value.carNextAnnualSurveyDate = moment().format("YYYY/MM/DD");
  }
  formData.value.staffName = staffName;
};
defineExpose({ show });

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加车辆"
    : type.value == "edit"
      ? "编辑车辆"
      : type.value == "query"
        ? "查看车辆"
        : "";
});

// 表单校验规则;

const rules = {
  carLicensePlate: [
    { required: true, message: "请输入车辆牌照", trigger: "blur" }
  ],
  carBuyDate: [
    { required: true, message: "请选择购买日期", trigger: "change" }
  ],
  carName: [{ required: true, message: "请输车辆名称", trigger: "blur" }],
  carForm: [{ required: true, message: "请选择车辆类型", trigger: "change" }],
  userMobile: [
    { required: true, message: "请输入驾驶员手机号", trigger: "blur" }
  ],
  userId: [{ required: true, message: "请选择驾驶员", trigger: "blur" }],
  // carInsurance: [
  //   { required: true, message: "请输入投保公司", trigger: "blur" }
  // ],
  carImage: [{ required: true, message: "请选择车辆照片", trigger: "blur" }]
};

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await Get({ id });
  formData.value = data || {};
  if (formData.value.carImage && formData.value.carImage.length > 0) {
    fileList1.value = formData.value.carImage.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await Update(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await Create(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
};

//文件
// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

const handleError1 = () => {
  uploadRef1.value.clearFiles();
};

//上传文件
async function fileUpload1(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList1.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList1.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove1(action: string) {
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess1 = async _response => {};

const handleExceed1: UploadProps["onExceed"] = _files => {};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  fileList1.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};

//根据司机获取手机号
function driver(val) {
  const staff = CarDriverData.value.find(item => item.value == val);
  console.log("staff", staff);
  formData.value.userMobile = staff.remark;
}

function carFormstatus(val) {
  if (val == "0" || val == "1") {
    formData.value.userId = "";
    formData.value.userMobile = "";
  }
}

//获取车辆状态
async function GetCarStatus() {
  const { data } = await GetCarStatusTypesNV({ includeAll: false });
  CarStatuData.value = data || {};
}

//获取司机列表
async function GetDriver() {
  const { data } = await GetDriverListNV();
  CarDriverData.value = data || {};
  console.log("CarDriverData.value", CarDriverData.value);
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="971"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <div style="margin-right: 10px; margin-left: 10px">
        <div class="header">
          <el-row :gutter="20">
            <el-col :span="8" :offset="0">
              <el-form-item label="车辆名称" prop="carName">
                <el-input
                  v-model="formData.carName"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="车辆品牌" prop="carBrand">
                <el-input
                  v-model="formData.carBrand"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="型号" prop="carType">
                <el-input
                  v-model="formData.carType"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="牌照" prop="carLicensePlate">
                <el-input
                  v-model="formData.carLicensePlate"
                  maxlength="10"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="车辆行驶证编号" prop="carLicenceDocNo">
                <el-input
                  v-model="formData.carLicenceDocNo"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="颜色" prop="carColor">
                <el-input
                  v-model="formData.carColor"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="发证机关" prop="carLicenseUnit">
                <el-input
                  v-model="formData.carLicenseUnit"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="购买日期" prop="carBuyDate">
                <el-date-picker
                  v-model="formData.carBuyDate"
                  :placeholder="type == 'query' ? '' : '请选择'"
                  :disabled="type == 'query'"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="类型" prop="carForm">
                <el-select
                  v-model="formData.carForm"
                  :disabled="type == 'query'"
                  class="w-100/100"
                  :placeholder="type == 'query' ? '' : '请选择'"
                  clearable
                  @change="carFormstatus"
                >
                  <el-option label="专车" :value="1" />
                  <el-option label="公车" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="formData.carForm == '1'" :span="8" :offset="0">
              <el-form-item label="驾驶员" prop="userId">
                <el-select
                  v-model="formData.userId"
                  :disabled="type == 'query'"
                  clearable
                  :placeholder="type == 'query' ? '' : '请选择'"
                  :style="{ width: '200px' }"
                  @change="driver"
                >
                  <el-option
                    v-for="item in CarDriverData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="formData.carForm == '1'" :span="8" :offset="0">
              <el-form-item label="驾驶员手机号" prop="userMobile">
                <el-input
                  v-model="formData.userMobile"
                  type="number"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="车位号" prop="carStall">
                <el-input
                  v-model="formData.carStall"
                  :placeholder="type == 'query' ? '' : '请输入'"
                  :readonly="type == 'query'"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="上次保养时间" prop="carPreMaintainDate">
                <el-date-picker
                  v-model="formData.carPreMaintainDate"
                  disabled
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item
                label="上次保养内容"
                prop="carPreMaintainDateContent"
              >
                <el-input
                  v-model="formData.carPreMaintainDateContent"
                  readonly
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="下次保养时间" prop="carNextMaintainDate">
                <el-date-picker
                  v-model="formData.carNextMaintainDate"
                  disabled
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="投保公司" prop="carInsurance">
                <el-input v-model="formData.carInsurance" readonly />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="投保时间" prop="carInsuranceDate">
                <el-date-picker
                  v-model="formData.carInsuranceDate"
                  disabled
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="上次年检" prop="carPreAnnualSurveyDate">
                <el-date-picker
                  v-model="formData.carPreAnnualSurveyDate"
                  :placeholder="type == 'query' ? '' : '请选择'"
                  :disabled="type == 'query'"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="0">
              <el-form-item label="下次年检" prop="carNextAnnualSurveyDate">
                <el-date-picker
                  v-model="formData.carNextAnnualSurveyDate"
                  :placeholder="type == 'query' ? '' : '请选择'"
                  :disabled="type == 'query'"
                  format="YYYY-MM-DD"
                  style="width: 100%"
                  type="date"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>

            <el-col :span="8" :offset="0">
              <el-form-item label="状态" prop="carStatus">
                <el-select
                  v-model="formData.carStatus"
                  :disabled="type == 'query'"
                  clearable
                  :placeholder="type == 'query' ? '' : '请选择'"
                  :style="{ width: '200px' }"
                >
                  <el-option
                    v-for="item in CarStatuData"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24" :offset="0">
              <el-form-item label="车辆照片" prop="carImage">
                <el-upload
                  ref="uploadRef1"
                  v-model:file-list="fileList1"
                  :disabled="type == 'query'"
                  accept=".jpg,.png"
                  action="carImage"
                  :auto-upload="true"
                  :show-file-list="type == 'add' || type == 'edit'"
                  :http-request="fileUpload1"
                  :on-exceed="handleExceed1"
                  :on-error="handleError1"
                  :on-remove="
                    () => {
                      handleRemove1('carImage');
                    }
                  "
                  :on-success="handleSuccess1"
                >
                  <el-button
                    v-if="type == 'add' || type == 'edit'"
                    type="primary"
                    text
                  >
                    选择文件
                  </el-button>
                  <DownloadButton
                    v-else-if="fileList1.length > 0 && type == 'query'"
                    :showFileName="true"
                    :srcList="fileList1.map(item => item.url)"
                  />
                  <span v-else> 未上传 </span>
                </el-upload>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>

      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
