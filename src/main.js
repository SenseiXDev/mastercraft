import { createApp } from 'vue'
import './style.css'
import Notiflix from 'notiflix';
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'
import Index from './pages/Index.vue';
import Dashboard from './pages/Dashboard.vue';
import LandingLogo from './pages/Admin/LandingLogo.vue';
import Verifyotp from './pages/Verifyotp.vue';

const routes = [
    { path: '/', component: Index },
    {path:'/dashboard', component: Dashboard},
    {path:'/landing/logo', component:LandingLogo,props:true},
    {path:'/verifyotp' , component:Verifyotp,props:true},
  ]


const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  
const app = createApp(App);
app.config.globalProperties.$notiflix = Notiflix;
app.use(router).mount('#app')
