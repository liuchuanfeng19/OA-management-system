<script lang="ts" setup>
import type { ElTree } from "element-plus";
// import { handleTree } from "@pureadmin/utils";
import CatalogForm from "./CatalogForm.vue";
import { ElMessage } from "element-plus";
import { deleteCatalog } from "@/api/catalog";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, watch, getCurrentInstance } from "vue";

interface Tree {
  id: number;
  name: string;
  highlight?: boolean;
  children?: Tree[];
}
const defaultProps = {
  children: "children",
  label: "name"
};

interface Emits {
  (e: "nodeClick", menuId: string): void;
  (e: "search"): void;
}

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  }
});

const searchValue = ref("");
const catalogFormRef = ref(null);
const { proxy } = getCurrentInstance();
const treeRef = ref<InstanceType<typeof ElTree>>();
const highlightMap = ref({});
const currentNode = ref(null);

const emit = defineEmits<Emits>();

const handleAdd = () => {
  catalogFormRef.value.show();
};
const handleEdit = () => {
  catalogFormRef.value.show(currentNode.value);
};
const handleDelete = async () => {
  const { code, message } = await deleteCatalog({
    id: currentNode.value.id
  });
  if (code == 0) {
    ElMessage.success(message);
    onSearch();
  }
};
const onSearch = () => {
  emit("search");
};

const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.name.includes(value);
};

function nodeClick(value) {
  console.log("value", value);
  currentNode.value = value;
  const nodeId = value.$treeNodeId;
  highlightMap.value[nodeId] = highlightMap.value[nodeId]?.highlight
    ? Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: false
      })
    : Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: true
      });
  Object.values(highlightMap.value).forEach((v: Tree) => {
    if (v.id !== nodeId) {
      v.highlight = false;
    }
  });
  emit("nodeClick", value.id);
}

function toggleRowExpansionAll(status) {
  // @ts-expect-error
  const nodes = proxy.$refs["treeRef"].store._getAllNodes();
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].expanded = status;
  }
}

// 重置状态（选中状态、搜索框值、树初始化）
function onReset() {
  highlightMap.value = {};
  searchValue.value = "";
  toggleRowExpansionAll(true);
  currentNode.value = null;
  emit("nodeClick", "");
}

watch(searchValue, val => {
  treeRef.value!.filter(val);
});
</script>

<template>
  <div class="[w-280px] h-full min-h-200px bg-bg_color">
    <div class="flex items-center h-[50px]">
      <p class="ml-2 mr-2 text-base truncate" title="类别列表">类别列表</p>
      <el-input
        v-model="searchValue"
        style="flex: 2"
        placeholder="请输入类别名称"
        clearable
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline
              v-show="searchValue.length === 0"
              icon="search"
            />
          </el-icon>
        </template>
      </el-input>
      <el-dropdown>
        <IconifyIconOffline
          class="w-32px cursor-pointer"
          width="20px"
          icon="more-vertical"
        />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-button
                class="reset-margin !h-20px !text-gray-500"
                link
                type="primary"
                :icon="useRenderIcon('expand')"
                @click="toggleRowExpansionAll(true)"
              >
                展开全部
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                class="reset-margin !h-20px !text-gray-500"
                link
                type="primary"
                :icon="useRenderIcon('unExpand')"
                @click="toggleRowExpansionAll(false)"
              >
                折叠全部
              </el-button>
            </el-dropdown-item>
            <el-dropdown-item>
              <el-button
                class="reset-margin !h-20px !text-gray-500"
                link
                type="primary"
                :icon="useRenderIcon('reset')"
                @click="onReset"
              >
                重置状态
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-divider />
    <div class="tree">
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          :data="props.treeData"
          node-key="id"
          size="small"
          :props="defaultProps"
          :default-expand-all="false"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          @node-click="nodeClick"
        >
          <template #default="{ node, data }">
            <span
              :class="[
                'pl-1',
                'pr-1',
                'rounded',
                'flex',
                'items-center',
                'select-none',
                searchValue.trim().length > 0 &&
                  node.label.includes(searchValue) &&
                  'text-red-500'
              ]"
              :style="{
                background: highlightMap[node.id]?.highlight
                  ? 'var(--el-color-primary-light-7)'
                  : 'transparent'
              }"
            >
              <IconifyIconOffline
                :icon="
                  data.type === 1
                    ? 'office-building'
                    : data.type === 2
                      ? 'location-company'
                      : 'dept'
                "
              />
              {{ node.label }}
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <el-divider />
    <div class="footer">
      <el-button
        v-auth="'ConfigurationManage.add'"
        type="primary"
        @click="handleAdd"
        >添加</el-button
      >
      <el-button
        v-auth="'ConfigurationManage.edit'"
        :disabled="!currentNode"
        type="primary"
        @click="handleEdit"
        >编辑</el-button
      >
      <el-popconfirm
        v-auth="'ConfigurationManage.delete'"
        title="是否确认删除?"
        @confirm="handleDelete"
      >
        <template #reference>
          <el-button
            :disabled="!currentNode"
            class="reset-margin"
            type="danger"
          >
            删除
          </el-button>
        </template>
      </el-popconfirm>
    </div>
    <CatalogForm
      ref="catalogFormRef"
      :list="props.treeData"
      @search="onSearch"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-divider) {
  margin: 0;
}

.tree {
  box-sizing: border-box;
  height: calc(100vh - 207px);
  padding: 10px 0;
  overflow: hidden;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 50px;
}
</style>
