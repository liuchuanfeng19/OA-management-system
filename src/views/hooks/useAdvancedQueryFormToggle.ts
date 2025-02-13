import { ref, nextTick, onMounted, isRef, unref, watchEffect } from "vue";
import { emitter } from "@/utils/mitt";

export function useAdvancedQueryFormToggle(target) {
  const fromItemLength = ref(0); // 表单项个数
  const drawerHeight = ref(100); // 查询项默认显示最大数量
  const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
  const drawerVisible = ref(false); // 查询条件折叠状态

  /**
   * 设置表格组件高度
   */
  const setTableHeight = () => {
    const _target = unref(target);
    if (!_target) {
      return;
    }
    nextTick(() => {
      fromItemLength.value = _target.$el.children.length;
      queryItemMaxNum.value =
        (_target.$el.clientWidth -
          8 -
          32 -
          _target.$el.children[fromItemLength.value - 1].clientWidth) /
        (_target.$el.children[0].clientWidth + 32);
      queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
      drawerHeight.value =
        Math.ceil(fromItemLength.value / queryItemMaxNum.value) * 50 + 40 + 62;
    });
  };

  /**
   * mounted周期函数
   */
  onMounted(async () => {
    setTableHeight();
    /**
     * 窗口尺寸改变事件回调
     */
    window.onresize = function () {
      nextTick(() => {
        setTableHeight();
      });
    };

    /**
     * 触发隐藏标签页
     */
    emitter.on("tagViewsChange", () => {
      nextTick(() => {
        setTableHeight();
      });
    });
  });

  /**
   * 切换“折叠”与“展开”
   */
  function handleFold() {
    drawerVisible.value = !drawerVisible.value;
    setTableHeight();
  }

  if (isRef(target)) {
    watchEffect(setTableHeight);
  }

  return {
    drawerHeight,
    drawerVisible,
    queryItemMaxNum,
    handleFold
  };
}
