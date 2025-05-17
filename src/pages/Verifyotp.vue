<script setup>
// import HelloWorld from './components/HelloWorld.vue';
import supabase from '../lib/supabaseClient.js';
import { onMounted , getCurrentInstance,ref} from 'vue'

/* ---------------------------- BRING IN NOTIFLIX --------------------------- */
const { proxy } = getCurrentInstance();
const $notiflix = proxy.$notiflix;
/* -------------------------------------------------------------------------- */
/*                                  NOTIFLIX                                  */
/* -------------------------------------------------------------------------- */
const GetSession=async()=>{
    const { data: { session } } = await supabase.auth.getSession()
    if(session.access_token){
        $notiflix.Report.success('Notification','You are logged in')
        setTimeout(()=>{
            window.location.href = '/dashboard'
        },2000)
    }else{
        $notiflix.Report.failure("Notification","You are not logged in")

        setTimeout(()=>{
            window.location.href = '/'
        },2000)
    }
}
onMounted(()=>{
    GetSession();
})

</script>
<template>



</template>