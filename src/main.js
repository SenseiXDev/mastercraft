import { createApp } from 'vue'
import './style.css'
import Notiflix from 'notiflix';
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'
import Index from './pages/Index.vue';
import Dashboard from './pages/Dashboard.vue';
import LandingLogo from './pages/Admin/LandingLogo.vue';
import Verifyotp from './pages/Verifyotp.vue';
import LandingPages from './pages/Admin/LandingPages.vue';
import LandingCustomers from './pages/Admin/LandingCustomers.vue';
import LandingCropOrigin from './pages/Admin/LandingCropOrigin.vue';
import LandingFaq from './pages/Admin/LandingFaq.vue';

const routes = [
    { path: '/', component: Index },
    {path:'/dashboard', component: Dashboard},
    // EVERYTHING CONCERNING LANDING 
    {path:'/landing/logo', component:LandingLogo,props:true},
    {path:'/landing/pages', component:LandingPages,props:true},
    {path:'/landing/customers', component:LandingCustomers,props:true},
    {path:'/landing/croporigin', component:LandingCropOrigin,props:true},
    {path:'/landing/faq', component:LandingFaq,props:true},
      // EVERYTHING CONCERNING LANDING 
    {path:'/verifyotp' , component:Verifyotp,props:true},
  ]


const router = createRouter({
    history: createWebHistory(),
    routes,
  })
  
const app = createApp(App);
app.config.globalProperties.$notiflix = Notiflix;
app.use(router).mount('#app')
