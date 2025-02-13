//文字点击验证
<script setup lang="ts">
import { ref, onMounted } from "vue";
import img0 from "@/assets/img.jpeg";
import img1 from "@/assets/img1.jpeg";
import img2 from "@/assets/img2.jpeg";
import img3 from "@/assets/img3.jpeg";
import img4 from "@/assets/img4.jpeg";
import img5 from "@/assets/img5.jpeg";
import img6 from "@/assets/img6.jpeg";
const width = ref(320);
const height = ref(160);
const fontStr = ref(
  "赵钱孙李周吴郑王朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐"
);
const fontNum = ref(5);
const checkNum = ref(3);
const accuracy = ref(15);
const images = ref([img0, img1, img2, img3, img4, img5, img6]);

const bgImg = ref(null);
const ctx = ref(null);
const canvas = ref(null);
const fontArr = ref([]);
const tips = ref([]);
const pointer = ref([]);
const state = ref("");
const timeIns = ref(null);
const isRefresh = ref(false);
function init() {
  ctx.value = canvas.value.getContext("2d");
  getImg();
}
function getImg() {
  const img = document.createElement("img");
  const imagesLen = images.value.length;
  const randomIndex = Math.floor(Math.random() * imagesLen);
  img.crossOrigin = "Anonymous";
  img.src = images.value[randomIndex];
  bgImg.value = img;

  img.onload = () => {
    draw();
  };
}
function draw() {
  // 绘制背景图
  ctx.value.drawImage(bgImg.value, 0, 0, width.value, height.value);

  for (let i = 0; i < fontNum.value; i++) {
    const character = getRandomCharacter();
    const fontSize = randomNum(20, (height.value * 1) / 4);
    const fontWeight = Math.random() > 0.5 ? "bold" : "normal";
    const fontStyle = Math.random() > 0.5 ? "italic" : "normal";
    const fontFamily = Math.random() > 0.5 ? "sans-serif" : "serif";
    const x = (width.value / fontNum.value) * i + 10;
    const y = Math.random() * (height.value - fontSize);

    ctx.value.fillStyle = randomColor(0, 255);
    ctx.value.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.value.textBaseline = "top";
    ctx.value.fillText(character, x, y);

    fontArr.value.push({
      character,
      x,
      y
    });
  }

  for (let i = 0; i < checkNum.value; i++) {
    const randomIndex = Math.floor(Math.random() * fontArr.value.length);
    const character = fontArr.value.splice(randomIndex, 1)[0];
    tips.value.push(character);
  }
  if (isRefresh.value) {
    emit("refreshChat");
  }
}
// 获取随机字符
function getRandomCharacter() {
  const fontStrLen = fontStr.value.length;
  const randomIndex = Math.floor(Math.random() * fontStrLen);
  const character = fontStr.value.charAt(randomIndex);

  const isSome = fontArr.value.some(item => {
    return item.character === character;
  });
  if (isSome) {
    return getRandomCharacter();
  } else {
    return character;
  }
}
function randomColor(min, max) {
  const r = randomNum(min, max);
  const g = randomNum(min, max);
  const b = randomNum(min, max);
  return "rgb(" + r + "," + g + "," + b + ")";
}
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
function createPointer(e) {
  const x = e.offsetX - 15;
  const y = e.offsetY - 15;

  if (pointer.value.length < tips.value.length) {
    pointer.value.push({ x, y });
    state.value = "active";
  }
  if (pointer.value.length === tips.value.length) {
    const isPass = verify();
    if (isPass) {
      state.value = "success";
    } else {
      state.value = "fail";
      // 如果失败则1000毫秒后重置
      timeIns.value = setTimeout(() => {
        reset();
      }, 1000);
    }
  }
}
// 判断精度
function verify() {
  console.log("验证");
  const result = pointer.value.every((item, index) => {
    const _left = item.x > tips.value[index].x - accuracy.value;
    const _right = item.x < tips.value[index].x + accuracy.value;
    const _top = item.y > tips.value[index].y - accuracy.value;
    const _bottom = item.y < tips.value[index].y + accuracy.value;
    return _left && _right && _top && _bottom;
  });
  console.log("----->", result);
  emit("checkResult", result);
  return result;
}
// 重置
function reset() {
  fontArr.value = [];
  tips.value = [];
  pointer.value = [];
  state.value = "";
  ctx.value.clearRect(0, 0, width.value, height.value);
  isRefresh.value = true;
  getImg();
}
function getTips() {
  return tips.value;
}
defineExpose({ getTips });
onMounted(() => {
  init();
});
const emit = defineEmits(["checkResult", "refreshChat"]);
</script>

<template>
  <div class="verify-container" :style="{ width: `${width}px` }">
    <div class="refresh" @click="reset">
      <svg
        t="1637315258145"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2420"
        width="20"
        height="20"
      >
        <path
          d="M960 416V192l-73.056 73.056a447.712 447.712 0 0 0-373.6-201.088C265.92 63.968 65.312 264.544 65.312 512S265.92 960.032 513.344 960.032a448.064 448.064 0 0 0 415.232-279.488 38.368 38.368 0 1 0-71.136-28.896 371.36 371.36 0 0 1-344.096 231.584C308.32 883.232 142.112 717.024 142.112 512S308.32 140.768 513.344 140.768c132.448 0 251.936 70.08 318.016 179.84L736 416h224z"
          p-id="2421"
          fill="#8a8a8a"
        />
      </svg>
    </div>
    <div class="pic">
      <canvas
        ref="canvas"
        class="canvas"
        :width="width"
        :height="height"
        @click="createPointer"
      />
      <span
        v-for="(item, index) in pointer"
        :key="item"
        class="pointer"
        :style="{ left: `${item.x}px`, top: `${item.y}px` }"
      >
        <i>{{ index + 1 }}</i>
      </span>
    </div>
    <!-- <div :class="['toolbar', state]">
      <p v-if="state === 'fail'">验证失败</p>
      <p v-else-if="state === 'success'">验证通过</p>
      <p v-else>
        请顺序点击【<span v-for="(item, index) in tips" :key="index">{{
          item.character
        }}</span
        >】
      </p>
    </div> -->
  </div>
</template>

<style scoped lang="scss">
.verify-container {
  position: relative;
  overflow: hidden;
  user-select: none;

  /* border: 1px solid #e4e4e4; */
  // margin: 20px auto;
  border-radius: 4px;
}

.pic {
  position: relative;
}

.canvas {
  display: block;
}

.pointer {
  position: absolute;
  padding: 15px;
  background: #1abd6c;
  border-radius: 50%;
}

.pointer i {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-style: normal;
  color: #fff;
}

.toolbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  font-size: 14px;
  color: #666;
  background: #f7f7f7;
  border: 1px solid #e4e4e4;
}

.toolbar.active {
  color: #fff;
  background: #1991fa;
  border: 1px solid #1991fa;
}

.toolbar.success {
  color: #fff;
  background: #52ccba;
  border: 1px solid #52ccba;
}

.toolbar.fail {
  color: #fff;
  background: #f57a7a;
  border: 1px solid #f57a7a;
}

.refresh {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  display: flex;
  cursor: pointer;
}
</style>
