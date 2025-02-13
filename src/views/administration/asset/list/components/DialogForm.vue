<script setup lang="ts">
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ref, computed, reactive } from "vue";

import {
  StoreIn,
  UpdateAsset,
  GetAsset,
  Get1stLevel, //父级
  GetSublevelTree, //子级
  CreateApply,
  GetIsNeedReturnNV
} from "@/api/asset";
import { uploadImg } from "@/api/common";
import { getUserInfo } from "@/api/user";
import { GetSimpleStaff } from "@/api/staff";
import { userStaffStoreHook } from "@/store/modules/staff";
import { DownloadButton } from "@/components/DownloadButton";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "",
  reason: "",
  mobile: "",
  code: "",
  name: "",
  parentCatId: "",
  catId: "",
  catType: "",
  buyTime: "",
  price: "",
  qty: "",
  amount: "",
  applyQty: "",
  usedQty: "",
  dutyStaffId: "",
  dutyStaffName: "",
  storeAddress: "",
  storeInTime: "",
  specExpr: "",
  status: "",
  statusExpr: "",
  img: [],
  userId: "",
  userName: "",
  userDepart: "",
  userTime: "",
  remark: "",
  isNeedReturn: "",
  catName: "",
  brokenComment: "",
  reviewerId: "",
  assetsId: "",
  assetsName: "",
  comment: "",
  applyTime: "",
  applyStatus: "",
  applyStatusExpr: "",
  finalQty: 1,
  applyReason: "",
  ccIds: ""
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const formLoading = ref(false);
const IsNeedReturnTypes = ref([]); //是否需要归还NV
const fileList = ref([]);
const type = ref("add");
const treeData = ref([]);
const parentData = ref([]);
const uploadRef1 = ref<UploadInstance>();
const fileList1 = ref<UploadUserFile[]>([]);
const { staffListNV } = storeToRefs(userStaffStoreHook());

const rules = reactive({
  dutyStaffId: [{ required: true, message: "请选择责任人", trigger: "blur" }],
  catId: [{ required: true, message: "请选择所属类别", trigger: "blur" }],
  buyTime: [{ required: true, message: "请选择购买时间", trigger: "blur" }],
  name: [{ required: true, message: "请输入资产名称", trigger: "blur" }],
  finalQty: [{ required: true, message: "请输入库存", trigger: "blur" }],
  storeInTime: [{ required: true, message: "请选择入库时间", trigger: "blur" }],
  img: [{ required: true, message: "请选择图片", trigger: "blur" }],
  staffId: [{ required: true, message: "请选择申请人", trigger: "blur" }],
  ccIds: [{ required: true, message: "请选择抄送人", trigger: "blur" }],
  parentCatId: [
    { required: true, message: "请选择所属分类", trigger: "change" }
  ],
  code: [{ required: true, message: "请输入资产编号", trigger: "blur" }],
  isNeedReturn: [
    { required: true, message: "请选择是否需要返库", trigger: "blur" }
  ]
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "入库资产"
    : type.value == "edit"
      ? "编辑资产"
      : type.value == "query"
        ? "查看资产"
        : type.value == "apply"
          ? "申请资产"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  parentName();
  //获取是否需要归还NV
  getIsNeedReturnTypes();
  getStaffListNV();
  formVisible.value = true;
  fileList.value = [];
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
  } else {
    type.value = "add";
  }
  getUser();
};
defineExpose({ show });

//获取当前登录人员信息
const getUser = async () => {
  const { data } = await getUserInfo();
  formData.value.staffId = data.staffId;
};

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await GetAsset({ id });
  formData.value = data || {};
  assetsname(formData.value.parentCatId);
  if (formData.value.img && formData.value.img.length > 0) {
    fileList1.value = formData.value.img.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  formLoading.value = false;
}

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  ruleFormRef.value.validateField("img", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateAsset(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await StoreIn(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
    }
  });
}, 300);

//提交申请
const submitApplyForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formData.value.assetsId = formData.value.id;
  formEl.validate(async valid => {
    if (valid) {
      const { message, data } = await CreateApply(formData.value);
      if (data) {
        ElMessage.success(message);
        formVisible.value = false;
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
  fileList1.value = [];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};

// 根据id获取人员详情数据;
async function SimpleStaff(val) {
  formLoading.value = true;
  const { data } = await GetSimpleStaff({ staffId: val });

  formData.value.mobile = data.mobile;
}

//父类别选项接口
async function parentName() {
  const { data } = await Get1stLevel();
  parentData.value = data || [];
}

//子类别选项接口
async function assetsname(val) {
  const { data } = await GetSublevelTree({ id: val });
  treeData.value = data || [];
}

//获取是否需要归还NV
async function getIsNeedReturnTypes() {
  const { data } = await GetIsNeedReturnNV();
  IsNeedReturnTypes.value = data;
}

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
      <div v-if="type == 'add' || type == 'edit' || type == 'query'">
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="资产名称" prop="name">
              <el-input
                v-model="formData.name"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="所属分类" prop="parentCatId">
              <el-select
                v-model="formData.parentCatId"
                :disabled="type == 'query' || type == 'edit'"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请选择'"
                :style="{ width: '100%' }"
                @change="assetsname"
                ><el-option
                  v-for="item in parentData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
              /></el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="所属类别" prop="catId">
              <el-cascader
                v-model="formData.catId"
                :disabled="type == 'query' || type == 'edit'"
                :options="treeData"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请选择'"
                class="w-100/100"
                :props="selProps"
                :show-all-levels="false"
              >
                <template #default="{ data }">
                  <span>{{ data.name }}</span>
                </template>
              </el-cascader>
            </el-form-item>
          </el-col>
          <el-col
            v-if="
              formData.parentCatId != 'f6653514-02a6-4354-8b61-397a7d35e101'
            "
            :span="12"
            :offset="0"
          >
            <el-form-item label="资产编号" prop="code">
              <el-input
                v-model="formData.code"
                :readonly="type == 'query' || type == 'edit'"
                :placeholder="type == 'query' || type == 'edit' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="购买时间" prop="buyTime">
              <el-date-picker
                v-model="formData.buyTime"
                :placeholder="type == 'query' ? '' : '请选择'"
                :disabled="type == 'query'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="库存" prop="finalQty">
              <el-input
                v-model="formData.finalQty"
                style="width: 180px !important"
                type="number"
                :readonly="type == 'query' || type == 'edit'"
                @input="
                  val => {
                    formData.finalQty = val == '' ? 0 : Math.abs(parseInt(val));
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="责任人" prop="dutyStaffId">
              <el-select
                v-model="formData.dutyStaffId"
                filterable
                :disabled="type == 'query'"
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                :placeholder="type == 'query' ? '' : '请选择'"
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
            <el-form-item label="存放地点" prop="storeAddress">
              <el-input
                v-model="formData.storeAddress"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="入库时间" prop="storeInTime">
              <el-date-picker
                v-model="formData.storeInTime"
                :placeholder="type == 'query' ? '' : '请选择'"
                :disabled="type == 'query'"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="type == 'query'" :span="12" :offset="0">
            <el-form-item label="状态" prop="statusExpr">
              <el-input
                v-model="formData.statusExpr"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>

          <el-col
            v-if="type == 'query' && formData.statusExpr == '使用中'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="使用者姓名" prop="userName">
              <el-input
                v-model="formData.userName"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col
            v-if="type == 'query' && formData.status == '使用中'"
            :span="12"
            :offset="0"
          >
            <el-form-item label="使用者部门" prop="userDepart">
              <el-input
                v-model="formData.userDepart"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请输入'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="返库" prop="isNeedReturn">
              <el-select
                v-model="formData.isNeedReturn"
                :disabled="type == 'query'"
                :placeholder="type == 'query' ? '' : '请选择'"
                :style="{ width: '100%' }"
                ><el-option
                  v-for="item in IsNeedReturnTypes"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
              /></el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24" :offset="0">
            <el-form-item label="资产图片" prop="img">
              <el-upload
                ref="uploadRef1"
                v-model:file-list="fileList1"
                :disabled="type == 'query'"
                accept=".jpg"
                action="img"
                :auto-upload="true"
                :show-file-list="type == 'add' || type == 'edit'"
                :http-request="fileUpload1"
                :on-exceed="handleExceed1"
                :on-error="handleError1"
                :on-remove="
                  () => {
                    handleRemove1('img');
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
                  v-if="fileList1.length > 0 && type == 'query'"
                  :showFileName="true"
                  :srcList="fileList1.map(item => item.url)"
                />
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div v-if="type == 'apply'">
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="申请人" prop="staffId">
              <el-select
                v-model="formData.staffId"
                filterable
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                placeholder="请选择"
                :style="{ width: '100%' }"
                @change="SimpleStaff"
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
            <el-form-item label="申请数量" prop="qty">
              <el-input v-model="formData.qty" type="number" />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="申请人电话" prop="mobile">
              <el-input v-model="formData.mobile" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="抄送" prop="ccIds">
              <el-select
                v-model="formData.ccIds"
                filterable
                :collapse-tags="true"
                :collapse-tags-tooltip="true"
                placeholder="请选择"
                :style="{ width: '100%' }"
                multiple
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
          <el-col :span="24" :offset="0">
            <el-form-item label="申请事由" prop="applyReason">
              <el-input
                v-model="formData.applyReason"
                :rows="2"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit' || type == 'apply'"
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
      <el-button
        v-if="type == 'apply'"
        submitApplyForm
        type="primary"
        @click="submitApplyForm(ruleFormRef)"
        >申请</el-button
      >
    </template>
  </el-dialog>
</template>
