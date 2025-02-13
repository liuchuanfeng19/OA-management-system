<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";

import {
  tableButtons,
  operationButtons,
  columns1,
  columns2,
  columns3,
  columns4,
  columns5,
  columns6
} from "./constant";
import ReadDialog from "@/components/ReadDialog";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { DeleteSellContract, GetSellContractList } from "@/api/projectAccount";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { exportExcel } from "@/api/exportAll";
import { userProjectStoreHook } from "@/store/modules/project";
// import { getSellContractListNVByProjectId } from "@/api/projectAccount";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "PartyAContract"
});
const title = useRoute().meta.title as string;

const { getProjectWinBidNVList } = userProjectStoreHook();
// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const contractList = ref([]); //合同接口
const spanArr = ref([]); // 合并单元格
const spanArr2 = ref([]); // 合并单元格
const position = ref(0);
const position2 = ref(0);
const readDialogRef = ref(null); // 表单对话框组件实例
const queryForm = ref({
  keyword: "",
  sellContractName: "", //合同名称
  projectShortName: "", //项目简称(立项名称)
  projectFullName: "", //项目全称(项目名称)
  pageIndex: 1,
  pageSize: 20
});
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());

//添加
function handleAdd() {
  dialogFormRef.value.show(null, "add");
}
//添加
function handleSubAdd(row) {
  dialogFormRef.value.show(row, "subAdd");
}
//编辑
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const { code, message } = await DeleteSellContract({ id: row.id });
    if (code == 0) {
      ElMessage.success(message);
      onSearch();
    }
  });
}
// 查看表格行
function handleQuery(row) {
  // dialogFormRef.value.show(row, "query");
  readDialogRef.value.show(row, [
    ...columns1,
    // columns2,
    // columns3,
    // columns4,
    // columns5,
    ...columns6
  ]);
}

//导出
async function handleExport() {
  const fileName = "甲方合同台账";
  exportExcel("/api/SellContract/Export?", fileName, queryForm.value);
}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetSellContractList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      let index = 0;
      _data.forEach((item, idx) => {
        if (idx == 0 && queryForm.value.pageIndex == 1) {
          index = 0;
        } else {
          const pitem = _data[idx - 1];
          if (item.projectId != pitem.projectId) {
            index =
              index +
              1 +
              (queryForm.value.pageIndex - 1) * queryForm.value.pageSize;
          }
        }
        item.index = index + 1;
        item.disabled = {};
        item.title = {};
        //添加子合同
        item.disabled["handleSubAdd"] = !(
          item.contractType == 1 && item.id != null
        );
        item.title["handleSubAdd"] = !(
          item.contractType == 1 && item.id != null
        )
          ? "当前数据不可添加子合同"
          : "";
        //编辑
        item.disabled["handleEdit"] = item.id == null;
        item.title["handleEdit"] = item.id == null ? "当前数据不可编辑" : "";
        //查看
        item.disabled["handleQuery"] = item.id == null;
        item.title["handleQuery"] = item.id == null ? "当前数据不可查看" : "";
        //删除
        item.disabled["handleDelete"] = item.id == null;
        item.title["handleDelete"] = item.id == null ? "当前数据不可删除" : "";
      });
      dataList.value = _data;
      console.log("dataList.value-->", dataList.value);

      totalPage.value = data.totalCount;
      loading.value = false;
      handleData();
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleSubAdd":
      handleSubAdd(row);
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

//选择项目之后调用合同接口
// async function handleProjectChange(val) {
//   if (val) {
//     let { data } = await getSellContractListNVByProjectId({ projectId: val });
//     if (data) {
//       contractList.value = data;
//     }
//   }
// }

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
  spanArr2.value = [];
  dataList.value.forEach((item, index) => {
    if (index == 0) {
      spanArr.value.push(1);
      spanArr2.value.push(1);
      position.value = 0;
      position2.value = 0;
    } else {
      if (
        dataList.value[index].projectId === dataList.value[index - 1].projectId
      ) {
        spanArr.value[position.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        position.value = index;
      }
      if (
        dataList.value[index].projectId ===
          dataList.value[index - 1].projectId &&
        dataList.value[index].id === dataList.value[index - 1].id
      ) {
        spanArr2.value[position2.value] += 1;
        spanArr2.value.push(0);
      } else {
        spanArr2.value.push(1);
        position2.value = index;
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
  if (columnIndex == 0 || columnIndex == 1 || columnIndex == 2) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
  if (
    columnIndex == 3 ||
    columnIndex == 4 ||
    columnIndex == 5 ||
    columnIndex == 6 ||
    columnIndex == 7 ||
    columnIndex == 8 ||
    columnIndex == 9 ||
    columnIndex == 10 ||
    columnIndex == 11 ||
    columnIndex == 12 ||
    columnIndex == 13 ||
    columnIndex == 14 ||
    columnIndex == 15 ||
    columnIndex == 16
  ) {
    const _row = spanArr2.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }
// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  contractList.value = [];
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    maxItemNum.value =
      (formRef.value.$el.clientWidth -
        8 -
        32 -
        formRef.value.$el.children[formRef.value.$el.children.length - 1]
          .clientWidth) /
      (formRef.value.$el.children[0].clientWidth + 32);
    maxItemNum.value = Math.floor(maxItemNum.value);
    tableHeight.value =
      window.innerHeight - formRef.value.$el.clientHeight - 230;
  });
};

//mounted周期函数
onMounted(async () => {
  onSearch();
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
  nextTick(() => {
    setTableHeight();
  });
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="项目名称"
        prop="projectFullName"
      >
        <el-input
          v-model="queryForm.projectFullName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
        />
        <!-- <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
          @change="handleProjectChange"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in winBidProjectNVList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="立项名称"
        prop="projectShortName"
      >
        <el-input
          v-model="queryForm.projectShortName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="合同名称"
        prop="sellContractName"
      >
        <el-input
          v-model="queryForm.sellContractName"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
        />
        <!-- <el-select
          v-model="queryForm.sellContractId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in contractList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select> -->
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="甲方名称"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="loading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
      </el-form-item>
    </el-form>

    <TableProBar
      :title="title"
      :loading="loading"
      :dataList="dataList"
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
          :data="dataList"
          :span-method="objectSpanMethod"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
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
            label="序号"
            type="index"
            width="60"
            align="center"
          />
          <el-table-column label="甲方合同信息">
            <template v-for="column in columns1" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column label="回款明细">
            <template v-for="column in columns2" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column label="开票明细">
            <template v-for="column in columns3" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column label="其他项扣款明细">
            <template v-for="column in columns4" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column label="下游合同情况">
            <template v-for="column in columns5" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <template v-for="column in columns6" :key="column.prop">
            <el-table-column
              v-if="column.read"
              :label="column.label"
              :prop="column.prop"
              :align="column.align"
              :min-width="column.width"
              :fixed="column.fixed"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <el-text
                  type="primary"
                  class="cursor-pointer"
                  @click="handleOperation('handleRead', row)"
                >
                  {{ row[column.prop] }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column
              v-else
              :align="column.align"
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
              :formatter="column.formatter"
            >
              <template #default="{ row }">
                <template v-if="column.tableColumnSlot">
                  <component :is="column.tableColumnSlot(row)" />
                </template>
                <template v-else-if="column.formatter">
                  {{ column.formatter(row) }}
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>
              </template>
            </el-table-column>
          </template>

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
          v-model:current-page="queryForm.pageIndex"
          v-model:page-size="queryForm.pageSize"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="800" :column="2" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
