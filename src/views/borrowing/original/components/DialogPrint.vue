<script setup lang="ts">
import _ from "lodash";
import { ref, computed } from "vue";
import { getProjDocLend } from "@/api/projDocLend";
import Print from "@/utils/print";
import dayjs from "dayjs";
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
  docType: 0, //1 财务 2综合 3财务综合
  ccIds: [], //抄送人
  purpose: "", //用途
  reviewers: []
};

const docData = ref([]);
const formData = ref(null);
const formVisible = ref(false);

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "借阅审批单";
});

// 子组件暴露给父组件调用的方法
const show = async _formData => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  INITIAL_DATA.attach = [];

  await getDetail(_formData.id);
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  const { data } = await getProjDocLend({ id });
  formData.value = data || {};

  if (data) {
    const obj0 = {};
    obj0["name"] = "日期：" + formatDatetime(formData.value.lendTime);
    obj0["purpose"] = "";
    obj0["method"] = "使用部门：" + formData.value.useDeptName;
    obj0["count"] = "";
    docData.value.push(obj0);
    const obj1 = {};
    obj1["name"] = "会计资料名称";
    obj1["purpose"] = "用途";
    obj1["method"] = "借阅方式";
    obj1["count"] = "份数";
    docData.value.push(obj1);
    const docids = data.name.split(",") || [];
    docids.forEach(item => {
      const obj = {};
      obj["name"] = item;
      obj["purpose"] = formData.value.purpose;
      obj["method"] = formData.value.lendMethod;
      obj["count"] = formData.value.lendCount + "份";
      docData.value.push(obj);
    });

    const obj2 = {};
    const reviewer1 = formData.value.reviewers[1];
    obj2["name"] = "使用人签字：" + formData.value.staffName;
    obj2["purpose"] = "";
    if (reviewer1.hasApproved) {
      obj2["method"] = "部门负责人签字：" + reviewer1.reviewerName;
    } else {
      obj2["method"] = "部门负责人签字：";
    }
    obj2["count"] = "";

    const obj3 = {};
    const reviewer2 = formData.value.reviewers[2];
    if (reviewer2.hasApproved) {
      if (formData.value.docType == 1) {
        obj3["name"] = "财务部签字：" + reviewer2.reviewerName;
      } else {
        obj3["name"] = "综合部签字：" + reviewer2.reviewerName;
      }
    } else {
      obj3["name"] =
        formData.value.docType == 1 ? "财务部签字：" : "综合部签字：";
    }
    if (formData.value.docType == 3) {
      const reviewer3 = formData.value.reviewers[3];
      if (reviewer2.hasApproved) {
        obj3["method"] = "财务部签字：" + reviewer3.reviewerName;
      } else {
        obj3["method"] = "财务部签字：";
      }
    } else if (formData.value.docType == 2) {
      if (formData.value.reviewers.length > 3) {
        const reviewer3 = formData.value.reviewers[3];
        if (reviewer3 && reviewer3.hasApproved) {
          obj3["method"] = "主管领导签字：" + reviewer3.reviewerName;
        } else {
          obj3["method"] = "主管领导签字：";
        }
      } else {
        obj3["method"] = "主管领导签字：";
      }
    } else {
      obj3["method"] = "";
    }
    obj3["purpose"] = "";
    obj3["count"] = "";
    docData.value.push(obj2);
    docData.value.push(obj3);
  }
}
const arraySpanMethod = ({ rowIndex, columnIndex }) => {
  if (
    (rowIndex === 0 ||
      rowIndex === docData.value.length - 1 ||
      rowIndex === docData.value.length - 2) &&
    (columnIndex === 0 || columnIndex === 2)
  ) {
    if (rowIndex === docData.value.length - 1 && formData.value.docType == 1) {
      return [1, 4];
    }
    return [1, 2];
  } else if (
    (rowIndex === 0 ||
      rowIndex === docData.value.length - 1 ||
      rowIndex === docData.value.length - 2) &&
    (columnIndex === 1 || columnIndex === 3)
  ) {
    return [0, 0];
  } else {
    return [1, 1];
  }
};
//打印
function handlePrint() {
  Print(".print-main").toPrint;
}
function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
}
//关闭对话框
const closeDialog = () => {
  docData.value = [];
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="762"
    draggable
    @close="closeDialog"
  >
    <div class="print-main">
      <div class="title">借阅会计资料审批单</div>
      <el-table
        class="printTable"
        border
        :data="docData"
        :show-header="false"
        :span-method="arraySpanMethod"
      >
        <el-table-column prop="name" min-width="150" align="left" />
        <el-table-column min-width="150" prop="purpose" align="left" />
        <el-table-column prop="method" min-width="150" align="left" />
        <el-table-column prop="count" width="80" align="center" />
      </el-table>
    </div>
    <template #footer>
      <el-button @click="formVisible = false"> 取消 </el-button>
      <el-button type="success" @click="handlePrint">打印 </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.print-main {
  display: flex;
  flex-direction: column;
  padding: 30px;

  .title {
    padding: 10px 0px;
    font-size: 16px;
    color: #000;
    font-weight: bold;
    text-align: center;
  }
}

:deep() {
  .el-table--border .el-table__inner-wrapper::after,
  .el-table--border::after,
  .el-table--border::before,
  .el-table__inner-wrapper::before {
    background-color: #000 !important;
    border-top: #000 1px solid;
    border-right: #000 1px solid;
  }

  .el-table__border-left-patch {
    background-color: #000 !important;
    border-left: #000 1px solid;
  }

  .el-table td.el-table__cell,
  .el-table th.el-table__cell.is-leaf {
    border-bottom: 1px #000 solid;
    border-right: 1px #000 solid;
  }

  .el-table .cell {
    color: #000 !important;
  }
}
</style>
