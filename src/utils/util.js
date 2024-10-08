import CryptoJS from 'crypto-js';


/**
 * @description key 和 iv 构建
 * @param secret_key
 * @param secret_iv
 * @returns { AES } AES
 */
export const createAESKey = function (secret_key, secret_iv) {
  let AES = {
    key: CryptoJS.enc.Utf8.parse(secret_key),
    iv: CryptoJS.enc.Utf8.parse(secret_iv)
  }
  return AES
}

/**
 * @description buffer转ArrayBuffer
 * @param {Buffer} buffer
 * @returns {ArrayBuffer}
 */
export const bufferToArrayBuffer = function(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length)
  const res = new Uint8Array(arrayBuffer)
  for (let i = 0; i < buffer.length; ++i) {
    res[i] = buffer[i]
  }
  return arrayBuffer
}

/**
 * @description bolb转ArrayBuffer
 * @param blob
 * @returns
 */
function blobToArrayBuffer (blob) {
  return new Promise((resolve, reject) => {
    const file = new FileReader()
    file.onload = function (result) {
      resolve(file.result)
    }
    file.readAsArrayBuffer(blob)
  })
}

/**
 * woryArray转ArrayBuffer
 * @param wordArray
 * @returns
 */
function wordArrayToArrayBuffer (wordArray) {
  const { words } = wordArray
  const { sigBytes } = wordArray
  const u8 = new Uint8Array(sigBytes)
  for (let i = 0; i < sigBytes; i += 1) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  }
  return u8
}

/**
 *
 * @param { ArrayBuffer } arrayBuffer
 * @returns { wordArray }
 */
export const ArrayBufferToWordArray = arrayBuffer => {
    const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength);
    const len = u8.length;
    const words = [];
    for (let i = 0; i < len; i += 1) {
        words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
}



/**
 * @description 加密文件Buffer
 * @param buffer
 * @returns
 */
function encryptBuffer (buffer, key, iv) {
  const arrayBuffer = bufferToArrayBuffer(buffer)
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
  return encryptFile(wordArray, key, iv)
}

/**
 * @description 加密文件blob
 * @param { Blob } blob
 * @returns
 */
export const encryptBlob = async function  (blob, key, iv) {
  const arrayBuffer = await blobToArrayBuffer(blob)
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
  return encryptFile(wordArray, key, iv)
}

/**
 * @description 解密Blob
 * @param { Blob } blob
 * @returns
 */
export const decryptBlob = async function (blob,key,iv) {
  const arrayBuffer = await blobToArrayBuffer(blob)
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  return decryptFile(wordArray,key, iv)
}



/**
 * @description 对称加密文件内容 AESEncData
 * @param wordArray
 * @param key 私钥
 * @param iv
 * @returns
 */
export const encryptFile = function (wordArray, key, iv) {
  // encrypt 函数接受的是一个 wordArray 对象
  const encrypt = CryptoJS.AES.encrypt(wordArray, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  // 根据实际场景返回
  console.log('加密结果',encrypt)
  // return CryptoJS.enc.Base64.stringify(encrypt.ciphertext)
  // 将加密结果转换为 WordArray 后转换为 ArrayBuffer
   const encArrayBuffer = wordArrayToArrayBuffer(encrypt.ciphertext); // 提取 ciphertext
  return encArrayBuffer
}

/**
 * @description 解密加密文件 AESDecData
 * @param wordArray
 * @returns
 */
export const decryptFile = function(wordArray, key, iv) {
  console.log('加密的text', wordArray)
  // wordArray = CryptoJS.enc.Base64.parse(wordArray)
  const decrypt = CryptoJS.AES.decrypt({ ciphertext: wordArray }, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  console.log('decrypt',decrypt)
  return wordArrayToArrayBuffer(decrypt)
}

/**
 * @description 对字符串加密
 * @param data
 * @returns
 */
export const encrypt = function(data, key, iv) {
  if (typeof data === 'object') {
    // 如果传入的data是json对象，先转义为json字符串
    data = JSON.stringify(data)
  }
  const srcs = CryptoJS.enc.Utf8.parse(data)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC, // 加密模式
    padding: CryptoJS.pad.Pkcs7
  })
  // 需要返回base64格式的加密结果
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
  // 需要返回hex格式的加密结果
  // return encrypted.ciphertext.toString()
}

/**
 * 解密字符串数据
 * @param data 数据
 * @returns {string}
 */
export const decrypt = function(data, key, iv) {
  const base64 = CryptoJS.enc.Base64.parse(data)
  const srcs = CryptoJS.enc.Base64.stringify(base64)
  const decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
  return decryptedStr.toString()
}


/**
 * 文件加密步骤
 * 1. 对 WordArray 进行加密 encryptFile
 * 2. 对 Buffer 文件加密 需要先把 Buffer 转为 ArrayBuffer，再把 ArrayBuffer 转为 WordArray encryptBuffer
 * 3. 对 Blob 文件加密 需要先把 Blob 转为 Arraybuffer，再把 ArrayBuffer 转为 WordArray encryptBlob
 *
 * 文件解密
 * 1. 对 WordArray 解密 文件解密传入的也是 WordArray 对象 decryptFile
 * 2. 对 Blob 解密 浏览器通过 axios 返回的是一个 Blob 文件，所以，对 Blob 文件解密需要先转为 ArrayBuffer，然后把ArrayBuffer 转为 WordArray 对象 decryptBlob
 * 3. 对字符串加解密  encrypt
 */