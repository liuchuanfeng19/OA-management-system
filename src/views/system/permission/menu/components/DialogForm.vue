<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { getMeunTree, getMeunByID, saveMenu } from "@/api/menu";
import { ElMessage, type FormInstance, CascaderOption } from "element-plus";

// 表单模型
const INITIAL_DATA = {
  type: "", //add,addChild,addBrother,edit
  parentId: "", //00000000-0000-0000-0000-000000000000
  menuId: undefined,
  name: "",
  title: "",
  platform: "OAWeb",
  path: "",
  component: "",
  redirect: "",
  icon: "",
  sequence: 1,
  badge: "",
  dot: 0,
  isHiddenNode: false,
  isHiddenMenu: false,
  isFixed: false,
  isKeepAlive: false, //[{ itemName: "query", displayName: "查看" }]
  remarks: ""
};

// 表单校验规则
const rules = {
  name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  title: [{ required: true, message: "请输入菜单标题", trigger: "blur" }],
  path: [
    {
      trigger: "blur",
      validator: (rule, value, callback) => {
        const reg = /^\//;
        if (!value) {
          callback(new Error("请输入路由地址"));
        } else if (!reg.test(value)) {
          callback(new Error("路由地址必须以斜杠/开头"));
        } else {
          callback();
        }
      }
    }
  ]
};

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "title",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 在 <script setup> 中使用 defineProps API 来声明 props

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(INITIAL_DATA);
const formLoading = ref(false);
const cascaderOptions = ref<CascaderOption[]>([]);
const type = ref("add");

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return type.value == "add"
    ? "添加菜单"
    : type.value == "addChild"
      ? "添加子级菜单"
      : type.value == "addBrother"
        ? "添加同级菜单"
        : type.value == "edit"
          ? "编辑菜单"
          : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  await getMenuData();
  if (_formData) {
    type.value = _type;
    await getDetail(_formData.id);
    rebuildCascaderOptions(cascaderOptions.value, false);
  } else {
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formVisible.value = true;
};
defineExpose({ show });

// 搜索获取表格数据
async function getMenuData() {
  const { data } = await getMeunTree();
  cascaderOptions.value = data || [];
}
// 修改表单时根据id获取详情数据
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getMeunByID({ id });
  formData.value = data || {};
  switch (type.value) {
    case "addChild":
      formData.value.parentId = formData.value.menuId;
      delete formData.value.menuId;
      formData.value.name = "";
      formData.value.title = "";
      break;
    case "addBrother":
      delete formData.value.menuId;
      formData.value.name = "";
      formData.value.title = "";
      break;
    case "edit":
      break;
  }
  formLoading.value = false;
}

const rebuildCascaderOptions = (_cascaderOptions, isSelfOrChildren) => {
  _cascaderOptions = _cascaderOptions.map(item => {
    let _isSelfOrChildren = isSelfOrChildren;
    // 修改时父节点不能修改为当前节点
    if (item.id == formData.value.menuId) {
      console.log("禁用的菜单", item.title);
      item.disabled = true;
      _isSelfOrChildren = true;
    } else {
      if (isSelfOrChildren) {
        item.disabled = true;
        _isSelfOrChildren = true;
        console.log("禁用的菜单", item.title);
      } else {
        item.disabled = false;
        _isSelfOrChildren = false;
        console.log("可用的菜单", item.title);
      }
    }
    if (item.children.length > 0) {
      rebuildCascaderOptions(item.children, _isSelfOrChildren);
    }
    return item;
  });
};

// 提交表单
const submitForm = _.debounce((formEl: FormInstance | undefined) => {
  const data = Object.assign({}, formData.value);
  data.parentId = data.parentId ? data.parentId : "";
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      formLoading.value = true;
      const { code, message } = await saveMenu(data);
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
      formLoading.value = false;
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
  formLoading.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="640"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="父级菜单" prop="parentId">
            <el-cascader
              v-model="formData.parentId"
              style="width: 100%"
              :options="cascaderOptions"
              :placeholder="
                type == 'addBrother' || type == 'addChild'
                  ? '顶级菜单'
                  : '请选择'
              "
              clearable
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
              :disabled="type == 'addBrother' || type == 'addChild'"
            >
              <template #default="{ data }">
                <span>{{ data.title }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="菜单名称" prop="name">
            <el-input
              v-model.trim="formData.name"
              placeholder="对应路由name属性"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="菜单标题" prop="title">
            <el-input v-model.trim="formData.title" placeholder="请输入" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="应用系统" prop="platform">
            <el-select v-model="formData.platform" placeholder="请选择">
              <el-option label="业务端" value="OAWeb" />
              <el-option label="管理端" value="bfw" />
              <el-option label="手机端" value="app" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="路由地址" prop="path">
            <el-input
              v-model.trim="formData.path"
              placeholder="对应路由path属性"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="组件路径" prop="component">
            <el-input
              v-model.trim="formData.component"
              placeholder="对应路由component属性"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="重定向" prop="redirect">
            <el-input
              v-model.trim="formData.redirect"
              placeholder="对应路由redirect属性"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="菜单图标" prop="icon">
            <!-- <IconSelect v-model="formData.badge" /> -->
            <el-input v-model.trim="formData.icon" placeholder="请选择">
              <!-- <template #append>
                <el-popover trigger="click" class="w-80" width="400px">
                  <template #reference>
                    <el-button :icon="useRenderIcon('grid')" />
                  </template>
                  <el-row :gutter="20">
                    <el-col
                      v-for="item in 10"
                      :key="item"
                      :span="3"
                      :offset="0"
                    >
                      <div class="el-icon h-9 pt-6">
                        <component :is="useRenderIcon('stamp')" />
                      </div>
                    </el-col>
                  </el-row>
                </el-popover>
              </template> -->
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="菜单徽标">
            <el-input v-model.trim="formData.badge" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="显示顺序">
            <el-input-number
              v-model="formData.sequence"
              :min="1"
              :max="999"
              style="width: 100%"
              :step="1"
              :controls="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="菜单角标">
            <el-input-number
              v-model="formData.dot"
              :min="0"
              :max="99"
              style="width: 100%"
              :step="1"
              :controls="true"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否隐藏节点">
            <el-switch v-model="formData.isHiddenNode" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否隐藏">
            <el-switch v-model="formData.isHiddenMenu" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否固">
            <el-switch v-model="formData.isFixed" />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="是否缓存">
            <el-switch v-model="formData.isKeepAlive" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="formData.remarks"
              type="textarea"
              placeholder="请输入"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="formLoading"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
