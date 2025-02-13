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
  GetLease,
  GetFreeRoomListNV,
  GetFreeListNV,
  GetPayMethodNV,
  StopLease,
  GetBuildsLeaseStatusNV
} from "@/api/builds";
import { uploadImg } from "@/api/common";
import { userStaffStoreHook } from "@/store/modules/staff";
import { DownloadButton } from "@/components/DownloadButton";

const { getStaffListNV } = userStaffStoreHook();
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
  idCardFront: [],
  idCardBack: [],
  idCard: "",
  leaseStatus: "",
  leaseStatusExpr: "",
  stopAmount: "",
  stopTime: "",
  stopComment: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const allFreeList = ref([]); //所有空闲房屋
const allFreeRoom = ref([]); //所以空闲房间
const PayMethodType = ref([]); //付款方式
const BuildsLease = ref([]); //租赁状态
const ApproverData = ref([]); //审批人员
const type = ref("appl");
const stauts = ref("");
const fileList1 = ref<UploadUserFile[]>([]);
const fileList2 = ref<UploadUserFile[]>([]);
const uploadRef1 = ref<UploadInstance>(); //正面
const uploadRef2 = ref<UploadInstance>(); //反面
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //租赁状态
  BuildsLeaseStatus();
  //加载空闲房屋;
  getFreeList();
  //加载闲置房间;
  // getFreeRoomTypes();
  //付款方式
  PayMethod();
  getStaffListNV();
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }

  formVisible.value = true;
};
defineExpose({ show });

// 表单校验规则;
const rules = {
  leaseStatus: [
    { required: true, message: "请选择租赁状态", trigger: "change" }
  ],
  stopTime: [{ required: true, message: "请选择退租时间", trigger: "blur" }],
  stopComment: [{ required: true, message: "请输入退租理由", trigger: "blur" }],

  stopAmount: [{ required: true, message: "请输入退租违约金", trigger: "blur" }]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "租赁房屋"
    : type.value == "edit"
      ? "编辑房屋"
      : type.value == "query"
        ? "查看房屋"
        : type.value == "withdrawal"
          ? "退租"
          : "";
});

// 退租
const withdrawalForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { message, data } = await StopLease(formData.value);
      if (data) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  ApproverData.value = [];
  fileList1.value = [];
  fileList2.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  // reloadTimeRange();
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetLease({ id });
  formData.value = data || {};
  if (data) {
    ApproverData.value = data.reviewers;
  }
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
  formLoading.value = false;
}

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

//获取闲置房屋列表NV
async function getFreeList() {
  const { data } = await GetFreeListNV();
  allFreeList.value = data;
}

//获取闲置房间列表NV
async function getFreeRoomTypes(val) {
  const { data } = await GetFreeRoomListNV({ buildsId: val });
  allFreeRoom.value = data;
}

//获取付款方式NV
async function PayMethod() {
  const { data } = await GetPayMethodNV();
  PayMethodType.value = data;
}

//获取所有租赁状态NV
async function BuildsLeaseStatus() {
  const { data } = await GetBuildsLeaseStatusNV();
  BuildsLease.value = data;
}
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="610"
    draggable
    @close="closeDialog"
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
              <el-input v-model="formData.staffName" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="formData.idCard" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="身份证正面" prop="idCardFront">
              <el-upload
                ref="uploadRef1"
                v-model:file-list="fileList1"
                :disabled="type == 'withdrawal'"
                accept=".jpg"
                action="idCardFront"
                :show-file-list="type == 'add' || type == 'edit'"
                :auto-upload="true"
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
                <DownloadButton
                  v-if="fileList1.length > 0 && type == 'withdrawal'"
                  :showFileName="true"
                  :srcList="fileList1.map(item => item.url)"
                />
                <span v-else> 未上传 </span>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="身份证反面" prop="idCardBack">
              <el-upload
                ref="uploadRef2"
                v-model:file-list="fileList2"
                :disabled="type == 'withdrawal'"
                accept=".jpg"
                action="idCardBack"
                :auto-upload="true"
                :show-file-list="type == 'add' || type == 'edit'"
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
                <DownloadButton
                  v-if="fileList2.length > 0 && type == 'withdrawal'"
                  :showFileName="true"
                  :srcList="fileList2.map(item => item.url)"
                />
                <span v-else> 未上传 </span>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="租赁人电话" prop="mobile">
              <el-input v-model="formData.mobile" readonly type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="房屋名称" prop="buildsId">
              <el-select
                v-model="formData.buildsId"
                disabled
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
                disabled
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
                disabled
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                multiple
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
                type="number"
                readonly
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                disabled
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
                disabled
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="租赁人数" prop="renterCount">
              <el-input v-model="formData.renterCount" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item
              v-if="formData.leaseType == 2"
              label="租住房间"
              prop="roomName"
            >
              <el-input v-model="formData.roomName" disabled
            /></el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="新增设施" prop="addGoods">
              <el-input v-model="formData.addGoods" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="备注" prop="comment">
              <el-input
                v-model="formData.comment"
                readonly
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="租赁状态" prop="leaseStatus">
              <el-select
                v-model="formData.leaseStatus"
                placeholder="请选择"
                :style="{ width: '100%' }"
                ><el-option
                  v-for="item in BuildsLease"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="退租违约金" prop="stopAmount">
              <el-input
                v-model="formData.stopAmount"
                type="number"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="退租时间" prop="stopTime">
              <el-date-picker
                v-model="formData.stopTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24" :offset="0">
            <el-form-item label="退租理由" prop="stopComment">
              <el-input v-model="formData.stopComment" placeholder="请输入" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>

      <el-button
        v-if="type == 'withdrawal'"
        type="primary"
        @click="withdrawalForm(ruleFormRef)"
        >退租
      </el-button>
    </template>
  </el-dialog>
</template>
