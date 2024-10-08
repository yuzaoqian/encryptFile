<template>
  <div>
    <video class="video" ref="videos" autoplay playsinline></video>
    <button @click="openRoom">开始</button>
  </div>
</template>

<script setup>
import { joinRoom } from 'trystero';
import { selfId } from 'trystero'
import { ref } from 'vue'


const videos = ref(null);


async function openRoom () {
  console.log('sss')
  console.log(`my peer ID is ${ selfId }`)

  try {
    const config = { appId: 'san_narciso_3d' }
    const room = joinRoom(config, 'yoyodyne')

    // this object can store audio instances for later
    const peerVideos = {}

    // get a local audio stream from the microphone
    const selfStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })

    // if (videos.value) {
    //   videos.value.srcObject = selfStream;
    // }


    // send stream to peers currently in the room
    room.addStream(selfStream)

    // send stream to peers who join later
    room.onPeerJoin(peerId => room.addStream(selfStream, peerId))

    room.onPeerLeave(peerId => console.log(`${ peerId } left`))

    // handle streams from other peers
    room.onPeerStream((stream, peerId) => {
      console.log('stream', stream)
      let video = peerVideos[peerId]

      videos.value.srcObject = stream
    })

  } catch (error) {
    console.log(error)
  }
}


</script>

<style scoped>
.video {
  width: 100vw;
  height: 30vh;
  border: 1px solid red;
}
</style>