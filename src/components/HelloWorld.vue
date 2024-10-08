<script setup>
import { onMounted, ref } from 'vue';
import { createAESKey, ArrayBufferToWordArray, encryptFile, decryptFile, decryptBlob, decrypt } from "@/utils/util.js";


defineProps({
  msg: String,
})



const count = ref(0);
const file = ref(null);
const img = ref(null);

const handleFileChange = function (e) {
  const { files } = e.target;
  console.log(e)
  const reader = new FileReader();
  reader.readAsArrayBuffer(files[0]);
  reader.onload = async (event) => {
    const arrayBuffer = event.target.result;
    const wordBuffer = ArrayBufferToWordArray(arrayBuffer);

    // 生成对称秘钥
    const AES = createAESKey('test', '333test');
    console.log('AES=>', AES);
    console.log('files[0].name=>', files[0])

    const encData = encryptFile(wordBuffer, AES.key, AES.iv);

    // const decData = decryptFile(ArrayBufferToWordArray(encData), AES.key, AES.iv);
    // console.log('encData', encData);
    // console.log('decData', decData);
    const fileBlob = new Blob([encData], { type: files[0].type });
    console.log(fileBlob, URL.createObjectURL(fileBlob));

    const decArrayBuffer = await decryptBlob(fileBlob, AES.key, AES.iv);
    console.log(decArrayBuffer)

    // 将 ArrayBuffer 转换为 Blob
    const blob = new Blob([decArrayBuffer], { type: files[0].type });

    // 生成 Blob URL
    const blobURL = URL.createObjectURL(blob);

    console.log(blob,blobURL)
    img.value.src = blobURL
  }
}



onMounted(() => {
  file.value.onchange = handleFileChange
})
</script>

<template>
  <h1>{{ msg }}</h1>
  <input ref="file" type="file">
  <img ref="img" src="">
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
