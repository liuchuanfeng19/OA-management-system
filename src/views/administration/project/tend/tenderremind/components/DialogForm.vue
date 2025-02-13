<script setup lang="ts">
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadFile,
  UploadInstance,
  UploadFiles,
  UploadProps
} from "element-plus";
import _ from "lodash";
import { storeToRefs } from "pinia";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { ref, computed, shallowRef, watch } from "vue";
import { regionData, CodeToText } from "element-plus-china-area";
import { DownloadButton } from "@/components/DownloadButton";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { useEditorStoreHook } from "@/store/modules/editor";
import { uploadImg } from "@/api/common";
import { useGlobal } from "@pureadmin/utils";
import {
  getBiddingDetail,
  CreateIn,
  updateBidding,
  GetTreeList,
  getBiddingBuyMethod,
  getBiddingNoticeType,
  GetBiddingStatus
} from "@/api/bidding";
import { useDetail } from "../hooks";
import { getUserListByRoleCodeNew } from "@/api/user";

const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  busiStaffList: $config.RoleCodeBusinessAssistant
};

const { toDetail } = useDetail();

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  title1: "", //招标标题
  busiStaffId: "", //商务专员ID
  busiStaffName: "", //商务专员
  unit: "", //招标单位
  buySubjectId: "", //采购主体id
  company: "", //采购主体
  amount: 0, //中标金额
  buyMethod: "", //采购方式
  buyMethodName: "", //采购方式描述
  noticeType: "", //公告类型
  noticeTypeName: "", //公告类型描述
  areaCode: [], //省份地区
  areaName: "", //省份地区描述
  date: "", //报名时间
  startTime: "", //报名开始日期
  endTime: "", //报名截止日期
  attach: [], //招标附件
  richText: "", //富文本
  inStatus: 2, //参与状态
  createTime: "", //创建时间
  inStatusName: "", //参与状态描述
  biddingStatus: 1,
  biddingStatusName: "" //投标状态描述
};
const mode = "default";
const editorConfig = { placeholder: "请输入内容..." };
const toolbarConfig: any = {
  excludeKeys:
    "todo,emotion,insertLink,insertTable,insertVideo,codeBlock,group-image,group-video,divider"
};
// 表单校验规则
const rules = {
  title1: [{ required: true, message: "请输入招标标题", trigger: "blur" }],
  unit: [{ required: true, message: "请输入招标单位", trigger: "blur" }],
  company: [{ required: true, message: "请选择采购主体", trigger: "change" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

const { content } = storeToRefs(useEditorStoreHook());
const { setOpenType, setContent } = useEditorStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const staffList = ref({
  busiStaffList: []
});
const showType = ref("add");
const editorShow = ref(false);
const formLoading = ref(false);
const formVisible = ref(false);
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const ruleFormRef = ref<FormInstance>();
const fileList = ref<UploadUserFile[]>([]);
const formData = ref({ ...INITIAL_DATA });
const uploadRef = ref<UploadInstance>();
const GroupData = ref([]); //采购主体树
const biddingStatusType = ref([]); //投标状态
const buyMethodList = ref([]);
const noticeTypeList = ref([]);
const requesting = ref(false);

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "subjectName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加参与项目"
    : showType.value == "edit"
      ? "编辑参与项目"
      : showType.value == "read"
        ? "查看参与项目"
        : "";
});

watch(content, newVal => {
  formData.value.richText = newVal;
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
  formVisible.value = true;
  showType.value = _type;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.areaCode = [];
  INITIAL_DATA.attach = [];
  if (_formData) {
    await getDetail(_formData.id);
  } else {
    fileList.value = [];
    showType.value = "add";
  }
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getBiddingDetail({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.attach != null && formData.value.attach.length > 0
      ? formData.value.attach.map(item => {
          return {
            name: item.substr(item.lastIndexOf("/") + 1),
            url: item
          };
        })
      : [];
  formLoading.value = false;
}

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};

function handleBusiChange(val) {
  const staff = staffList.value.busiStaffList.find(item => item.staffId == val);
  formData.value.busiStaffName = staff.staffName;
  ruleFormRef.value.validateField("busiStaffId", () => null);
}

function handleEditor() {
  // editorShow.value = true;
  // editorRef.value.fullScreen();
  setOpenType(showType.value);
  setContent(formData.value.richText);
  toDetail(formData.value);
}

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  editorRef.value.on("unFullScreen", () => {
    editorShow.value = false;
  });
};

//采购主体树
async function getTreeList() {
  const { data } = await GetTreeList({});
  GroupData.value = data || [];
}

// 获取采购方式NV列表数据
async function getBuyMethod() {
  const { data } = await getBiddingBuyMethod({});
  buyMethodList.value = data || [];
}
getBuyMethod();

// 获取公告类型NV列表数据
async function getNoticeType() {
  const { data } = await getBiddingNoticeType({});
  noticeTypeList.value = data || [];
}
getNoticeType();

getTreeList();
//省市区三级联动
function handleChange(value) {
  if (value == null || value == "") {
    formData.value.areaCode = [];
    formData.value.areaName = "";
  } else {
    formData.value.areaName = formData.value.areaCode
      .map(item => CodeToText[item])
      .join("");
  }
}
// 获取所有参与状态
async function getBiddingStatus() {
  const { data } = await GetBiddingStatus({});
  biddingStatusType.value = data || [];
}
getBiddingStatus();

// const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
//   if (rawFile.size / 1024 / 1024 > 5) {
//     ElMessage.error("所选文件不能超过5Mb");
//     return false;
//   }
//   return true;
// };

//上传文件
async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action].push(res["data"][0]);
    fileList.value.push({ name: options.file.name, url: res["data"][0] });
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};

const handlePreview: UploadProps["onPreview"] = _file => {};

function handleRemove(
  uploadFile: UploadFile,
  uploadFiles: UploadFiles,
  action: string
) {
  formData.value[action] = uploadFiles.map(item => item.url);
}
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  requesting.value = true;
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { ...params } = formData.value;
      if (showType.value == "add") {
        formData.value.inStatus = 2;
        formData.value.biddingStatus = 1;
        CreateIn({ ...params })
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            requesting.value = false;
          });
      } else {
        updateBidding({ ...params })
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          })
          .finally(() => {
            requesting.value = false;
          });
      }
    } else {
      requesting.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  fileList.value = [];
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
    v-model="formVisible"
    companyDeptId
    :title="dialogTitle"
    :width="640"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="招标标题" prop="title1">
            <el-input
              v-model.trim="formData.title1"
              :readonly="showType == 'read'"
              clearable
              :placeholder="showType == 'read' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="采购主体" prop="buySubjectId">
            <el-cascader
              v-model="formData.buySubjectId"
              :disabled="showType == 'read'"
              :options="GroupData"
              :placeholder="showType == 'read' ? '' : '请选择'"
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.subjectName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="采购方式" prop="buyMethod">
            <el-select
              v-model="formData.buyMethod"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in buyMethodList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="公告类型" prop="noticeType">
            <el-select
              v-model="formData.noticeType"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :style="{ width: '100%' }"
            >
              <el-option
                v-for="item in noticeTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="中标金额" prop="amount">
            <el-input
              v-model="formData.amount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.amount = val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "元" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="省份地区" prop="areaCode">
            <el-cascader
              v-model="formData.areaCode"
              :placeholder="showType == 'read' ? '' : '请选择'"
              :disabled="showType == 'read'"
              :options="regionData"
              :props="{
                checkStrictly: true
              }"
              clearable
              :style="{ width: '100%' }"
              @change="handleChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="报名开始日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="报名截止日期" prop="endTime">
            <el-date-picker
              v-model="formData.endTime"
              :disabled="showType == 'read'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType == 'edit' || showType == 'read'"
          :span="12"
          :offset="0"
        >
          <el-form-item label="投标状态" prop="biddingStatusName">
            <el-input v-model.trim="formData.biddingStatusName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="商务专员" prop="busiStaffId">
            <el-select
              v-model="formData.busiStaffId"
              :disabled="showType == 'read' || showType == 'edit'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 100%"
              filterable
              @change="handleBusiChange"
            >
              <el-option label="无" value="" />
              <el-option
                v-for="item in staffList.busiStaffList"
                :key="item.staffId"
                :label="item.staffName"
                :value="item.staffId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="在线编辑上传" prop="richText">
            <el-button type="primary" text @click="handleEditor">{{
              showType == "read" ? "在线查看" : "在线编辑"
            }}</el-button>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attach">
            <el-upload
              ref="uploadRef"
              :disabled="showType == 'read'"
              accept="*"
              :file-list="fileList"
              :show-file-list="showType != 'read'"
              :auto-upload="true"
              :http-request="fileUpload"
              :multiple="true"
              action="attach"
              :on-preview="handlePreview"
              :on-remove="
                (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
                  handleRemove(uploadFile, uploadFiles, 'attach');
                }
              "
              :on-error="handleError"
              :on-success="handleSuccess"
            >
              <el-button v-if="showType != 'read'" type="primary" text>
                选择文件
              </el-button>
              <DownloadButton
                v-else-if="fileList.length > 0"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-else> 未上传 </span>
            </el-upload>
          </el-form-item>
        </el-col>
        <el-col v-show="editorShow" :span="24" :offset="0">
          <el-card shadow="never" :body-style="{ padding: '0px', zIndex: 999 }">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              v-model="formData.richText"
              style="height: 200px; overflow-y: hidden"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
            />
          </el-card>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        :loading="requesting"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
<style lang="scss">
:deep(.w-e-full-screen-container) {
  z-index: 999 !important;
}
</style>
