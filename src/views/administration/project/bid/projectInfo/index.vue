<script setup lang="ts">
import dayjs from "dayjs";
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  getProjectBidList,
  getProjectBid,
  deleteProjectBid,
  getProjectBidStatus,
  updateProjectBidStatus
} from "@/api/projectBid";
import { exportExcel } from "@/api/exportAll";
import ReadDialog from "@/components/ReadDialog";
import { GetBiddingListNV } from "@/api/bidding";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { getBidCompanyNVList } from "@/api/bidCompany";
import { PreviewButton } from "@/components/PreviewButton";
import { DownloadButton } from "@/components/DownloadButton";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AttachmentDialog from "./components/AttachmentDialog.vue";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "BidProjectInfo"
});

const title = useRoute().meta.title as string;
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  bidStatus: 0,
  fullName: "",
  reBidCompanyId: ""
});
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const projectList = ref([]); // 项目列表
const bidCompanyList = ref([]); // 投标单位列表
const bidStatusArray = ref([]); // 投标状态列表
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const readDialogRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const attachmentDialogRef = ref(null); // 附件对话框组件实例
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例

//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getProjectList();
  getProjectBidList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = item.bidStatus == 3;
        item.title["handleEdit"] =
          item.bidStatus == 3 ? "已中标项目不可编辑" : "";
        //删除
        item.disabled["handleDelete"] = item.bidStatus == 3;
        item.title["handleDelete"] =
          item.bidStatus == 3 ? "已中标项目不可删除" : "";
        //管理附件
        item.disabled["handleAttachment"] = !item.bidCompanyId;
        item.title["handleAttachment"] = !item.bidCompanyId
          ? "请先添加投标单位"
          : "";
        //中标
        item.disabled["handleStatus3"] =
          item.bidStatus != 2 || !item.bidCompanyId;
        item.title["handleStatus3"] =
          item.bidStatus != 2
            ? "已中标或未中标或中止"
            : !item.bidCompanyId
              ? "请先添加投标单位"
              : "";
        //未中标
        item.disabled["handleStatus4"] =
          item.bidStatus != 2 || !item.bidCompanyId;
        item.title["handleStatus4"] =
          item.bidStatus != 2
            ? "已中标或未中标或中止"
            : !item.bidCompanyId
              ? "请先添加投标单位"
              : "";
        //中止
        item.disabled["handleStatus1"] = item.bidStatus != 2;
        item.title["handleStatus1"] =
          item.bidStatus != 2 ? "已中标或未中标或中止" : "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
      requestLoading.value = false;
      handleData();
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

// 获取项目列表数据
function getProjectList() {
  GetBiddingListNV()
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 获取投标列表数据
function getBidCompanyList() {
  getBidCompanyNVList()
    .then(({ data }) => {
      bidCompanyList.value = data || [];
    })
    .catch(() => {
      bidCompanyList.value = [];
    });
}

// 获取投标状态列表
function getBidStatusList() {
  getProjectBidStatus({ includeAll: true })
    .then(({ data }) => {
      bidStatusArray.value = data || [];
    })
    .catch(() => {
      bidStatusArray.value = [];
    });
}

/*
  rowspan（）这个函数就是用来返回 spanArr 数组的，定义每一行的 rowspan
  if( index === 0)，第一行，直接先给数组 push 进一个1，表示自己先占一行，position 是数组元素的位置
  （此时是从数组元素的第一个开始，所以position 为 0）， position为 0 意思表示的就是数组的第一个元素。

  当到了 index 为 2 的时候，if(listData.value[index][spanName] === listData.value[index-1][spanName])，
  让第二行与第一行作比较：
  （1）如果第二行与第一行相等的话，position 就 +1，当有 n 行第一行相同，position 就为 n，表示向下合并 n 行；
  第二行自己就 spanArr.push(0)，表示第二行“消失”，因为第一行和第二行合并了；
  （2）如果第二行与第一行不相等的话，那么 spanArr.push(1);就让第二行自己独占一行；

  position = index ：把指针拿到 index 这行来，表示设置数组 spanArr[position] 的元素值，然后定义从此行开始向下合并几行
  （可以根据示例研究下，当 index 为 2 时，position 为 2，当 index 为 3 时，第四行与第三行需要合并，
  那么在数组的 position 元素就要 +1 了，也就是 spanArr[position] += 1）
*/
function handleData() {
  spanArr.value = [];
  tableData.value.forEach((item, index) => {
    if (index == 0) {
      spanArr.value.push(1);
      position.value = 0;
    } else {
      if (
        tableData.value[index].fullName === tableData.value[index - 1].fullName
      ) {
        spanArr.value[position.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        position.value = index;
      }
    }
  });
}

/*
  :span-method="objectSpanMethod"
  这个是官方给定的绑定属性和对应的方法，objectSpanMethod 传入了 { row, column, rowIndex, columnIndex }
  row: 当前行
  column: 当前列
  rowIndex：当前行号
  columnIndex ：当前列号

  该函数可以返回一个包含两个元素的数组，第一个元素代表rowspan，第二个元素代表 colspan。
  也可以返回一个键名为 rowspan 和 colspan 的对象。

  const _col = _row > 0 ? 1 : 0;  定义的这个单元格列的合并，我们项目只合并行，不合并列；

  _row：代表合并行的行数，_row 的值要么是 1，或者更大的自然正整数，要么是 0。
  1代表：独占一行
  更大的自然数：代表合并了若干行
  0：代表“消失”的哪那一个单元格，后面的单元格向前推一格
*/
const objectSpanMethod = ({ rowIndex, columnIndex }) => {
  //表格合并行
  if (
    columnIndex == 1 ||
    columnIndex == 2 ||
    columnIndex == 3 ||
    columnIndex == 4 ||
    columnIndex == 24
  ) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  onSearch();
};

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "add");
};

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      getProjectBid({
        id: row.id
      }).then(({ data }) => {
        readDialogRef.value.show(data, columns);
      });

      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleAttachment":
      handleAttachment(row);
      break;
    case "handleStatus3":
      handleStatus(row, 3);
      break;
    case "handleStatus4":
      handleStatus(row, 4);
      break;
    case "handleStatus1":
      handleStatus(row, 1);
      break;
  }
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteProjectBid({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 打开附件上传对话框
function handleAttachment(row) {
  attachmentDialogRef.value.show(row, "manage");
}

//更多操作1
const handleStatus = async ({ id }, bidStatus) => {
  const { code, message } = await updateProjectBidStatus({
    id,
    bidStatus: bidStatus
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
};

//导出
function handleExport() {
  const fileName = "投标项目信息表";
  exportExcel("/api/ProjectBid/Export?", fileName, queryForm);
}

// 表格行选中回调resetForm
function handleSelectionChange(_val) {}

const projectSearch = (queryString: string, cb: any) => {
  const results = queryString
    ? projectList.value.filter(createFilter(queryString))
    : projectList.value;
  cb(results);
};

const createFilter = (queryString: string) => {
  return (projectList: any) => {
    return (
      projectList.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

const handleProjectSelect = (item: any) => {
  queryForm.fullName = item.name;
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    queryItemMaxNum.value =
      (queryFormRef.value.$el.clientWidth -
        8 -
        32 -
        queryFormRef.value.$el.children[
          queryFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (queryFormRef.value.$el.children[0].clientWidth + 32);
    queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
    tableHeight.value =
      window.innerHeight - queryFormRef.value.$el.clientHeight - 230;
  });
};

// mounted周期函数
onMounted(async () => {
  getBidStatusList();
  getBidCompanyList();
  onSearch();
  setTableHeight();
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="68px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="投标状态"
        prop="bidStatus"
      >
        <el-select v-model="queryForm.bidStatus">
          <el-option
            v-for="item in bidStatusArray"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="项目名称"
        prop="fullName"
      >
        <el-autocomplete
          v-model.trim="queryForm.fullName"
          style="width: 100%"
          :fetch-suggestions="projectSearch"
          clearable
          value-key="name"
          placeholder="请输入"
          @select="handleProjectSelect"
        >
          <template #suffix>
            <el-icon class="el-input__icon">
              <IconifyIconOffline icon="arrow-down" />
            </el-icon>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="投标单位"
        prop="reBidCompanyId"
      >
        <el-select
          v-model="queryForm.reBidCompanyId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="item in bidCompanyList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="requestLoading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="handleReset">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="queryFold">展开</span>
          <span v-show="!queryFold">折叠</span>
          <IconifyIconOffline :icon="!queryFold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      :title="title"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="tableData"
          :span-method="objectSpanMethod"
          highlight-current-row
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            fixed="left"
            label="项目名称"
            align="left"
            prop="fullName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="投标状态" align="left" min-width="120">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.bidStatus == 1
                    ? 'info'
                    : row.bidStatus == 2
                      ? ''
                      : row.bidStatus == 3
                        ? 'success'
                        : row.bidStatus == 4
                          ? 'warning'
                          : 'danger'
                "
              >
                {{ row.bidStatusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="开标时间"
            align="center"
            prop="openTime"
            width="160"
            :formatter="
              ({ openTime }) => {
                return openTime
                  ? dayjs(openTime).format('YYYY-MM-DD HH:mm:ss')
                  : '-';
              }
            "
          />
          <el-table-column
            label="开标地点"
            align="left"
            prop="openAddress"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column
            label="投标单位"
            align="left"
            prop="bidCompanyName"
            min-width="280"
            show-overflow-tooltip
          />
          <el-table-column
            label="投标包件"
            align="left"
            prop="bidPackage"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="投标金额（元）"
            width="150"
            align="right"
            prop="bidAmount"
          />
          <el-table-column
            label="标书制作人员"
            align="center"
            prop="columnCenter"
            width="120"
          >
            <el-table-column
              label="商务人员"
              align="left"
              prop="bidBusiStaffName"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              label="技术人员"
              align="left"
              prop="bidTechStaffName"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              label="采购人员"
              align="left"
              prop="bidBuyStaffName"
              width="100"
              show-overflow-tooltip
            />
            <el-table-column
              label="终审人员"
              align="left"
              prop="bidReviewStaffName"
              width="100"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="附件">
            <el-table-column label="招标公告" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachZbgg && row.bidAttachZbgg.length > 0">
                  <PreviewButton :srcList="row.bidAttachZbgg" :size="size" />
                  <DownloadButton :srcList="row.bidAttachZbgg" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="报名资料" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachBmzl && row.bidAttachBmzl.length > 0">
                  <PreviewButton :srcList="row.bidAttachBmzl" :size="size" />
                  <DownloadButton :srcList="row.bidAttachBmzl" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="报名发票" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachBmfp && row.bidAttachBmfp.length > 0">
                  <PreviewButton :srcList="row.bidAttachBmfp" :size="size" />
                  <DownloadButton :srcList="row.bidAttachBmfp" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="招标文件（含图纸）"
              align="center"
              min-width="200"
            >
              <template #default="{ row }">
                <div v-if="row.bidAttachZbwj && row.bidAttachZbwj.length > 0">
                  <PreviewButton :srcList="row.bidAttachZbwj" :size="size" />
                  <DownloadButton :srcList="row.bidAttachZbwj" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="补遗文件" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachBywj && row.bidAttachBywj.length > 0">
                  <PreviewButton :srcList="row.bidAttachBywj" :size="size" />
                  <DownloadButton :srcList="row.bidAttachBywj" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="答疑文件" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachDywj && row.bidAttachDywj.length > 0">
                  <PreviewButton :srcList="row.bidAttachDywj" :size="size" />
                  <DownloadButton :srcList="row.bidAttachDywj" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="投标保证金/投标保函"
              align="center"
              min-width="200"
            >
              <template #default="{ row }">
                <div v-if="row.bidAttachTbbzj && row.bidAttachTbbzj.length > 0">
                  <PreviewButton :srcList="row.bidAttachTbbzj" :size="size" />
                  <DownloadButton :srcList="row.bidAttachTbbzj" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="成本" align="center" min-width="200">
              <template #default="{ row }">
                <div v-if="row.bidAttachCost && row.bidAttachCost.length > 0">
                  <PreviewButton :srcList="row.bidAttachCost" :size="size" />
                  <DownloadButton :srcList="row.bidAttachCost" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="厂家授权资料"
              align="center"
              min-width="200"
            >
              <template #default="{ row }">
                <div
                  v-if="row.bidAttachCjsqzl && row.bidAttachCjsqzl.length > 0"
                >
                  <PreviewButton :srcList="row.bidAttachCjsqzl" :size="size" />
                  <DownloadButton :srcList="row.bidAttachCjsqzl" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="投标文件" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachTbwj && row.bidAttachTbwj.length > 0">
                  <PreviewButton :srcList="row.bidAttachTbwj" :size="size" />
                  <DownloadButton :srcList="row.bidAttachTbwj" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="开标一览表" align="center" min-width="150">
              <template #default="{ row }">
                <div v-if="row.bidAttachKbylb && row.bidAttachKbylb.length > 0">
                  <PreviewButton :srcList="row.bidAttachKbylb" :size="size" />
                  <DownloadButton :srcList="row.bidAttachKbylb" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="中标通知书/中标公示"
              align="center"
              min-width="200"
            >
              <template #default="{ row }">
                <div v-if="row.bidAttachZbtzs && row.bidAttachZbtzs.length > 0">
                  <PreviewButton :srcList="row.bidAttachZbtzs" :size="size" />
                  <DownloadButton :srcList="row.bidAttachZbtzs" :size="size" />
                </div>
              </template>
            </el-table-column>
            <el-table-column
              label="中标服务费及发票"
              align="center"
              min-width="150"
            >
              <template #default="{ row }">
                <div v-if="row.bidAttachZbfwf && row.bidAttachZbfwf.length > 0">
                  <PreviewButton :srcList="row.bidAttachZbfwf" :size="size" />
                  <DownloadButton :srcList="row.bidAttachZbfwf" :size="size" />
                </div>
              </template>
            </el-table-column>
          </el-table-column>

          <el-table-column
            label="备注"
            align="left"
            prop="bidCompanyComment"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            v-auth="'BidProjectInfo.attachment'"
            fixed="right"
            label="附件"
            width="80"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'BidProjectInfo.attachment'"
                link
                :disabled="!scope.row.bidCompanyId"
                :title="!scope.row.bidCompanyId ? '请先添加投标单位' : ''"
                type="primary"
                :size="size"
                @click="handleAttachment(scope.row)"
              >
                管理
              </el-button>
            </template>
          </el-table-column>
          <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryForm.pageSize"
          v-model:current-page="queryForm.pageIndex"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </template>
    </TableProBar>
    <DialogForm
      ref="dialogFormRef"
      :projectList="projectList"
      :bidCompanyList="bidCompanyList"
      @search="onSearch"
    />
    <ReadDialog ref="readDialogRef" :title="title" :column="1" :width="1000" />
    <AttachmentDialog ref="attachmentDialogRef" @search="onSearch" />
  </div>
</template>
