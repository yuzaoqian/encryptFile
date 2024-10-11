<script setup>
import { onMounted, ref } from 'vue';
import { createAESKey, ArrayBufferToWordArray, blobToArrayBuffer, encryptFile, decryptFile, decryptBlob, decrypt } from "@/utils/util.js";
import { splitFile, mergeChunks } from '@/utils/file.js';


defineProps({
  msg: String,
})



const count = ref(0);
const file = ref(null);
const img = ref(null);

const handleFileChangeAsync = async function (e) {
  const { files } = e.target;
  const file = files[0];

  // 1. 创建 CryptoAES 实例
  const cryptoAES = new CryptoAES('test', '333test');

  // 2. 文件分片
  const chunks = splitFile(file);  // 文件分片
  console.log('File chunks:', chunks);

  // 3. 将文件分片转换为 ArrayBuffer
  const arrayBufferChunks = await Promise.all(chunks.map(cryptoAES.blobToArrayBuffer.bind(cryptoAES)));
  console.log('ArrayBuffer Chunks:', arrayBufferChunks);

  // 4. 将 ArrayBuffer 转换为 WordArray
  const wordBufferChunks = arrayBufferChunks.map(cryptoAES.arrayBufferToWordArray.bind(cryptoAES));
  console.log('WordArray Chunks:', wordBufferChunks);

  // 5. 对文件分片加密
  const encDataChunks = wordBufferChunks.map(cryptoAES.encryptFile.bind(cryptoAES));
  console.log('Encrypted Data Chunks:', encDataChunks);

  // 6. 将加密后的数据转换为 Blob
  const encryptedBlobChunks = encDataChunks.map(encDataChunk => new Blob([encDataChunk], { type: file.type }));
  console.log('Encrypted Blob Chunks:', encryptedBlobChunks);

  // 7. 解密加密的 Blob
  const decArrayBufferTasks = encryptedBlobChunks.map(cryptoAES.decryptBlob.bind(cryptoAES));
  const decArrayBufferChunks = await Promise.all(decArrayBufferTasks);
  console.log('Decrypted ArrayBuffer Chunks:', decArrayBufferChunks);

  // 8. 将解密后的数据转换回 Blob
  const decryptedBlobChunks = decArrayBufferChunks.map(decArrayBufferChunk => new Blob([decArrayBufferChunk], { type: file.type }));
  console.log('Decrypted Blob Chunks:', decryptedBlobChunks);

  // 9. 合并文件分片
  const mergedBlob = mergeChunks(decryptedBlobChunks, file.type);
  console.log('Merged File:', mergedBlob);

  // 10. 生成可下载链接
  const fileUrl = URL.createObjectURL(mergedBlob);
  console.log('File URL:', fileUrl);

  // 可以在页面上显示下载链接或直接下载
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


const handleFileChange = async function (e) {
  const { files } = e.target;
  const chunks = splitFile(files[0]);
  console.log(chunks);
  const arrayBufferChunks = await Promise.all(chunks.map(blobToArrayBuffer));
  console.log('arrayBufferChunks', arrayBufferChunks);
  const wordBufferChunks = arrayBufferChunks.map(ArrayBufferToWordArray);
  console.log('wordBufferChunks', wordBufferChunks)
  // 生成对称秘钥
  const AES = createAESKey('test', '333test');
  const encDataChunks = wordBufferChunks.map(wordBuffer => {
    return encryptFile(wordBuffer, AES.key, AES.iv);
  })

  console.log('encDataChunks', encDataChunks)

  const fileBlobChunks = encDataChunks.map((encDataChunk) => {
    return new Blob([encDataChunk], { type: files[0].type });
  })

  const decArrayBufferTasks = fileBlobChunks.map((fileBlobChunk) => {
    return decryptBlob(fileBlobChunk, AES.key, AES.iv)
  })

  const decArrayBufferChunks = await Promise.all(decArrayBufferTasks);
  console.log('decArrayBufferChunks', decArrayBufferChunks)

  const decblobChunks = decArrayBufferChunks.map((decArrayBufferChunk) => {
    return new Blob([decArrayBufferChunk], { type: files[0].type })
  })

  console.log(decblobChunks);

  const mergeBolb = mergeChunks(decblobChunks, files[0].type);
  // const mergeBolb = mergeChunks(chunks, files[0].type);
  console.log(URL.createObjectURL(mergeBolb))
}

const handleFileChange1 = function (e) {
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
