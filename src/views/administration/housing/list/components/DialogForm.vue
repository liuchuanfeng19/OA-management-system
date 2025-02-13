<script setup lang="ts">
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import {
  GetBuildsTypeNV,
  Updatebuild,
  Createbuild,
  Getbuilds
} from "@/api/builds";
import { isTel } from "@/utils/validate";
import { uploadImg } from "@/api/common";
import { isPhone } from "@pureadmin/utils";
import { GetSimpleStaff } from "@/api/staff";
import { DownloadButton } from "@/components/DownloadButton";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  name: "",
  description: "",
  address: "",
  area: "",
  addTime: "",
  type: 1,
  dutyStaffId: "",
  dutyStaffName: "",
  dutyStaffMobile: "",
  buildBossId: "",
  bossName: "",
  bossMobile: "",
  amount: "",
  startTime: "",
  endTime: "",
  status: 1,
  statusExpr: "",
  leaseType: "",
  leaseTypeExpr: "",
  roomQty: "",
  usedRoomQty: "",
  buildsImg: [], //房屋图片
  bossIdCardFront: [], //房东身份证正面
  bossIdCardBack: [], //房东身份证反面
  img: [] //合同图片
};
// 表单校验规则;
const rules = ref({
  type: [{ required: true, message: "请选择房屋来源", trigger: "blur" }],

  dutyStaffMobile: [
    {
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
          callback(new Error("请输入经办人电话"));
        }
      }
    }
  ],
  bossMobile: [
    {
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
          callback(new Error("请输入甲方电话"));
        }
      }
    }
  ],

  name: [{ required: true, message: "请输入房屋名称", trigger: "blur" }],
  area: [{ required: true, message: "请输入房屋面积", trigger: "blur" }],
  description: [{ required: true, message: "请输入房屋描述", trigger: "blur" }],

  address: [{ required: true, message: "请输入房屋地址人", trigger: "blur" }],
  dutyStaffId: [
    { required: true, message: "请选择房屋经手人", trigger: "change" }
  ],

  bossName: [{ required: true, message: "请输入甲方姓名", trigger: "blur" }],
  leaseType: [{ required: true, message: "请选择租赁方式", trigger: "blur" }],
  buildsImg: [{ required: true, message: "请选择房屋图片", trigger: "change" }],
  startTime: [{ required: true, message: "请选择起租时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择到期时间", trigger: "change" }],

  img: [{ required: true, message: "请上传房屋租赁合同", trigger: "change" }],
  amount: [{ required: true, message: "请输入租赁金额", trigger: "blur" }]
});

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formVisible = ref(false);
const formLoading = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const allBuildsTypes = ref([]); //房屋来源
const stauts = ref("");
const type = ref("add");
const uploadRef1 = ref<UploadInstance>(); //buildsImg
const fileList1 = ref<UploadUserFile[]>([]); //buildsImg
const { staffListNV } = storeToRefs(userStaffStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "添加房屋"
    : type.value == "edit"
      ? "编辑房屋"
      : type.value == "read"
        ? "查看房屋"
        : // : type.value == "lease"
          // ? "租赁房屋"
          "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  getStaffListNV();
  //加载房屋来源;
  getBuildsTypes();
  formData.value = { ...INITIAL_DATA };
  formVisible.value = true;
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await Getbuilds({ id });
  formData.value = data || {};
  if (formData.value.buildsImg && formData.value.buildsImg.length > 0) {
    fileList1.value = formData.value.buildsImg.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
    console.log(
      " fileList1.value.url",
      fileList1.value.map(item => item.url)
    );
  }

  formLoading.value = false;
}

//根据id获取人员精简信息
async function getSimpleData(val) {
  const { data } = await GetSimpleStaff({ staffId: val });
  if (data) {
    formData.value.dutyStaffMobile = data.mobile;
  }
}

//获取房屋来源
async function getBuildsTypes() {
  const { data } = await GetBuildsTypeNV();
  allBuildsTypes.value = data;
}

//上传房屋图片
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

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await Updatebuild(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        const { message, data } = await Createbuild(formData.value);
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
  ruleFormRef.value.resetFields();
  fileList1.value = [];
  // fileList2.value = [];
  // fileList3.value = [];
  // fileList4.value = [];
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="660"
    draggable
    @close="beforeClose()"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="房屋名称" prop="name">
            <el-input
              v-model="formData.name"
              :readonly="type == 'read'"
              :placeholder="type == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房屋来源" prop="type">
            <el-select
              v-model="formData.type"
              :style="{ width: '100%' }"
              :placeholder="type == 'read' ? '' : '请选择'"
              :disabled="type == 'read' || type == 'edit'"
              ><el-option
                v-for="item in allBuildsTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房屋面积(㎡)" prop="area">
            <el-input
              v-model="formData.area"
              :placeholder="type == 'read' ? '' : '请输入'"
              :readonly="type == 'read'"
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type == 2" :span="12" :offset="0">
          <el-form-item label="租赁金额" prop="amount">
            <el-input
              v-model="formData.amount"
              :placeholder="type == 'read' ? '' : '请输入'"
              :readonly="type == 'read'"
              type="number"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="房屋描述" prop="description">
            <el-input
              v-model="formData.description"
              placeholder="(几室几厅等)"
              :readonly="type == 'read'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="房屋地址" prop="address">
            <el-input
              v-model="formData.address"
              :placeholder="type == 'read' ? '' : '请输入'"
              :readonly="type == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房屋经办人" prop="dutyStaffId">
            <el-select
              v-model="formData.dutyStaffId"
              filterable
              :placeholder="type == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
              :disabled="type == 'read'"
              @change="getSimpleData"
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="经办人电话" prop="dutyStaffMobile">
            <el-input
              v-model="formData.dutyStaffMobile"
              :placeholder="type == 'read' ? '' : '请输入'"
              type="number"
              :readonly="type == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type == 2" :span="12" :offset="0">
          <el-form-item label="甲方姓名" prop="bossName">
            <el-input
              v-model="formData.bossName"
              :placeholder="type == 'read' ? '' : '请输入'"
              :readonly="type == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type == 2" :span="12" :offset="0">
          <el-form-item label="甲方电话" prop="bossMobile">
            <el-input
              v-model="formData.bossMobile"
              :placeholder="type == 'read' ? '' : '请输入'"
              type="number"
              :readonly="type == 'read'"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type == 2" :span="12" :offset="0">
          <el-form-item label="起租时间" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              :disabled="type == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col v-if="formData.type == 2" :span="12" :offset="0">
          <el-form-item label="到期时间" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              :disabled="type == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="房屋图片" prop="buildsImg">
            <el-upload
              ref="uploadRef1"
              v-model:file-list="fileList1"
              :disabled="type == 'read'"
              accept=".jpg"
              action="buildsImg"
              :auto-upload="true"
              :show-file-list="type == 'add' || type == 'edit'"
              :http-request="fileUpload1"
              :on-exceed="handleExceed1"
              :on-error="handleError1"
              :on-remove="
                () => {
                  handleRemove1('buildsImg');
                }
              "
              :on-success="handleSuccess1"
            >
              <el-button
                v-if="type == 'add' || type == 'edit'"
                type="primary"
                text
              >
                选择图片
              </el-button>
              <DownloadButton
                v-if="fileList1.length > 0 && type == 'read'"
                :showFileName="true"
                :srcList="fileList1.map(item => item.url)"
              />
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'read'" @click="formVisible = false"
        >关闭</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add' || type == 'lease'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
      <!-- <el-button
        disabled
        v-if="type == 'lease'"
        type="success"
        @click="submitForm(ruleFormRef)"
        >租赁</el-button
      > -->
    </template>
  </el-dialog>
</template>
