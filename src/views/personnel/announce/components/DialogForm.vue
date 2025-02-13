<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed, shallowRef } from "vue";
// import { saveRole } from "@/api/role";
import {
  getNoticeSender,
  createNoticeSender,
  updateNoticeSender
} from "@/api/noticeSender";
import {
  ElMessage,
  FormInstance,
  UploadUserFile,
  UploadRawFile,
  UploadInstance,
  genFileId,
  UploadProps
} from "element-plus";
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { DownloadButton } from "@/components/DownloadButton";
import { uploadImg } from "@/api/common";
import { emitter } from "@/utils/mitt";
import { userDepartmentStoreHook } from "@/store/modules/department";

const { getDepartmentTree } = userDepartmentStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  sendStaffId: "", //发送人id
  sendStaffName: "", //发送人
  sendCompanyId: "", //发送公司id
  sendCompanyName: "",
  sendDeptId: "", //发送部门id
  sendDeptName: "",
  title1: "", //标题
  content: "", //内容
  recvDeptIds: "", //接受部门id（逗号分隔）
  recvDeptNames: "", //接收部门名称
  attachment: "", //附件
  isSend: true, //是否发送
  isSendName: "", //是否发送描述
  publishTime: "", //发布时间（只读）
  createTime: "", //创建时间
  canEdit: "" //能否编辑
};

// 表单校验规则
const rules = {
  companyName: [{ required: true, message: "请输入公司名称", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formLoading = ref(false);
const formVisible = ref(false);
const formData = ref(null);
const type = ref("add");
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();
const mode = "default";
const editorConfig = { placeholder: "请输入内容..." };
const toolbarConfig: any = {
  excludeKeys:
    "todo,emotion,insertLink,insertTable,insertVideo,codeBlock,group-image,group-video,divider"
};
const fileList = ref<UploadUserFile[]>([]);
const uploadRef = ref<UploadInstance>();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: true,
  emitPath: false,
  value: "id",
  checkStrictly: false
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加"
    : type.value == "edit"
      ? "编辑"
      : type.value == "query"
        ? "查看"
        : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
    emit("search");
  } else {
    type.value = "add";
  }
  formVisible.value = true;
};
defineExpose({ show });

// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getNoticeSender({ id });
  formData.value = data || {};
  fileList.value =
    formData.value.attachment != null && formData.value.attachment != ""
      ? [
          {
            name: formData.value.attachment.substr(
              formData.value.attachment.lastIndexOf("/") + 1
            ),
            url: formData.value.attachment
          }
        ]
      : [];
  formLoading.value = false;
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (type.value == "add") {
        formData.value.isSend = flag;
        const { code, message } = await createNoticeSender(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
        emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
      } else {
        formData.value.isSend = flag;
        const { code, message } = await updateNoticeSender(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
        emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
      }
    }
  });
};

//编辑器
// function handleEditor() {
//   editorShow.value = true;
//   editorRef.value.fullScreen();
// }

const handleCreated = editor => {
  editorRef.value = editor; // 记录 editor 实例，重要！
  editorRef.value.on("unFullScreen", () => {
    console.log("unFullScreen");
  });
};

//上传文件

const handleBeforeUpload: UploadProps["beforeUpload"] = rawFile => {
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error("所选文件不能超过5Mb");
    return false;
  }
  return true;
};

async function fileUpload(options) {
  const path = "/tyOA/Qualification";
  const param = { path: path, file: options.file };
  uploadImg(param).then(res => {
    formData.value[options.action] = res["data"][0];
    // formData.value.attach.unshift(res["data"][0]);
    fileList.value = [{ name: options.file.name, url: res["data"][0] }];
    ruleFormRef.value.validateField(options.action, () => null);
  });
}

const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async _response => {
  uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};
function handleRemove(action: string) {
  formData.value[action] = "";
}

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
    :title="dialogTitle"
    :width="720"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="78px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="标题" prop="title1">
            <el-input
              v-model="formData.title1"
              :readonly="type == 'query'"
              :placeholder="type == 'query' ? '' : '请输入'"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="内容" prop="content">
            <el-card
              shadow="never"
              :body-style="{ padding: '0px', zIndex: 999 }"
            >
              <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                v-model="formData.content"
                :disabled="type == 'query'"
                style="height: 200px; overflow-y: hidden"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </el-card>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="附件" prop="attachment">
            <el-upload
              ref="uploadRef"
              :disabled="type == 'query'"
              accept=".doc,.docx,.pdf,.xls,.xlsx,.jpg"
              action="attachment"
              :auto-upload="true"
              :file-list="fileList"
              :show-file-list="type != 'query'"
              :limit="1"
              :before-upload="handleBeforeUpload"
              :http-request="fileUpload"
              :on-exceed="handleExceed"
              :on-error="handleError"
              :on-remove="
                () => {
                  handleRemove('attachment');
                }
              "
              :on-success="handleSuccess"
            >
              <el-button
                v-if="type == 'edit' || type == 'add'"
                type="primary"
                text
              >
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

        <el-col :span="24" :offset="0">
          <el-form-item label="通知部门" prop="recvDeptIds">
            <el-cascader
              v-model="formData.recvDeptIds"
              :options="departmentTree"
              :placeholder="type == 'query' ? '' : '请选择'"
              class="w-100/100"
              :collapse="true"
              :props="selProps"
              :show-all-levels="false"
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :disabled="type == 'query'"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col v-show="type == 'query'" :span="24" :offset="0">
          <el-form-item label="创建时间" prop="createTime">
            <el-input v-model="formData.createTime" readonly />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="primary"
        @click="submitForm(ruleFormRef, true)"
        >发布</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        type="success"
        @click="submitForm(ruleFormRef, false)"
        >暂存</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
    </template>
  </el-dialog>
</template>
