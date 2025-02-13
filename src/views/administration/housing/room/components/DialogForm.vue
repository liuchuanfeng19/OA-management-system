<script setup lang="ts">
import { ref, computed } from "vue";
import { GetListNV, CreateRoom, UpdateRoom, GetRoom } from "@/api/builds";
import {
  ElMessage,
  UploadProps,
  FormInstance,
  UploadInstance,
  UploadUserFile
} from "element-plus";
import { uploadImg } from "@/api/common";
import { DownloadButton } from "@/components/DownloadButton";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  buildsId: "",
  buildsName: "",
  name: "",
  area: "",
  direction: "",
  description: "",
  addGoods: "",
  img: [],
  status: 1,
  statusExpr: ""
};
// 表单校验规则;
const rules = {
  buildsId: [{ required: true, message: "请选择房屋", trigger: "change" }],

  name: [{ required: true, message: "请输入房间名称", trigger: "blur" }],
  area: [{ required: true, message: "请输入房间面积", trigger: "blur" }],

  description: [{ required: true, message: "请输入房间描述", trigger: "blur" }],
  img: [{ required: true, message: "请选择房间图片", trigger: "blur" }],

  direction: [{ required: true, message: "请输入房间朝向", trigger: "blur" }]
};
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const formLoading = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList1 = ref<UploadUserFile[]>([]);
const uploadRef1 = ref<UploadInstance>();
const allbuildsTypes = ref([]); //所有房屋列表
const type = ref("add");
const stauts = ref("");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "add"
    ? "添加房间"
    : type.value == "edit"
      ? "编辑房间"
      : type.value == "query"
        ? "查看房间"
        : // : type.value == "lease"
          // ? "租赁房间"
          "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  //加载所有房屋列表;
  getbuildTypes();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
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
  const { data } = await GetRoom({ id });
  formData.value = data || {};
  if (formData.value.img && formData.value.img.length > 0) {
    fileList1.value = formData.value.img.map(item => {
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

//获取所有房屋列表NV
async function getbuildTypes() {
  const { data } = await GetListNV();
  allbuildsTypes.value = data;
}

//上传图片
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
  ruleFormRef.value.validateField("img", () => null);
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        const { message, data } = await UpdateRoom(formData.value);
        if (data) {
          ElMessage.success(message);
          formVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else {
        const { message, data } = await CreateRoom(formData.value);
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
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="630"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="105px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="房屋名称" prop="buildsId">
            <el-select
              v-model="formData.buildsId"
              :placeholder="type == 'query' ? '' : '请选择'"
              :disabled="type == 'query'"
              :style="{ width: '100%' }"
              ><el-option
                v-for="item in allbuildsTypes"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房间名称" prop="name">
            <el-input
              v-model="formData.name"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房间面积(㎡)" prop="area">
            <el-input
              v-model="formData.area"
              type="number"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="房间朝向" prop="direction">
            <el-input
              v-model="formData.direction"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="房间描述" prop="description">
            <el-input
              v-model="formData.description"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query' || type == 'lease'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="新增房间设施" prop="addGoods">
            <el-input
              v-model="formData.addGoods"
              :placeholder="type == 'query' ? '' : '请输入'"
              :readonly="type == 'query'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="房间图片" prop="img">
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
    </el-form>
    <template #footer>
      <el-button v-if="type == 'query'" @click="formVisible = false"
        >关闭</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'edit' || type == 'add'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
