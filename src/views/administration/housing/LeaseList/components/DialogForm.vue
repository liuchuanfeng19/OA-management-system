<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useNav } from "@/layout/hooks/useNav";
import { ref, computed } from "vue";
import {
  UpdateLease,
  CreateLease,
  GetLease,
  GetFreeRoomListNV,
  GetFreeListNV,
  GetPayMethodNV,
  StopLease
} from "@/api/builds";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { uploadImg } from "@/api/common";
import FileUpload from "@/components/FileUpload";
import { DownloadButton } from "@/components/DownloadButton";
import { isPhone } from "@pureadmin/utils";
import { isIdCard, isTel } from "@/utils/validate";
import { userStaffStoreHook } from "@/store/modules/staff";
import { userCommonStoreHook } from "@/store/modules/common";

const { getStaffListNV } = userStaffStoreHook();
const { getLeaseTypeNVList } = userCommonStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  staffName: "",
  deptId: "",
  deptName: "",
  mobile: "",
  buildsId: "",
  buildsName: "",
  buildsType: 1,
  buildsLeaseType: 1,
  roomId: "",
  roomName: "",
  startTime: "",
  endTime: "",
  leaseType: 1,
  leaseTypeExpr: "",
  addGoods: "",
  renterCount: 1,
  renterMethod: 1,
  renterMethodExpr: "",
  renterAmount: "",
  comment: "",
  ccIds: "",
  idCardFront: [], //身份证正面
  idCardBack: [], //身份证反面
  attach: [], //附件
  idCard: "",
  leaseStatus: "",
  leaseStatusExpr: "",
  stopAmount: "",
  stopTime: "",
  stopComment: ""
};
// 表单校验规则;
const rules = {
  staffId: [{ required: true, message: "请选择租赁人", trigger: "change" }],
  renterCount: [{ required: true, message: "请输入租赁人数", trigger: "blur" }],

  leaseType: [{ required: true, message: "请选择租赁方式", trigger: "blur" }],
  renterMethod: [
    { required: true, message: "请选择付款方式", trigger: "change" }
  ],
  renterAmount: [
    { required: true, message: "请输入租赁金额", trigger: "blur" }
  ],
  mobile: [
    {
      required: true, //编辑的时候为必填
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isPhone(value) && !isTel(value)) {
            callback(new Error("手机号格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入租赁人电话"));
        }
      }
    }
  ],
  buildsId: [{ required: true, message: "请选择房屋名称", trigger: "change" }],
  roomId: [{ required: true, message: "请选择租住房间", trigger: "change" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择到期时间", trigger: "change" }],

  idCard: [
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isIdCard(value)) {
            callback(new Error("身份证格式不正确"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      }
    }
  ]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const formVisible = ref(false);
const formLoading = ref(false);
const fileUploading = ref(false);
const formData = ref({ ...INITIAL_DATA });
const allFreeList = ref([]); //所有空闲房屋
const allFreeRoom = ref([]); //所以空闲房间
const PayMethodType = ref([]); //付款方式
const stauts = ref("");
const type = ref("appl");
const { staffName } = useNav(); //用户名
const ruleFormRef = ref<FormInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const fileList2 = ref<UploadUserFile[]>([]);
const fileList3 = ref<UploadUserFile[]>([]);
const uploadRef1 = ref<UploadInstance>(); //正面
const uploadRef2 = ref<UploadInstance>(); //反面
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { leaseTypeNVList } = storeToRefs(userCommonStoreHook());

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "租赁房屋"
    : type.value == "edit"
      ? "编辑房屋"
      : type.value == "read"
        ? "查看房屋"
        : type.value == "withdrawal"
          ? "退租"
          : // : type.value == "lease"
            // ? "租赁房屋"
            "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载空闲房屋;
  getFreeList();
  //付款方式
  getPayMethod();
  if (leaseTypeNVList.value.length < 1) {
    getLeaseTypeNVList();
  }
  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  formData.value.staffName = staffName;
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
  const { data } = await GetLease({ id });
  formData.value = data || {};
  await getFreeRoomTypes(formData.value.buildsId);
  // getindex();
  if (formData.value.idCardFront && formData.value.idCardFront.length > 0) {
    fileList1.value = formData.value.idCardFront.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  if (formData.value.idCardBack && formData.value.idCardBack.length > 0) {
    fileList2.value = formData.value.idCardBack.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  if (formData.value.attach && formData.value.attach.length > 0) {
    fileList3.value = formData.value.attach.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }

  formLoading.value = false;
}

//获取闲置房屋列表NV
async function getFreeList() {
  const { data } = await GetFreeListNV();
  allFreeList.value = data;
}

//获取闲置房间列表NV
async function getFreeRoomTypes(val) {
  const { data } = await GetFreeRoomListNV({ buildsId: val });
  data.push({
    name: formData.value.roomName,
    value: formData.value.roomId,
    remark: ""
  });
  allFreeRoom.value = data;
}

//获取付款方式NV
async function getPayMethod() {
  const { data } = await GetPayMethodNV();
  PayMethodType.value = data;
}

//根据id获取人员精简信息
// async function getSimpleData(val) {
//   let { data } = await GetSimpleStaff({ staffId: val });
//   if (data) {
//     formData.value.idCard = data.idCard;
//     formData.value.mobile = data.mobile;
//   }
// }

//上传身份证正面
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
  console.log("fileList", fileList1.value);
  formData.value[action] = fileList1.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess1 = async _response => {};

const handleExceed1: UploadProps["onExceed"] = _files => {};

const handleError2 = () => {
  uploadRef2.value.clearFiles();
};

//反面
async function fileUpload2(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList2.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove2(action: string) {
  console.log("fileList", fileList2.value);
  formData.value[action] = fileList2.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess2 = async _response => {};

const handleExceed2: UploadProps["onExceed"] = _files => {};
function handleFileChange({ name }) {
  console.log("name", name);
  ruleFormRef.value.validateField(name, () => null);
}
// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("idCardFront", () => null);
  ruleFormRef.value.validateField("idCardBack", () => null);
  ruleFormRef.value.validateField("attach", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateLease(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      } else {
        const { message, data } = await CreateLease(formData.value);
        if (data) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      }
    }
  });
};

// 退租
const withdrawalForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { message, data } = await StopLease(formData.value);
      if (data) {
        ElMessage.success(message);
        emit("search");
        beforeClose();
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  ruleFormRef.value.resetFields();
  fileList1.value = [];
  fileList2.value = [];
  fileList3.value = [];
};

//对话框关闭前
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="610"
    draggable
    :before-close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="95px"
    >
      <div>
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="租赁人" prop="staffName">
              <el-input
                v-model="formData.staffName"
                :placeholder="type == 'read' ? '' : '请输入'"
                :readonly="type == 'read'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="租赁人电话" prop="mobile">
              <el-input
                v-model="formData.mobile"
                :readonly="type == 'read'"
                :placeholder="type == 'read' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="身份证号" prop="idCard">
              <el-input
                v-model="formData.idCard"
                :readonly="type == 'read'"
                :placeholder="type == 'read' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="租赁方式" prop="leaseType">
              <el-select
                v-model="formData.leaseType"
                :placeholder="type == 'read' ? '' : '请选择'"
                :disabled="type == 'read'"
                :style="{ width: '100%' }"
                ><el-option
                  v-for="item in leaseTypeNVList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="房屋名称" prop="buildsId">
              <el-select
                v-model="formData.buildsId"
                :placeholder="type == 'read' ? '' : '请选择'"
                :disabled="type == 'read'"
                :style="{ width: '100%' }"
                @change="getFreeRoomTypes"
                ><el-option
                  v-for="item in allFreeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="付款方式" prop="renterMethod">
              <el-select
                v-model="formData.renterMethod"
                :disabled="type == 'read'"
                :placeholder="type == 'read' ? '' : '请选择'"
                :style="{ width: '100%' }"
                ><el-option
                  v-for="item in PayMethodType"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="合租人" prop="ccIds">
              <el-select
                v-model="formData.ccIds"
                :disabled="type == 'read'"
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                multiple
                :placeholder="type == 'read' ? '' : '请选择'"
                :style="{ width: '100%' }"
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
            <el-form-item label="租赁金额" prop="renterAmount">
              <el-input
                v-model="formData.renterAmount"
                :placeholder="type == 'read' ? '' : '请输入'"
                type="number"
                :readonly="type == 'read'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                :placeholder="type == 'read' ? '' : '请选择'"
                :disabled="type == 'read'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="到期时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                :placeholder="type == 'read' ? '' : '请选择'"
                :disabled="type == 'read'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="租赁人数" prop="renterCount">
              <el-input
                v-model="formData.renterCount"
                type="number"
                :placeholder="type == 'read' ? '' : '请输入'"
                :readonly="type == 'read'"
                @input="
                  val => {
                    formData.renterCount =
                      val == '' ? 0 : Math.abs(parseInt(val));
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col v-if="type == 'add' || type == 'edit'" :span="12" :offset="0">
            <el-form-item
              v-if="formData.leaseType == 2"
              label="租住房间"
              prop="roomId"
            >
              <el-select
                v-model="formData.roomId"
                placeholder="请选择"
                :style="{ width: '100%' }"
                ><el-option
                  v-for="item in allFreeRoom"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="type == 'read'" :span="12" :offset="0">
            <el-form-item
              v-if="formData.leaseType == 2"
              label="租住房间"
              prop="roomName"
            >
              <el-input v-model="formData.roomName" readonly
            /></el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="身份证正面" prop="idCardFront">
              <el-upload
                ref="uploadRef1"
                v-model:file-list="fileList1"
                :disabled="type == 'read'"
                accept=".jpg"
                action="idCardFront"
                :auto-upload="true"
                :show-file-list="
                  type == 'add' || type == 'edit' || type == 'withdrawal'
                "
                :http-request="fileUpload1"
                :on-exceed="handleExceed1"
                :on-error="handleError1"
                :on-remove="
                  () => {
                    handleRemove1('idCardFront');
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
          <el-col :span="24" :offset="0">
            <el-form-item label="身份证反面" prop="idCardBack">
              <el-upload
                ref="uploadRef2"
                v-model:file-list="fileList2"
                :disabled="type == 'read'"
                accept=".jpg"
                :show-file-list="type == 'add' || type == 'edit'"
                action="idCardBack"
                :auto-upload="true"
                :http-request="fileUpload2"
                :on-exceed="handleExceed2"
                :on-error="handleError2"
                :on-remove="
                  () => {
                    handleRemove2('idCardBack');
                  }
                "
                :on-success="handleSuccess2"
              >
                <el-button
                  v-if="type == 'add' || type == 'edit'"
                  type="primary"
                  text
                >
                  选择图片
                </el-button>
                <DownloadButton
                  v-if="fileList2.length > 0 && type == 'read'"
                  :showFileName="true"
                  :srcList="fileList2.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="附件" prop="attach">
              <FileUpload
                v-model="formData.attach"
                v-model:file-list="fileList3"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
                path="/tyOA/attendance"
                action="attach"
                :limit="0"
                :showType="type"
                fieldName="attach"
                :disabled="fileUploading || type == 'read'"
                :uploading="fileUploading"
                :show-file-list="
                  type == 'add' || type == 'edit' || type == 'withdrawal'
                "
                @change="handleFileChange"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="新增设施" prop="addGoods">
              <el-input
                v-model="formData.addGoods"
                :placeholder="type == 'read' ? '' : '请输入'"
                :readonly="type == 'read'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="comment">
              <el-input
                v-model="formData.comment"
                :placeholder="type == 'read' ? '' : '请输入'"
                :readonly="type == 'read'"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="formData.leaseStatusExpr == '退租'"
            :span="24"
            :offset="0"
          >
            <el-form-item label="退租理由" prop="stopComment">
              <el-input
                v-model="formData.stopComment"
                :placeholder="type == 'read' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button v-if="type == 'read'" @click="beforeClose">关闭</el-button>
      <el-button
        v-if="type == 'edit' || type == 'add' || type == 'withdrawal'"
        @click="beforeClose"
        >取消</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>

      <el-button
        v-if="type == 'withdrawal'"
        type="primary"
        @click="withdrawalForm(ruleFormRef)"
        >退租
      </el-button>
    </template>
  </el-dialog>
</template>
