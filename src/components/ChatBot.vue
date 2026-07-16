<script setup>
import { ref, nextTick } from "vue";
import { sendMessage } from "../services/chatbot";

const question = ref("");
const messages = ref([]);
const chatBox = ref(null);

const scrollBottom = async () => {
  await nextTick();

  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight;
  }
};

const ask = async () => {
  if (!question.value.trim()) return;

  const userQuestion = question.value;

  messages.value.push({
    role: "user",
    text: userQuestion,
  });

  question.value = "";

  messages.value.push({
    role: "bot",
    text: "🌊 부산을 찾아보는 중...",
  });

  await scrollBottom();

  const answer = await sendMessage(userQuestion);

  messages.value[messages.value.length - 1].text = answer;

  await scrollBottom();
};
</script>

<template>
  <div class="background">

    <div class="chat-container">

      <div class="title">
        🌊 Busan Mate
        <p>부산 여행 AI 챗봇</p>
      </div>

      <div class="chat-box" ref="chatBox">

        <div
          v-for="(msg,index) in messages"
          :key="index"
          :class="msg.role==='user' ? 'user-wrap' : 'bot-wrap'"
        >

          <div
            :class="msg.role==='user' ? 'user-msg' : 'bot-msg'"
          >
            {{ msg.text }}
          </div>

        </div>

      </div>

      <div class="input-box">

        <input
          v-model="question"
          @keyup.enter="ask"
          placeholder="부산 여행에 대해 질문해보세요."
        />

        <button @click="ask">
          ➜
        </button>

      </div>

    </div>

  </div>
</template>

<style scoped>

.background{

    width:100%;

    height:100vh;

    display:flex;

    justify-content:center;

    align-items:center;

    background:
    linear-gradient(
        to bottom,
        #d9f3ff 0%,
        #d9f3ff 48%,
        #fff4df 48%,
        #fff4df 100%
    );

}

.chat-container{

    width:700px;

    height:85vh;

    border-radius:30px;

    padding:25px;

    background:rgba(255,255,255,.45);

    backdrop-filter:blur(12px);

    box-shadow:
    0 15px 40px rgba(0,0,0,.15);

}

.title{

    text-align:center;

    font-size:32px;

    font-weight:bold;

    color:#235c8f;

    margin-bottom:15px;

}

.title p{

    font-size:15px;

    margin-top:8px;

    color:#4b789c;

}

.chat-box{

    height:70%;

    overflow-y:auto;

    padding:20px;

    border-radius:20px;

    background:rgba(255,255,255,.5);

}

.chat-box::-webkit-scrollbar{

    width:7px;

}

.chat-box::-webkit-scrollbar-thumb{

    background:#7dd3fc;

    border-radius:30px;

}

.user-wrap{

    display:flex;

    justify-content:flex-end;

    margin-bottom:18px;

}

.bot-wrap{

    display:flex;

    justify-content:flex-start;

    margin-bottom:18px;

}

.user-msg{

    max-width:70%;

    background:#7ed7ff;

    padding:14px 18px;

    border-radius:20px 20px 5px 20px;

    color:#003b5c;

    line-height:1.6;

    box-shadow:0 5px 12px rgba(0,0,0,.08);

}

.bot-msg{

    max-width:70%;

    background:white;

    padding:14px 18px;

    border-radius:20px 20px 20px 5px;

    color:#444;

    line-height:1.6;

    white-space: pre-wrap;

    box-shadow:0 5px 12px rgba(0,0,0,.08);

}

.input-box{

    margin-top:18px;

    display:flex;

    gap:10px;

}

input{

    flex:1;

    border:none;

    outline:none;

    border-radius:40px;

    padding:16px 22px;

    font-size:16px;

    box-shadow:0 4px 12px rgba(0,0,0,.08);

}

button{

    width:60px;

    border:none;

    border-radius:50%;

    font-size:20px;

    cursor:pointer;

    background:#58c9ff;

    color:white;

    transition:.25s;

    box-shadow:0 4px 12px rgba(0,0,0,.15);

}

button:hover{

    transform:scale(1.08);

    background:#34b8ff;

}

@media(max-width:768px){

.chat-container{

    width:95%;

    height:90vh;

}

}

</style>