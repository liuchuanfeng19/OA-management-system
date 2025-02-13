<script setup lang="ts">
import { cloneDeep } from "@pureadmin/utils";
import { ref, computed, CSSProperties, toRef, watch } from "vue";
import IconJson from "@/assets/iconfont/iconfont.json";
import { useRenderIcon } from "./hooks";
type ParameterCSSProperties = (item?: string) => CSSProperties | undefined;

defineOptions({
  name: "IconfontSelect"
});

const props = defineProps({
  modelValue: {
    require: false,
    type: String
  }
});
const emit = defineEmits<{ (e: "update:modelValue", v: string) }>();

const visible = ref(false);
const inputValue = toRef(props, "modelValue");
const iconList = ref(IconJson.glyphs);
console.log("iconList", iconList.value);
const currentActiveType = ref("IF-");
const icon = ref("icon-qingjia");
// 深拷贝图标数据，前端做搜索
const copyIconList = cloneDeep(iconList.value);

const pageSize = ref(96);
const currentPage = ref(1);

// 搜索条件
const filterValue = ref("");

const pageList = computed(() => {
  if (currentPage.value === 1) {
    return copyIconList
      .filter(v => v.font_class.includes(filterValue.value))
      .slice(currentPage.value - 1, pageSize.value);
  } else {
    return copyIconList
      .filter(v => v.font_class.includes(filterValue.value))
      .slice(
        pageSize.value * (currentPage.value - 1),
        pageSize.value * (currentPage.value - 1) + pageSize.value
      );
  }
});

const iconItemStyle = computed((): ParameterCSSProperties => {
  return item => {
    if (
      inputValue.value ===
      currentActiveType.value + IconJson.css_prefix_text + item
    ) {
      return {
        borderColor: "var(--el-color-primary)",
        color: "var(--el-color-primary)"
      };
    }
  };
});

function onChangeIcon(item) {
  icon.value = item;
  emit(
    "update:modelValue",
    currentActiveType.value + IconJson.css_prefix_text + item.font_class
  );
  visible.value = false;
}

function onCurrentChange(page) {
  currentPage.value = page;
}

watch(
  () => {
    return props.modelValue;
  },
  () => {
    if (props.modelValue) {
      // currentActiveType.value = props.modelValue.substring(
      //   0,
      //   props.modelValue.indexOf("-") + 1
      // );
      icon.value = props.modelValue.substring(
        props.modelValue.indexOf("-") + 1
      );
    }
  }
);
watch(
  () => {
    return filterValue.value;
  },
  () => {
    currentPage.value = 1;
  }
);
</script>

<template>
  <div class="selector w-[350px]">
    <el-input v-model="inputValue" disabled>
      <template #append>
        <el-popover
          :width="350"
          trigger="click"
          popper-class="pure-popper"
          :popper-options="{
            placement: 'auto'
          }"
          :visible="visible"
        >
          <template #reference>
            <div
              class="w-[40px] h-[32px] cursor-pointer flex justify-center items-center"
              @click="visible = !visible"
            >
              <!-- <IconifyIconOnline :icon="currentActiveType + icon" /> -->
              <component :is="useRenderIcon(currentActiveType + icon)" />
            </div>
          </template>

          <el-input
            v-model="filterValue"
            class="p-2"
            placeholder="搜索图标1"
            clearable
          />
          <el-divider border-style="dashed" />

          <el-divider class="tab-divider" border-style="dashed" />
          <el-scrollbar height="220px">
            <ul class="flex flex-wrap px-2 ml-2">
              <li
                v-for="(item, key) in pageList"
                :key="key"
                :title="item.name"
                class="icon-item p-2 w-[1/10] cursor-pointer mr-2 mt-1 flex justify-center items-center border border-solid"
                :style="iconItemStyle(item.font_class)"
                @click="onChangeIcon(item)"
              >
                <!-- {{
                  currentActiveType + IconJson.css_prefix_text + item.font_class
                }} -->
                <!-- <IconifyIconOffline :icon="currentActiveType + item" /> -->
                <component
                  :is="
                    useRenderIcon(
                      currentActiveType +
                        IconJson.css_prefix_text +
                        item.font_class
                    )
                  "
                />
              </li>
            </ul>
          </el-scrollbar>
          <el-divider border-style="dashed" />
          <el-pagination
            small
            :total="copyIconList.length"
            :page-size="pageSize"
            :current-page="currentPage"
            background
            layout="prev, pager, next"
            class="flex items-center justify-center h-10"
            @current-change="onCurrentChange"
          />
        </el-popover>
      </template>
    </el-input>
  </div>
</template>

<style lang="scss" scoped>
.el-divider--horizontal {
  margin: 1px auto !important;
}

.tab-divider.el-divider--horizontal {
  margin: 0 !important;
}

.icon-item {
  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    transition: all 0.4s;
    transform: scaleX(1.05);
  }
}

:deep(.el-tabs__nav-next) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: -5px 0 5px -6px #ccc;
}

:deep(.el-tabs__nav-prev) {
  font-size: 15px;
  line-height: 32px;
  box-shadow: 5px 0 5px -6px #ccc;
}

:deep(.el-input-group__append) {
  padding: 0;
}

:deep(.el-tabs__item) {
  height: 30px;
  font-size: 12px;
  font-weight: normal;
  line-height: 30px;
}

:deep(.el-tabs__header),
:deep(.el-tabs__nav-wrap) {
  position: static;
  margin: 0;
}
</style>
