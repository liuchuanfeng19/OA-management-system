<script setup lang="ts">
import { ECharts } from "echarts";
import echarts from "@/plugins/echarts";
import { ref, onBeforeMount, onMounted, nextTick, watch } from "vue";
import { useEventListener, tryOnUnmounted, useTimeoutFn } from "@vueuse/core";

let echartInstance: ECharts;

const props = defineProps({
  index: {
    type: Number,
    default: 0
  },
  realWorkDays: {
    type: Number,
    default: 0
  },
  lackRealWorkDays: {
    type: Number,
    default: 0
  },
  thisMonthWorkDays: {
    type: Number,
    default: 0
  }
});
watch(
  () => props.realWorkDays,
  newVal => {
    console.log("watch realWorkDays ", newVal);
    list.value[0].value = newVal;
    nextTick(() => {
      initechartInstance();
    });
  }
);
watch(
  () => props.lackRealWorkDays,
  newVal => {
    console.log("watch lackRealWorkDays ", newVal);
    list.value[1].value = newVal;
    nextTick(() => {
      initechartInstance();
    });
  }
);
watch(
  () => props.thisMonthWorkDays,
  newVal => {
    console.log("watch thisMonthWorkDays ", newVal);
    list.value[2].value = newVal - props.lackRealWorkDays - props.realWorkDays;
    nextTick(() => {
      initechartInstance();
    });
  }
);
const list = ref([
  { id: 1, name: "实际出勤", value: 0 },
  { id: 2, name: "缺勤", value: 0 },
  { id: 1, name: "未出勤", value: 0 }
]);
const echartOption = ref({
  color: ["#4EDB98", "#FF6232"],
  tooltip: {
    trigger: "item"
  },
  title: [
    {
      text: 0,
      x: "50%",
      y: "30%",
      textAlign: "center",
      textStyle: {
        fontSize: "26",
        fontWeight: "500",
        color: "#22EDDC",
        textAlign: "center",
        textShadowColor: "#000",
        textShadowOffsetX: 2,
        textShadowOffsetY: 2
      }
    },
    {
      text: "应出勤（天）",
      left: "50%",
      top: "42%",
      textAlign: "center",
      textStyle: {
        fontSize: "12",
        fontWeight: "400",
        textAlign: "center",
        textShadowColor: "#000",
        textShadowOffsetX: 1,
        textShadowOffsetY: 1
      }
    }
  ],
  legend: {
    show: true,
    bottom: "10",
    selectedMode: false,
    // left: "center",
    // orient: "vertical",
    // right: "30",
    // align: "left",
    itemWidth: 25,
    itemHeight: 14,
    // textStyle: {
    //   color: "#fafafa",
    //   rich: {
    //     name: {
    //       verticalAlign: "right",
    //       align: "left",
    //       fontSize: 14,
    //       color: "#D8DDE3"
    //     },
    //     percent: {
    //       padding: [0, 0, 0, 10],
    //       color: "#D8DDE3",
    //       fontSize: 18
    //     }
    //   }
    // },
    formatter: function (name) {
      const obj = list.value.find(i => {
        return i.name === name;
      });
      return name + "： " + obj?.value + "（天）";
    }
  },
  series: [
    {
      name: "出勤统计",
      type: "pie",
      // left: "20",
      center: ["50%", "40%"],
      radius: ["50%", "70%"],
      roundCap: false,
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 0,
        shadowColor: "#2a2a34",
        shadowBlur: 0,
        shadowOffsetY: 0,
        shadowOffsetX: 0,
        borderColor: "#2a2a34",
        borderWidth: 0
      },
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      emphasis: {
        label: {
          show: false,
          fontSize: "40",
          fontWeight: "bold"
        }
      },
      data: []
    }
  ]
});

function initechartInstance() {
  const echartDom = document.querySelector(".pie" + props.index);
  if (!echartDom) return;
  // @ts-ignore
  echartInstance = echarts.init(echartDom);
  echartInstance.clear(); //清除旧画布 重新渲染

  echartInstance.setOption(echartOption.value);
  echartOption.value.series[0].data = list.value;
  echartOption.value.title[0].text = list.value.reduce(
    (accumulator, currentValue: any) => accumulator + currentValue.value,
    0
  );
  echartInstance.setOption(echartOption.value);
}

onBeforeMount(() => {
  nextTick(() => {
    initechartInstance();
  });
});

onMounted(() => {
  nextTick(() => {
    useEventListener("resize", () => {
      if (!echartInstance) return;
      useTimeoutFn(() => {
        echartInstance.resize();
      }, 180);
    });
  });
});

tryOnUnmounted(() => {
  if (!echartInstance) return;
  echartInstance.dispose();
  echartInstance = null;
});
</script>

<template>
  <el-card shadow="hover" style="height: 412px">
    <template #header>
      <span style="font-size: 16px; font-weight: 500">出勤统计</span>
    </template>
    <div
      class=""
      :class="'pie' + props.index"
      style="width: 100%; height: 320px"
    />
  </el-card>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: calc(var(--el-card-padding) - 6px) var(--el-card-padding);
  border-bottom: 1px solid var(--el-card-border-color);
  box-sizing: border-box;
}
</style>
