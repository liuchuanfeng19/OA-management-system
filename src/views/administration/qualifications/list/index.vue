<script setup lang="ts">
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { ref, onMounted, nextTick, reactive } from "vue";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DialogForm from "./components/DialogForm.vue";
import ImageWatermark from "@/components/ImageWatermark/imageWatermark.vue";
import { GetList, Delete, GetCompanyQualiTypes } from "@/api/qualification";
import { batchExportExcel } from "@/api/exportAll";
import dayjs from "dayjs";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";
import { userDepartmentStoreHook } from "@/store/modules/department";
import ReadDialog from "@/components/ReadDialog";
// import { PreviewButton } from "@/components/PreviewButton";
// import { DownloadButton } from "@/components/DownloadButton";

defineOptions({
  name: "QualificationsList"
});

const title = useRoute().meta.title as string;

const { getRootDeptList } = userDepartmentStoreHook();
// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const form = reactive({
  keyword: "",
  startTime: "",
  endTime: "",
  qualiTypeNames: [],
  isExpired: "",
  annualTime: "",
  companyDeptIds: [],
  pageIndex: 1,
  pageSize: 20
});
//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: true,
  emitPath: false,
  value: "id",
  checkStrictly: true
};
const typeSelProps = {
  children: "children",
  label: "name",
  multiple: true,
  emitPath: false,
  value: "name",
  checkStrictly: true
};
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const tableHeight = ref(0);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const certTypes = ref([]);
const { rootDepartment } = storeToRefs(userDepartmentStoreHook());
const readDialogRef = ref(null); // 表单对话框组件实例

function handleCurrentChange() {
  onSearch();
}

function handleSizeChange() {
  onSearch();
}

//序号列
//
function getIndex(index) {
  const page = form.pageIndex;
  const pagesize = form.pageSize;
  return (page - 1) * pagesize + index + 1;
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetList(form)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        // if (item.certImages.length > 0) {
        //   const obj1 = item.certImages[0];
        //   if (obj1.indexOf(".pdf") != -1 || obj1.indexOf(".PDF") != -1) {
        //     item.disabled["handleDown"] = true;
        //     item.title["handleDown"] = "当前数据不可预览";
        //   } else {
        //     item.disabled["handleDown"] = false;
        //     item.title["handleDown"] = "";
        //   }
        // }
        item.certImageArray = item.certImages.filter(item => {
          const index = item.lastIndexOf(".");
          const certImagesType = item
            .substring(index, item.length)
            .toLowerCase();
          console.log("certImagesType", certImagesType);
          return (
            certImagesType == ".jpg" ||
            certImagesType == ".jpeg" ||
            certImagesType == ".png"
          );
        });
        item.certFileArray = item.certImages.filter(item => {
          const index = item.lastIndexOf(".");
          const certImagesType = item
            .substring(index, item.length)
            .toLowerCase();
          return (
            certImagesType != ".jpg" &&
            certImagesType != ".jpeg" &&
            certImagesType != ".png"
          );
        });
        return item;
      });
      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    })
    .finally(() => {
      console.log("dataList.value", dataList.value);
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleQuery":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
    case "handleDown": //预览
      handleDown(row);
      break;
  }
}

//添加
function handleAdd() {
  dialogFormRef.value.show();
}
//导出
async function handleExport() {
  const fileName = "公司资质证书导出";
  batchExportExcel("/api/CompanyCert/Export?", fileName, form);
}
// //查看
// function handleQuery(row) {
//   dialogFormRef.value.show(row, "read");
// }
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
  })
    .then(async () => {
      const { code, message } = await Delete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

const watermarkRef = ref(null);
//下载
function handleDown(row) {
  console.log(row);
  if (row.certImages != null && row.certImages.length > 0) {
    watermarkRef.value.show(row.certImages, row.qualiTypeIdExpr);
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  form.companyDeptIds = [];
  form.qualiTypeNames = [];
  formEl.resetFields();
  onSearch();
};

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}
//禁止鼠标右击事件
function handlePaste(event) {
  event.preventDefault();
  return false;
}
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
onMounted(() => {
  onSearch();
  if (rootDepartment.value.length < 1) {
    getRootDeptList();
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
//证书类型
async function certname() {
  const { data } = await GetCompanyQualiTypes();
  certTypes.value = data || [];
}
certname();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="公司名称"
        prop="companyDeptId"
      >
        <el-cascader
          v-model="form.companyDeptIds"
          :options="rootDepartment"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          collapse-tags
          collapse-tags-tooltip
          :show-all-levels="false"
          clearable
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
        <!-- <el-select clearable v-model="form.companyDeptId" placeholder="请选择"
          ><el-option
            v-for="item in rootDepartment"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
        /></el-select> -->
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="证书类别"
        prop="qualiTypeNames"
      >
        <el-cascader
          v-model="form.qualiTypeNames"
          :options="certTypes"
          placeholder="请选择"
          class="w-100/100"
          :props="typeSelProps"
          collapse-tags
          collapse-tags-tooltip
          :show-all-levels="false"
          clearable
        >
          <template #default="{ data }">
            <span>{{ data.name }}</span>
          </template>
        </el-cascader>
        <!-- <el-select clearable v-model="form.qualiTypeId" placeholder="请选择">
          <el-option
            v-for="item in certTypes"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="是否有效"
        prop="isExpired"
      >
        <el-select v-model="form.isExpired" clearable placeholder="请选择">
          <el-option label="失效" value="true" />
          <el-option label="有效" value="false"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="颁发日期"
        prop="startTime"
      >
        <el-date-picker
          v-model="form.startTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px !important"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 5 || !fold"
        label="有效日期"
        prop="endTime"
      >
        <el-date-picker
          v-model="form.endTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px !important"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 6 || !fold"
        label="年检日期"
        prop="annualTime"
      >
        <el-date-picker
          v-model="form.annualTime"
          clearable
          placeholder="请选择"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 240px !important"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 7 || !fold"
        label="关键字"
        prop="keyword"
      >
        <el-input
          v-model="form.keyword"
          placeholder="证书名称,编号,机构"
          clearable
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
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
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
          highlight-current-row
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            fixed="left"
            width="60"
          />

          <el-table-column
            label="公司名称"
            align="left"
            show-overflow-tooltip
            prop="companyName"
            width="180"
          />
          <el-table-column
            label="证书类别"
            align="center"
            show-overflow-tooltip
            prop="qualiTypeName"
            min-width="100"
          />
          <el-table-column
            label="证书名称"
            align="left"
            show-overflow-tooltip
            prop="certName"
            min-width="100"
          />
          <el-table-column
            label="证书编号"
            align="center"
            show-overflow-tooltip
            prop="certNo"
            min-width="150"
          />

          <el-table-column
            label="颁发日期"
            align="center"
            prop="startTime"
            width="100"
            :formatter="
              ({ startTime }) => {
                return startTime != null && startTime != ''
                  ? dayjs(startTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="有效日期"
            align="center"
            prop="endTime"
            width="100"
            :formatter="
              ({ endTime }) => {
                return endTime != null && endTime != ''
                  ? dayjs(endTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="年检日期"
            align="center"
            prop="annualTime"
            width="100"
            :formatter="
              ({ annualTime }) => {
                return annualTime != null && annualTime != ''
                  ? dayjs(annualTime).format('YYYY-MM-DD')
                  : '-';
              }
            "
          />
          <el-table-column
            label="发证机构"
            align="left"
            width="200"
            show-overflow-tooltip
            prop="issuingUnit"
          >
            <template #default="{ row }">
              {{ row.issuingUnit ? row.issuingUnit : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="是否有效"
            align="center"
            show-overflow-tooltip
            prop="isExpired"
            width="100"
          >
            <template #default="{ row }">
              {{ row.isExpired ? "失效" : "有效" }}
            </template>
          </el-table-column>
          <el-table-column
            label="证书图片"
            min-width="100"
            align="center"
            prop="certImages"
          >
            <template #default="{ row }">
              <div
                v-if="row.certImageArray && row.certImageArray.length > 0"
                class="certImg"
              >
                <el-image
                  :preview-teleported="true"
                  style="width: 30px; height: 30px"
                  :src="row.certImageArray[0]"
                  @contextmenu.prevent="handlePaste($event)"
                  @keydown="handlePaste($event)"
                />
                <el-button
                  v-auth="'QualificationsList.preview'"
                  style="margin-left: 10px"
                  type="primary"
                  link
                  @click="handleDown(row)"
                  >预览</el-button
                >
              </div>
              <div v-else>暂无图片</div>
            </template>
          </el-table-column>
          <!-- <el-table-column align="center" label="附件" width="120">
            <template #default="{ row }">
              <div v-if="row.certFileArray && row.certFileArray.length > 0">
                <PreviewButton :srcList="row.certFileArray" :size="size" />
                <DownloadButton :srcList="row.certFileArray" :size="size" />
              </div>
              <div v-else>暂无附件</div>
            </template>
          </el-table-column> -->
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
          v-model:current-page="form.pageIndex"
          v-model:page-size="form.pageSize"
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
    <ImageWatermark ref="watermarkRef" />
    <ReadDialog ref="readDialogRef" :title="title" :column="2" :width="640" />
  </div>
</template>
<style lang="scss" scoped>
:deep() {
  .el-input__wrapper {
    width: 240px !important;
  }
}

.certImg {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
