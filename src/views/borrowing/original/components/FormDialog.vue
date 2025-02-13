<script setup lang="ts">
import _ from "lodash";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";
import { useNav } from "@/layout/hooks/useNav";
import { ElMessage, FormInstance } from "element-plus";

import {
  getProjDocLend,
  updateProjDocLend,
  createProjDocLend,
  cancelProjDocLend,
  approveProjDocLend,
  GetDocNV,
  DoReturn
} from "@/api/projDocLend";
import { emitter } from "@/utils/mitt";
import AuditForm from "@/components/AuditForm";
import AuditSteps from "@/components/AuditSteps";
import { userStaffStoreHook } from "@/store/modules/staff";
import { userProjectStoreHook } from "@/store/modules/project";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDescriptions from "@/components/ReadDescriptions";
import { columns } from "../constant";

const { getStaffListNV } = userStaffStoreHook();
enum AuditResult {
  agree,
  refuse,
  back
}
const { getProjectWinBidNVList } = userProjectStoreHook();
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["update:visible", "search"]);
const { getDepartmentTree } = userDepartmentStoreHook();

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  staffId: "", //申请人ID
  staffName: "", //申请人姓名
  deptName: "", //部门名称
  mobile: "", //电话
  applyReason: "", //申请理由
  cancelReason: "", //取消理由
  applyTime: "", //申请时间
  applyStatus: "", //申请状态
  applyStatusExpr: "", //申请状态描述
  canTemp: false, //是否可以暂存
  canApprove: false, //是否可以审核
  canReject: false, //是否可以驳回（驳回之后流程结束）
  canCancel: false, //是否可以取消（针对发起人）
  doTemp: false, //是否暂存
  canReturnBack: false, //是否可以退回（由审批人退回）（退回后仍然可以继续提交申请）
  projectId: "", //项目ID
  projectFullName: "", //项目全称
  projectShortName: "", //项目简称
  name: "", //资料名称
  useDeptId: "", //使用部门ID
  useDeptName: "", //使用部门
  lendTime: "", //借阅日期
  lendMethod: "", //借阅方式
  lendCount: 1, //份数
  attach: [], //附件
  remark: "",
  comment1: "",
  docId: [], //借阅资料
  ccIds: [], //抄送人
  preReturnTime: "",
  returnTime: "",
  purpose: "" //用途
};
//el-cascader props属性值
// const docProps = {
//   children: "children",
//   label: "name",
//   value: "value",
//   multiple: true
// };
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};
const fromRules = {
  applyReason: [{ required: true, message: "请输入申请事由", trigger: "blur" }],
  docId: [{ required: true, message: "请选择资料", trigger: "change" }],
  projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
  name: [{ required: true, message: "请输入资料名称", trigger: "change" }],
  lendTime: [{ required: true, message: "请选择借阅日期", trigger: "change" }],
  lendCount: [{ required: true, message: "请输入份数", trigger: "change" }],
  useDeptId: [{ required: true, message: "请选择使用部门", trigger: "change" }],
  returnTime: [
    { required: true, message: "请选择实际归还日期", trigger: "change" }
  ],
  preReturnTime: [
    { required: true, message: "请选择预计归还日期", trigger: "change" }
  ],
  comment1: [{ required: true, message: "请输入审批意见", trigger: "blur" }]
};
const validateAuditForm = (rule: any, value: any, callback: any) => {
  if (!value && auditResult.value != AuditResult.agree) {
    return callback(new Error("审核意见不能为空"));
  } else {
    callback();
  }
};

//审核表单验证规则
const auditFormRules = {
  comment1: [
    {
      message: "审核意见不能为空",
      validator: validateAuditForm
    }
  ]
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const auditData = ref({
  id: undefined,
  isApproved: false,
  comment1: "",
  isReturnBack: false
});
const stauts = ref("");
const docList = ref([]); //资料列表
const docPList = ref([]); //资料父级
const docPId = ref("");
const docSList = ref([]); //资料子级
// const docTreeRef = ref(null);
// const docCurParent = ref("");
const canTemp1 = ref("");
const reviewers = ref([]); //审批人员
const formData = ref(null);
const showType = ref("add");
const formVisible = ref(false);
const formLoading = ref(false);
const { staffName } = useNav(); //用户名
const activeName = ref("baseInfo");
const auditResult = ref<AuditResult>(); //审批结果
const ruleFormRef = ref<FormInstance>();
const canceFormRef = ref<FormInstance>();
const auditFormRef = ref<FormInstance>();
const { staffListNV } = storeToRefs(userStaffStoreHook());
const { departmentTree } = storeToRefs(userDepartmentStoreHook());
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const tableColumnData = ref([]);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加原件借阅"
    : showType.value == "edit"
      ? "编辑原件借阅"
      : showType.value == "draft"
        ? "编辑原件借阅"
        : showType.value == "read"
          ? "查看原件借阅"
          : showType.value == "querydraft"
            ? "查看原件借阅"
            : showType.value == "audit"
              ? "审批原件借阅"
              : showType.value == "undo"
                ? "撤回原件借阅"
                : showType.value == "undodraft"
                  ? "撤回原件借阅"
                  : showType.value == "return"
                    ? "归还原件"
                    : "";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  await getDocList();
  getProjectWinBidNVList();
  getStaffListNV();
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  activeName.value = "baseInfo";
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];
  if (_formData) {
    showType.value = _type;
    stauts.value = _formData.applyStatusExpr;
    docPId.value = _formData.docTypeName;
    await getDetail(_formData.id);
  } else {
    // fileList.value = [];
    showType.value = "add";
    formData.value.staffName = staffName;
  }
};
defineExpose({ show });

// function handleNodeClick(val, node, tnode, event) {
//   console.log("val---->", val);
//   console.log("node---->", node);
//   console.log("tnode---->", tnode);
//   console.log("event---->", event);
//   console.log("docid---->", formData.value.docId);
//   const nodes = docTreeRef.value.getCheckedNodes();
//   console.log("nodes---->", nodes);

// if (node.data.value != "") {
//   //点击的子节点
//   if (docCurParent.value == "") {
//     docCurParent.value = node.parent.data.name;
//   } else {
//     if (docCurParent.value != node.parent.data.name) {
//       formData.value.docId = [];
//       docTreeRef.value.setCheckedNodes([]);
//     }
//   }
// } else {
//   //点击的父节点
//   docTreeRef.value.setCheckedNodes([]);
//   if (node.checked && docCurParent.value != node.parent.data.name) {
//     const values = [];
//     node.childNodes.forEach(item => {
//       values.push(item.value);
//     });
//     docTreeRef.value.setCheckedNodes(values);
//     docCurParent.value = node.data.name;
//   }
// }
// }

// 提交表单
const submitForm = _.debounce(
  async (formEl: FormInstance | undefined, flag: boolean) => {
    if (!formEl) return;
    formEl.validate(async valid => {
      if (valid) {
        if (formData.value.id) {
          formData.value.doTemp = flag;
          updateProjDocLend(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        } else {
          formData.value.doTemp = flag;
          createProjDocLend(formData.value).then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
            }
          });
        }
      }
    });
  },
  300
);

// 提交审核表单
const submitAuditForm = _.debounce(
  async (formEl: FormInstance | undefined, _auditResult: AuditResult) => {
    if (!formEl) return;
    auditResult.value = _auditResult;
    formEl.validate(async valid => {
      if (valid) {
        formLoading.value = true;
        approveProjDocLend({
          id: formData.value.id,
          isApproved:
            _auditResult == AuditResult.agree
              ? true
              : _auditResult == AuditResult.refuse
                ? false
                : false,
          isReturnBack: _auditResult == AuditResult.back ? true : false,
          comment1: auditData.value.comment1
        })
          .then(({ code, message }) => {
            if (code == 0) {
              ElMessage.success(message);
              formVisible.value = false;
              resetForm(formEl);
              emit("search");
              emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
            }
          })
          .catch()
          .finally(() => {
            formLoading.value = false;
          });
      }
    });
  },
  300
);

// 提交撤回表单
const submitFormQuery = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await cancelProjDocLend({
        id: formData.value.id,
        cancelReason: formData.value.cancelReason
      });
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

// 归还原件
const submitFormReturn = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      const { code, message } = await DoReturn({
        id: formData.value.id,
        returnTime: formData.value.returnTime
      });
      if (code == 0) {
        ElMessage.success(message);
        formVisible.value = false;
        resetForm(formEl);
        emit("search");
      }
    }
  });
};

//获取借阅资料列表
async function getDocList() {
  const { data } = await GetDocNV();
  docList.value = data || [];
  docList.value.forEach(item => {
    docPList.value.push(item);
  });
}

function handleDocPChange(val) {
  docSList.value = [];
  formData.value.docId = [];
  docList.value.forEach(item => {
    if (val == item.name) {
      docSList.value = item.children || [];
    }
  });
}

//选择中标项目之后关联数据
function handleProjectChange(val) {
  const project = winBidProjectNVList.value.find(item => item.value == val);
  formData.value.projectFullName = project.name;
}

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getProjDocLend({ id });
  formData.value = data || {};
  tableColumnData.value = columns.filter(item => item.isFormItem);
  tableColumnData.value.forEach(item => {
    item.value = formData.value[item.prop];
  });
  if (data) {
    reviewers.value = data.reviewers || [];
    canTemp1.value = data.canTemp;
  }
  formLoading.value = false;
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  formData.value.docId = [];
  docPList.value = [];
  docSList.value = [];
  docPId.value = "";
  reviewers.value = [];
  //timeRange.value = [null, null];
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
  activeName.value = "baseInfo";
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="824"
    :class="showType == 'add' || showType == 'edit' ? '' : 'auditDialog'"
    draggable
    @close="closeDialog"
  >
    <AuditSteps
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      :reviewers="reviewers"
      :marginWidth="15"
    />
    <el-tabs
      v-if="showType == 'read' || showType == 'undo' || showType == 'audit'"
      v-model="activeName"
      type="card"
      tab-position="top"
    >
      <el-tab-pane label="基础信息" name="baseInfo" />
      <el-tab-pane label="审核信息" name="auditInfo" />
    </el-tabs>
    <!-- 表单内容 -->
    <ReadDescriptions
      v-if="showType == 'audit' || showType == 'read' || showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      title=""
      :columnData="tableColumnData"
      :rowData="formData"
      :column="2"
      class="mb-2"
    />
    <el-form
      v-else
      v-show="activeName == 'baseInfo'"
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              @change="handleProjectChange"
              ><el-option
                v-for="item in winBidProjectNVList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select>
          </el-form-item>
        </el-col>

        <el-col :span="24" :offset="0">
          <el-form-item label="资料名称" prop="docId">
            <div class="flex">
              <!-- <el-tree-select
              ref="docTreeRef"
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              v-model="formData.docId"
              :data="docList"
              multiple
              :multiple-limit="1"
              collapse-tags
              collapse-tags-tooltip
              :render-after-expand="false"
              check-on-click-node
              show-checkbox
              :props="docProps"
              node-key="value"
              @node-click="handleNodeClick"
            /> -->
              <el-select
                v-model="docPId"
                :disabled="
                  showType == 'return' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
                placeholder="类型"
                style="width: 100px"
                @change="handleDocPChange"
              >
                <el-option
                  v-for="item in docPList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
              <el-select
                v-model="formData.docId"
                :disabled="
                  showType == 'return' ||
                  showType == 'audit' ||
                  showType == 'read' ||
                  showType == 'undo' ||
                  showType == 'querydraft' ||
                  showType == 'undodraft'
                "
                :collapse-tags="true"
                :max-collapse-tags="5"
                :collapse-tags-tooltip="true"
                multiple
                filterable
                placeholder="资料名称"
                style="width: 100%; margin-left: 10px"
              >
                <el-option
                  v-for="item in docSList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                />
              </el-select>
              <!-- <el-cascader
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              v-model="formData.docId"
              :options="docList"
              placeholder="请选择"
              class="w-100/100"
              :props="docProps"
              collapse-tags
              collapse-tags-tooltip
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.name }}</span>
              </template>
            </el-cascader> -->
              <!-- <el-select
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              multiple
              filterable
              :disabled="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              v-model="formData.docId"
              placeholder="请选择"
              ><el-option
                v-for="item in docList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
            /></el-select> -->
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="使用部门" prop="useDeptId">
            <el-cascader
              v-model="formData.useDeptId"
              :disabled="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :options="departmentTree"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              class="w-100/100"
              :props="selProps"
              :show-all-levels="false"
            >
              <template #default="{ data }">
                <span>{{ data.fullName }}</span>
              </template>
            </el-cascader>
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="借阅日期" prop="lendTime">
            <el-date-picker
              v-model="formData.lendTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="预计归还日期" prop="preReturnTime">
            <el-date-picker
              v-model="formData.preReturnTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
            />
          </el-form-item>
        </el-col>
        <el-col v-if="showType == 'return'" :span="12" :offset="0">
          <el-form-item label="实际归还日期" prop="returnTime">
            <el-date-picker
              v-model="formData.returnTime"
              :style="{ width: '100%' }"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="用途" prop="purpose">
            <el-input
              v-model="formData.purpose"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="借阅方式" prop="lendMethod">
            <el-input
              v-model="formData.lendMethod"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>

        <el-col :span="12" :offset="0">
          <el-form-item label="份数" prop="lendCount">
            <el-input
              v-model="formData.lendCount"
              type="number"
              :readonly="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              @input="
                val => {
                  formData.lendCount = val == '' ? 0 : Math.abs(parseInt(val));
                }
              "
            >
              <template #suffix>
                <p>{{ "份" }}</p>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="抄送" prop="ccIds">
            <el-select
              v-model="formData.ccIds"
              :disabled="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
              :collapse-tags="true"
              :collapse-tags-tooltip="true"
              :style="{ width: '100%' }"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请选择'
              "
              multiple
              filterable
              :reserve-keyword="true"
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
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'return' ||
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              type="textarea"
              :placeholder="
                showType == 'audit' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
                  ? ''
                  : '请输入'
              "
              :readonly="
                showType == 'audit' ||
                showType == 'return' ||
                showType == 'read' ||
                showType == 'undo' ||
                showType == 'querydraft' ||
                showType == 'undodraft'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' ||
              (stauts == '已撤销' && showType == 'read') ||
              showType == 'undodraft'
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :disabled="showType == 'read'"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-form
      v-if="showType == 'undo'"
      v-show="activeName == 'baseInfo'"
      ref="canceFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="68px"
    >
      <el-row :gutter="20">
        <el-col :span="24" :offset="0">
          <el-form-item
            v-if="
              showType == 'undo' || (stauts == '已撤销' && showType == 'read')
            "
            label="撤回理由"
            prop="cancelReason"
          >
            <el-input
              v-model="formData.cancelReason"
              :rows="2"
              placeholder="请输入"
              type="textarea"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <AuditForm
      v-if="
        (showType == 'read' || showType == 'undo' || showType == 'audit') &&
        activeName == 'auditInfo'
      "
      :showType="showType"
      :reviewers="reviewers"
    />
    <el-form
      v-if="showType == 'audit'"
      ref="auditFormRef"
      class="audit-form"
      :class="{ 'mt-4': activeName == 'baseInfo' }"
      :model="auditData"
      :rules="auditFormRules"
      :inline="false"
      :label-width="activeName == 'auditInfo' ? '92px' : '110px'"
    >
      <el-form-item label="审核意见" prop="comment1">
        <el-input
          v-model.trim="auditData.comment1"
          type="textarea"
          :rows="2"
          show-word-limit
          :maxlength="255"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="formVisible = false">
        {{ showType == "read" || showType == "querydraft" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="
          showType == 'add' ||
          (canTemp1 && showType == 'edit') ||
          showType == 'draft'
        "
        type="success"
        @click="submitForm(ruleFormRef, true)"
        >暂存
      </el-button>
      <el-button
        v-if="showType == 'add' || showType == 'edit' || showType == 'draft'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >提交
      </el-button>
      <el-button
        v-if="showType == 'undo' || showType == 'undodraft'"
        @click="submitFormQuery(canceFormRef)"
        >提交</el-button
      >
      <el-button
        v-if="showType == 'audit'"
        type="primary"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.agree)"
        >同意
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="danger"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.refuse)"
        >拒绝
      </el-button>
      <el-button
        v-if="showType == 'audit'"
        type="success"
        :loading="formLoading"
        @click="submitAuditForm(auditFormRef, AuditResult.back)"
        >退回</el-button
      >
      <el-button
        v-if="showType == 'return'"
        type="primary"
        :loading="formLoading"
        @click="submitFormReturn(ruleFormRef)"
        >归还</el-button
      >
    </template>
  </el-dialog>
</template>
