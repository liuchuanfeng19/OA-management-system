import { ref, nextTick, onMounted, isRef, unref, watchEffect } from "vue";
import { emitter } from "@/utils/mitt";

//isHavePage 是否有下面page分页
export function useQueryFormToggle(target, rowNumber = [1], isHavePage = true) {
  const tableHeight = ref(0); // Table组件高度
  const queryFold = ref(true); // 查询条件折叠状态
  const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
  const tableHeightMap = ref<Map<number, number>>(new Map()); // 查询项默认显示最大数量

  /**
   * 设置表格组件高度
   */
  const setTableHeight = () => {
    const mainContent = document.getElementsByClassName("grow")[0];
    const _target = unref(target);
    if (!_target) {
      for (let index = 0; index < rowNumber.length; index++) {
        const _tableHeight =
          (mainContent as HTMLElement).clientHeight / rowNumber[index] -
          48 -
          64 -
          8 -
          rowNumber[index];
        tableHeightMap.value.set(rowNumber[index], _tableHeight);
      }
      let th = isHavePage ? 0 : 51;
      tableHeight.value =
        (mainContent as HTMLElement).clientHeight / rowNumber[0] -
        48 -
        64 -
        8 -
        2 -
        rowNumber[0] +
        th;
      tableHeightMap.value.set(rowNumber[0], tableHeight.value);
      return;
    }
    nextTick(() => {
      queryItemMaxNum.value =
        (_target.$el.clientWidth -
          8 -
          32 -
          _target.$el.children[_target.$el.children.length - 1].clientWidth) /
        (_target.$el.children[0].clientWidth + 32);
      queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
      tableHeight.value =
        (mainContent as HTMLElement).clientHeight -
        _target.$el.clientHeight -
        48 -
        64 -
        8 -
        12;
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
    queryFold.value = !queryFold.value;
    setTableHeight();
  }

  if (isRef(target)) {
    watchEffect(setTableHeight);
  }

  return {
    tableHeight,
    tableHeightMap,
    queryFold,
    queryItemMaxNum,
    handleFold
  };
}
