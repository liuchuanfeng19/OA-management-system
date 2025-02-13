<script setup lang="ts">
import _ from "lodash";
import { ref, computed, watch } from "vue";
import { createProjectBudget, updateProjectBudget } from "@/api/projectBudget";
import { ElMessage, type FormInstance } from "element-plus";
// import { getSellContractListNVByProjectId } from "@/api/projectAccount";

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  projectId: "", //项目ID
  projectFullName: "", //项目名称
  sellContractId: "", //合同编号ID
  sellSecondCodes: "", //合同编号
  projectShortName: "", //立项名称
  projectNature: "", //项目性质
  projectNatureName: "", //项目性质描述
  budgetAmount: 0, //项目概算
  totalAmount: 0, //往来款合计
  mainContractAmount: 0, //主合同金额
  recvAmount: 0, //收款金额合计
  subContractAmount: 0, //补充合同金额
  payAmount: 0, //付款金额合计
  contractTotal: 0, //合同金额合计
  balance: 0, //余额
  projectProfit: 0, //项目利润
  projectProfitPercent: "", //项目利润率
  deviceFee: 0, //预算费用明细-设备费
  constructFee: 0, //预算费用明细-施工费
  materialFee: 0, //预算费用明细-材料费
  techFee: 0, //预算费用明细-技术服务费
  projectTax: 0, //预算费用明细-工程项目税金
  printTax: 0, //预算费用明细-印花税金
  curculationTax: 0, //预算费用明细-流转税金
  manageFee: 0, //预算费用明细-管理费
  otherFee: 0, //预算费用明细-其它
  totalFee: 0, //预算费用明细-合计
  realDeviceFee: 0, //实际发生费用明细-设备费
  realConstructFee: 0, //实际发生费用明细-施工费
  realMaterialFee: 0, //实际发生费用明细-材料费
  realTechFee: 0, //实际发生费用明细-技术服务费
  realProjectTax: 0, //实际发生费用明细-工程项目税金
  realPrintTax: 0, //实际发生费用明细-印花税金
  realCurculationTax: 0, //实际发生费用明细-流转税金
  realManageFee: 0, //实际发生费用明细-管理费
  realOtherFee: 0, //实际发生费用明细-其它
  realTotalFee: 0 //实际发生费用明细-合计
};

// 表单校验规则
const fromRules = {
  projectId: [{ required: true, message: "请选择项目", trigger: "blur" }],
  sellContractId: [{ required: true, message: "请选择合同", trigger: "blur" }]
  // projectShortName: [{ required: true, message: "请输入立项名称", trigger: "blur" }]
};

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const props = defineProps({
  projectList: [],
  projectNatureList: []
});
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法

const formData = ref({ ...INITIAL_DATA });
const showType = ref("add");
// const sellContractList = ref([]); //合同列表
const dialogVisible = ref(false);
const collapseActiveNames = ref(["budget", "actual"]);
const ruleFormRef = ref<FormInstance>();

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "add"
    ? "添加项目收付款预算表"
    : showType.value == "edit"
      ? "编辑项目收付款预算表"
      : showType.value == "read"
        ? "查看项目收付款预算表"
        : "";
});

watch(
  () => props.projectNatureList,
  newValue => {
    INITIAL_DATA.projectNature = newValue[0].value;
  }
);
watch(
  () => formData.value.projectId,
  newVal => {
    if (!newVal) {
      formData.value.projectFullName = "";
      formData.value.projectShortName = "";
      return;
    }
    const projet = props.projectList.find(item => item.projectId == newVal);
    if (!projet) {
      return;
    }
    formData.value.projectFullName = projet.projectFullName;
    formData.value.projectShortName = projet.projectShortName;
    // getSellContractListByProjectId(projet.projectId);
  }
);
// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  dialogVisible.value = true;
  showType.value = _showType;
  formData.value = { ...INITIAL_DATA };
  if (_formData) {
    formData.value = { ..._formData };
  }
};
defineExpose({ show });

// // 获取合同列表数据
// function getSellContractListByProjectId(projectId) {
//   getSellContractListNVByProjectId({ projectId })
//     .then(({ data }) => {
//       sellContractList.value = data || [];
//     })
//     .catch(() => {
//       sellContractList.value = [];
//     });
// }

function handleProjectChange(val) {
  const project = props.projectList.find(item => item.projectId == val);
  formData.value.projectFullName = project.projectFullName;
  formData.value.projectShortName = project.projectShortName;
  formData.value.sellSecondCodes = project.sellContracts
    .map(item => item.secondCode)
    .join();
}

// function handleContractCodeChange(val) {
//   const contractCode = sellContractList.value.find(item => item.value == val);
//   formData.value.sellSecondCodes = contractCode.name;
// }

// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (showType.value == "add") {
        const { code, message } = await createProjectBudget(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      } else if (showType.value == "edit") {
        const { code, message } = await updateProjectBudget(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          dialogVisible.value = false;
          resetForm(formEl);
          emit("search");
        }
      }
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
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="1184"
    top="8vh"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="fromRules"
      label-width="96px"
      :inline="false"
    >
      <el-row :gutter="40">
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :disabled="showType != 'add'"
              :placeholder="showType != 'add' ? '' : '请选择'"
              clearable
              filterable
              style="width: 100%"
              @change="handleProjectChange"
            >
              <el-option
                v-for="item in props.projectList"
                :key="item.projectId"
                :disabled="item.isBindBudget"
                :title="item.isBindBudget ? '该项目已创建收付款预算表' : ''"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="合同编号" prop="sellSecondCodes">
            <!-- <el-select
              v-model="formData.sellContractId"
              :disabled="showType == 'read'"
              placeholder="请选择"
              clearable
              filterable
              @change="handleContractCodeChange"
              style="width: 100%"
            >
              <el-option
                v-for="item in sellContractList"
                :key="item.value"
                :label="item.remark"
                :value="item.value"
              />
            </el-select> -->
            <el-input v-model="formData.sellSecondCodes" readonly disabled />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="立项名称" prop="projectShortName">
            <el-input v-model="formData.projectShortName" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="项目性质" prop="projectNature">
            <el-select
              v-model="formData.projectNature"
              :disabled="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请选择'"
              style="width: 180px !important"
            >
              <el-option
                v-for="item in props.projectNatureList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="项目概算" prop="budgetAmount">
            <el-input
              v-model="formData.budgetAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.budgetAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="往来款合计" prop="totalAmount">
            <el-input
              v-model="formData.totalAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.totalAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="主合同金额" prop="mainContractAmount">
            <el-input
              v-model="formData.mainContractAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.mainContractAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="收款金额合计" prop="recvAmount">
            <el-input
              v-model="formData.recvAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.recvAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="补充合同金额" prop="subContractAmount">
            <el-input
              v-model="formData.subContractAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.subContractAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="付款金额合计" prop="payAmount">
            <el-input
              v-model="formData.payAmount"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.payAmount =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="合同金额合计" prop="contractTotal">
            <el-input
              v-model="formData.contractTotal"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.contractTotal =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="余额" prop="balance">
            <el-input
              v-model="formData.balance"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.balance = val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="项目利润" prop="projectProfit">
            <el-input
              v-model="formData.projectProfit"
              :readonly="showType == 'read'"
              type="number"
              @input="
                val => {
                  formData.projectProfit =
                    val == '' ? 0 : Math.abs(parseFloat(val));
                }
              "
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6" :offset="0">
          <el-form-item label="项目利润率" prop="projectProfitPercent">
            <el-input
              v-model.trim="formData.projectProfitPercent"
              :readonly="showType == 'read'"
              :placeholder="showType == 'read' ? '' : '请输入'"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-collapse v-model="collapseActiveNames">
        <el-collapse-item title="预算费用明细" name="budget">
          <el-row :gutter="40">
            <el-col :span="6" :offset="0">
              <el-form-item label="设备费" prop="deviceFee">
                <el-input
                  v-model="formData.deviceFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.deviceFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="施工费" prop="constructFee">
                <el-input
                  v-model="formData.constructFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.constructFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="材料费" prop="materialFee">
                <el-input
                  v-model="formData.materialFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.materialFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="技术服务费" prop="techFee">
                <el-input
                  v-model="formData.techFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.techFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="工程项目税金" prop="projectTax">
                <el-input
                  v-model="formData.projectTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.projectTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="印花税金" prop="printTax">
                <el-input
                  v-model="formData.printTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.printTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="流转税金" prop="curculationTax">
                <el-input
                  v-model="formData.curculationTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.curculationTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="管理费" prop="manageFee">
                <el-input
                  v-model="formData.manageFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.manageFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="其它" prop="otherFee">
                <el-input
                  v-model="formData.otherFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.otherFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="合计" prop="totalFee">
                <el-input
                  v-model="formData.totalFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.totalFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
        <el-collapse-item title="实际发生费用明细" name="actual">
          <el-row :gutter="40">
            <el-col :span="6" :offset="0">
              <el-form-item label="设备费" prop="realDeviceFee">
                <el-input
                  v-model="formData.realDeviceFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realDeviceFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="施工费" prop="realConstructFee">
                <el-input
                  v-model="formData.realConstructFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realConstructFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="材料费" prop="realMaterialFee">
                <el-input
                  v-model="formData.realMaterialFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realMaterialFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="技术服务费" prop="realTechFee">
                <el-input
                  v-model="formData.realTechFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realTechFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="工程项目税金" prop="realProjectTax">
                <el-input
                  v-model="formData.realProjectTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realProjectTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="印花税金" prop="realPrintTax">
                <el-input
                  v-model="formData.realPrintTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realPrintTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="流转税金" prop="realCurculationTax">
                <el-input
                  v-model="formData.realCurculationTax"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realCurculationTax =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="管理费" prop="realManageFee">
                <el-input
                  v-model="formData.realManageFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realManageFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="其它" prop="realOtherFee">
                <el-input
                  v-model="formData.realOtherFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realOtherFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6" :offset="0">
              <el-form-item label="合计" prop="realTotalFee">
                <el-input
                  v-model="formData.realTotalFee"
                  :readonly="showType == 'read'"
                  type="number"
                  @input="
                    val => {
                      formData.realTotalFee =
                        val == '' ? 0 : Math.abs(parseFloat(val));
                    }
                  "
                >
                  <template #suffix>元</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ showType != "read" ? "取消" : "关闭" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >确定</el-button
      >
    </template>
  </el-dialog>
</template>
