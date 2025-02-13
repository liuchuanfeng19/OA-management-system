<script setup lang="ts">
import { FormInstance } from "element-plus";
import { ref, computed } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import html2canvas from "html2canvas";
const INITIAL_DATA = {
  showWatermarkText: "某某科技股份有限公司"
};
const formRef = ref(null);
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const imgName = ref("");
const watermarkImgRef = ref(null);
const imageUrlData = ref([]);
const imageUrls = ref("");
const imgCount = ref(0);
const imgIdx = ref(0);
const watermarkOptions = ref({
  text: "某某科技股份有限公司",
  fontSize: 12,
  width: 5,
  color: "#000000",
  alpha: 50,
  rotate: -30
});
const color = ref("rgba(0, 0, 0, 0.5)");
const predefineColors = ref([
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585"
]);
const fonts = ref(12);
const fontOptions = ref([]);
const show = async (imgs, imageNames) => {
  imgIdx.value = 0;
  imgCount.value = imgs.length;
  imageUrls.value = imgs[0];
  imgName.value = imageNames;
  imageUrlData.value = imgs;
  formData.value.showWatermarkText = "某某科技股份有限公司";
  watermarkOptions.value.text = "某某科技股份有限公司";
  watermarkOptions.value.color = "#000000";
  watermarkOptions.value.fontSize = 12;
  fontOptions.value = [];
  for (let i = 12; i < 41; i++) {
    const op = {
      value: i,
      label: i
    };
    fontOptions.value.push(op);
  }
  getWidth();
  formVisible.value = true;
};
defineExpose({ show });

const paint = computed(() => {
  const wordWidth =
    watermarkOptions.value.fontSize *
    watermarkOptions.value.text.split("").length;
  const width = wordWidth + watermarkOptions.value.width;

  const svgText = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}px" height="${width}px">
    <text x="50%" y="50%"
        alignment-baseline="middle"
        text-anchor="middle"
        stroke="${watermarkOptions.value.color}"
        opacity="${watermarkOptions.value.alpha / 100}"
        transform="translate(${width / 2}, ${width / 2}) rotate(${
          watermarkOptions.value.rotate
        }) translate(-${width / 2}, -${width / 2})"
        font-weight="100"
        font-size="${watermarkOptions.value.fontSize}"
        font-family="microsoft yahe"
        >
        ${watermarkOptions.value.text}
    </text>
   </svg>`;

  return `url(data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(svgText))
  )})`;
});

const widths = ref("");

function getWidth() {
  const img_url = imageUrls.value;
  const img = new Image();
  img.src = img_url;
  let width = 0;
  let height = 0;
  let newwidth = 0;
  if (img.complete) {
    width = img.width;
    height = img.height;
    const scale = width / height;
    newwidth = 500 * scale;
    widths.value = `${newwidth}px`;
  } else {
    // 加载完成执行
    img.onload = function () {
      width = img.width;
      height = img.height;
      const scale = width / height;
      newwidth = 500 * scale;
      widths.value = `${newwidth}px`;
    };
  }
}
function handleOnInput(val) {
  console.log("val-----", val);
  // if (val.data != null) {
  //   watermarkOptions.value.text = formData.value.showWatermarkText + val.data;
  // } else {
  //   watermarkOptions.value.text = formData.value.showWatermarkText;
  // }
}
function handleColorChange() {
  watermarkOptions.value.color = color.value;
}
function handleFontChange(val) {
  watermarkOptions.value.fontSize = val;
}
function handleCreate() {
  watermarkOptions.value.text = formData.value.showWatermarkText;
}
function handlePre() {
  imgIdx.value--;
  imageUrls.value = imageUrlData.value[imgIdx.value];
  getWidth();
}
function handleNext() {
  imgIdx.value++;
  imageUrls.value = imageUrlData.value[imgIdx.value];
  getWidth();
}
function sure() {
  html2canvas(watermarkImgRef.value, {
    useCORS: true
  }).then(canvas => {
    const imageurl = canvas.toDataURL("image/png");
    const aLink = document.createElement("a"); // 创建a标签
    aLink.style.display = "none";
    aLink.href = imageurl;
    aLink.download = `${imgName.value}`; // 下载文件名
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink); // 用完后移除元素
  });
}

//禁止鼠标右击事件
function handlePaste(event) {
  event.preventDefault();
  return false;
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  resetForm(formRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    title="图片下载设置"
    :width="1200"
    draggable
    @close="closeDialog"
  >
    <!-- 表单内容 -->
    <div class="mainView">
      <el-form ref="formRef" :model="formData">
        <el-row :gutter="20">
          <el-col :span="20" :offset="0">
            <el-form-item
              label="水印文字"
              label-width="78px"
              prop="showWatermarkText"
            >
              <el-input
                v-model="formData.showWatermarkText"
                placeholder="请输入"
                maxlength="40"
                :oninput="handleOnInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="4" :offset="0">
            <el-form-item label-width="0px">
              <el-button type="primary" @click="handleCreate"
                >生成图片</el-button
              >
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="imgMain">
        <div ref="watermarkImgRef" class="preview" :style="{ width: widths }">
          <el-image
            ref="imgRef"
            class="imgs"
            :src="imageUrls"
            contenteditable="true"
            @contextmenu.prevent="handlePaste($event)"
            @keydown="handlePaste($event)"
          />
          <div
            class="watermark"
            :style="{ background: paint, width: widths }"
          />
        </div>
        <div class="op">
          <el-tooltip content="上一张" effect="dark" placement="top">
            <el-button
              :disabled="imgIdx == 0"
              :icon="useRenderIcon('arrow-left-s-line')"
              @click="handlePre"
            />
          </el-tooltip>
          <el-tooltip content="下一张" effect="dark" placement="top">
            <el-button
              :disabled="imgIdx == imgCount - 1"
              :icon="useRenderIcon('arrow-right-s-line')"
              @click="handleNext"
            />
          </el-tooltip>
          <el-tooltip content="水印文字颜色" effect="dark" placement="top">
            <div class="color">
              <el-color-picker
                v-model="color"
                show-alpha
                :predefine="predefineColors"
                @change="handleColorChange"
              />
            </div>
          </el-tooltip>
          <el-tooltip content="字体" effect="dark" placement="top">
            <div class="font">
              <el-select
                v-model="fonts"
                style="width: 60px"
                @change="handleFontChange"
              >
                <el-option
                  v-for="item in fontOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </el-tooltip>
          <el-tooltip content="下载" effect="dark" placement="top">
            <el-button :icon="useRenderIcon('download')" @click="sure" />
          </el-tooltip>
        </div>
      </div>
    </div>
    <!-- <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button type="primary" @click="sure">下载</el-button>
    </template> -->
  </el-dialog>
</template>

<style lang="scss" scoped>
.imgMain {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 570px;
  padding: 10px 10px 0;
  margin-bottom: 10px;
  overflow: auto;
  background-color: #f1f1f1;
}

.preview {
  position: relative;
  display: flex;
  justify-content: center;
}

.imgs {
  height: 500px;
}

.watermark {
  position: absolute;
  height: 500px;
}

.op {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
  margin-bottom: 10px;
}

.color {
  margin: 0 10px;
}

.font {
  margin-right: 10px;
}
</style>
