import { createApp } from 'vue'
import App from './App.vue'
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import './assets/main.css'

const app = createApp(App);

app.use(Vue3Toastify); // Agora está no lugar correto

app.mount('#app');
