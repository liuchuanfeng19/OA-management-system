<script setup lang="ts">
import { ref, computed } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
const props = defineProps({
  operationButtons: {
    type: [],
    default: () => []
  },
  size: {
    type: String,
    default: "default"
  }
});
const emits = defineEmits<{
  (e: "operation", functionName: string, row: any): void;
}>();

const canvasRef = ref();

const width = computed(() => {
  let _width = 0;
  // console.log("props.operationButtons", props.operationButtons);
  props.operationButtons.forEach(element => {
    // console.log("buttonName", element.buttonName);
    const val = getTextWidth(element.buttonName, "14px sans-serif") + 18;
    // console.log("val", val);
    _width += val;
  });
  if (canvasRef.value) document.body.removeChild(canvasRef.value); //计算完成移除
  return _width + 24;
});

/*
计算文字宽度
text 需要计算宽度的文字 包括空格
font 字体属性  比如  `12px sans-serif`
*/
function getTextWidth(text, font) {
  // getTextWidth.canvas 这里主要为了复用一个canvas   getTextWidth.canvas就是一个全局变量
  // getTextWidth.任意变量 首次定义只能在getTextWidth函数内定义
  // 然后在其他函数内就可以定义 getTextWidth.其他变量  但是不建议这么使用
  canvasRef.value = canvasRef.value
    ? canvasRef.value
    : document.createElement("canvas");
  document.body.appendChild(canvasRef.value);
  const context = canvasRef.value.getContext("2d");
  context.font = font;
  // 不需要在画布上输出就可以计算文字的宽度
  const metrics = context.measureText(text);
  return metrics.width;
}
</script>

<template>
  <el-table-column
    v-if="operationButtons.length > 0"
    fixed="right"
    label="操作"
    :width="width"
    align="center"
  >
    <template #default="{ row }">
      <template v-for="(item, index) in operationButtons" :key="index">
        <el-button
          v-if="index < 3"
          :disabled="row.disabled[item.buttonClick]"
          :title="row.title[item.buttonClick]"
          :size="size"
          :link="item.isLink"
          :type="item.buttonType"
          @click="emits('operation', item.buttonClick, row)"
        >
          {{ item.buttonName }}
        </el-button>
        <el-dropdown v-else trigger="click" size="default">
          <el-button
            class="ml-3"
            link
            type="primary"
            :size="size"
            :title="item.title"
            :icon="useRenderIcon(item.buttonIcon)"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="(subItem, subIndex) in item.children"
                :key="subIndex"
              >
                <el-button
                  class="reset-margin !h-20px !text-gray-500"
                  :link="subItem.isLink"
                  :type="subItem.buttonType"
                  :size="size"
                  :disabled="row.disabled[subItem.buttonClick]"
                  :icon="useRenderIcon('menu')"
                  :title="row.title[subItem.buttonClick]"
                  @click="emits('operation', subItem.buttonClick, row)"
                >
                  {{ subItem.buttonName }}
                </el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </template>
  </el-table-column>
</template>
