<script setup lang="ts">
import { ElMessage } from "element-plus";

import { exportExcel } from "@/api/common";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "TableExtra"
});
const eimts = defineEmits(["refresh", "operation"]);
const props = defineProps({
  buttons: {
    type: Array<TableButton>,
    default: () => []
  },
  queryParams: {
    type: Object,
    default: () => ({})
  },
  pageTitle: {
    type: String,
    default: ""
  },
  exportUrl: {
    type: String,
    default: ""
  },
  templateUrl: {
    type: String,
    default: ""
  },
  exportBaseUrl: {
    type: String as PropType<"DOMAIN_BFW" | "DOMAIN_BUS">,
    default: ""
  },
  importFunction: {
    type: Function
  }
});

/**
 * 导入
 * @param options
 */
async function handleImport(options) {
  const data = new FormData();
  data.append("file", options.file);
  const importButton = props.buttons.find(
    item => item.buttonClick == "handleImport"
  );
  importButton.loading = true;
  if (props.importFunction && typeof props.importFunction == "function") {
    await props
      .importFunction(data)
      .then(({ code, message }) => {
        if (code == 0) {
          ElMessage.success(message);
          eimts("refresh");
        }
      })
      .finally(() => {
        importButton.loading = false;
      });
  }
}

/**
 * 导出
 */
function handleExport() {
  const exportButton = props.buttons.find(
    item => item.buttonClick == "handleExport"
  );
  exportButton.loading = true;
  exportExcel({
    baseUrl: props.exportBaseUrl,
    tempUrl: `${props.exportUrl}?`,
    fileName: props.pageTitle,
    form: props.queryParams,
    _blobType: "xls",
    requestType: "get"
  }).finally(() => {
    exportButton.loading = false;
  });
}
/**
 * 下載模板
 */
function handleTemplate() {
  const exportButton = props.buttons.find(
    item => item.buttonClick == "handleTemplate"
  );
  exportButton.loading = true;
  exportExcel({
    baseUrl: props.exportBaseUrl,
    tempUrl: `${props.templateUrl}?`,
    fileName: props.pageTitle,
    form: props.queryParams,
    _blobType: "xls",
    requestType: "get"
  }).finally(() => {
    exportButton.loading = false;
  });
}

/**
 *操作按钮事件
 * @param operation
 */
function handleOperation(operation: String) {
  switch (operation) {
    case "handleExport":
      handleExport();
      break;
    case "handleTemplate":
      handleTemplate();
      break;
    default:
      eimts("operation", operation);
      break;
  }
}
</script>

<template>
  <template v-for="(item, index) in buttons" :key="index">
    <el-upload
      v-if="item.buttonClick == 'handleImport'"
      action="#"
      :http-request="handleImport"
      :multiple="false"
      name="file"
      :show-file-list="false"
      class="mx-3"
    >
      <template #trigger>
        <el-button
          plain
          type="primary"
          :loading="item.loading"
          :title="item.buttonName"
          :icon="useRenderIcon(item.buttonIcon)"
        />
      </template>
    </el-upload>
    <el-dropdown
      v-else-if="
        item.dropdown && item.dropdown.items && item.dropdown.items.length > 0
      "
      :trigger="item.dropdown.trigger"
      size="default"
      :placement="item.dropdown.placement"
    >
      <el-button
        class="mx-3"
        plain
        :type="item.buttonType"
        :title="item.buttonName"
        :icon="useRenderIcon(item.buttonIcon)"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
            v-for="(_item, _index) in item.dropdown.items"
            :key="_index"
          >
            <el-button
              class="reset-margin !h-20px"
              :link="true"
              type=""
              :icon="''"
              :title="_item.buttonTitle"
              @click="handleOperation(_item.buttonClick)"
            >
              {{ _item.buttonName }}
            </el-button>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-button
      v-else
      plain
      :type="item.buttonType"
      :loading="item.loading"
      :icon="useRenderIcon(item.buttonIcon)"
      :title="item.buttonName"
      @click="handleOperation(item.buttonClick)"
    />
  </template>
</template>
