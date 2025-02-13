<script setup lang="ts">
import { storeToRefs } from "pinia";
import { FormInstance } from "element-plus";
import { ref, computed } from "vue";

import { useNav } from "@/layout/hooks/useNav";
import { GetAsset, GetTree } from "@/api/asset";
import { userStaffStoreHook } from "@/store/modules/staff";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined,
  code: "",
  name: "",
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
  brokenComment: ""
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
// const emit = defineEmits(["update:visible", "search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const ruleFormRef = ref<FormInstance>();
const formVisible = ref(false);
const formData = ref(null);
const formLoading = ref(false);
const ApproverData = ref([]); //审批人员
const { staffName } = useNav(); //用户名
const treeData = ref([]);
// const indexNumber = ref(0);
const type = ref("add");
// const comment = ref("");
const stauts = ref("");
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  assetsname();
  getStaffListNV();
  if (_formData) {
    type.value = _type;
    stauts.value = _formData.applyStatusExpr;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    type.value = "add";
    formData.value = { ...INITIAL_DATA };
  }
  formData.value.staffName = staffName;
  formVisible.value = true;
};
defineExpose({ show });

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "name",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// 表单校验规则;
const rules = {
  leaveType: [{ required: true, message: "请选择请假类型", trigger: "change" }],

  applyReason: [
    { required: true, message: "请输入申请事由", trigger: "change" }
  ]
};

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  // return formData.value.id ? "修改请假申请" : "请假申请";
  return type.value == "query"
    ? "报废详情"
    : // : type.value == "reject"
      // ? "驳回申请"
      // : type.value == "query"
      // ? "查看详情"
      "";
});

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  ApproverData.value = [];
  // timeRange.value = [];
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
  const { data } = await GetAsset({ id });
  formData.value = data || {};
  if (data) {
    // timeRange.value = [data.startTime, data.endTime];
    ApproverData.value = data.reviewers;
  }
  // getindex();
  formLoading.value = false;
}

//类别选项接口
async function assetsname() {
  const { data } = await GetTree();
  treeData.value = data || [];
}

//初始化时间段
// reloadTimeRange();
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="560"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="70px"
    >
      <div v-if="type == 'add' || type == 'edit' || type == 'query'">
        <el-row :gutter="20">
          <el-col :span="12" :offset="0">
            <el-form-item label="资产名称" prop="name">
              <el-input v-model="formData.name" readonly
            /></el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="所属分类" prop="catId">
              <el-cascader
                v-model="formData.catId"
                readonly
                :options="treeData"
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
          <el-col :span="12" :offset="0">
            <el-form-item label="购买时间" prop="buyTime">
              <el-date-picker
                v-model="formData.buyTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="库存" prop="qty">
              <el-input v-model="formData.qty" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="责任人" prop="dutyStaffId">
              <el-select
                v-model="formData.dutyStaffId"
                readonly
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
              <el-input v-model="formData.storeAddress" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="规格说明" prop="specExpr">
              <el-input v-model="formData.specExpr" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12" :offset="0">
            <el-form-item label="入库时间" prop="storeInTime">
              <el-date-picker
                v-model="formData.storeInTime"
                readonly
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12" :offset="0">
            <el-form-item label="状态" prop="statusExpr">
              <el-input v-model="formData.statusExpr" readonly />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12" :offset="0">
            <el-form-item label="分配时间" prop="userTime">
              <el-date-picker
                :disabled="type == 'query'"
                v-model="formData.userTime"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :style="{ width: '100%' }"
              />
            </el-form-item>
          </el-col> -->
          <!-- <el-col :span="8" :offset="0">
            <el-form-item label="使用者姓名" prop="userName">
              <el-input
                v-model="formData.userName"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col> -->
          <!-- <el-col
            :span="8"
            :offset="0"
            v-if="type == 'query' && formData.status == '使用中'"
          >
            <el-form-item label="使用者部门" prop="userDepart">
              <el-input
                v-model="formData.userDepart"
                :disabled="type == 'query'"
              />
            </el-form-item>
          </el-col> -->
        </el-row>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="formVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>
