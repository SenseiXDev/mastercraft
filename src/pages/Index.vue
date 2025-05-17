<script setup>
// import HelloWorld from './components/HelloWorld.vue';
import supabase from '../lib/supabaseClient.js';
import { onMounted , getCurrentInstance,ref} from 'vue'

/* ---------------------------- BRING IN NOTIFLIX --------------------------- */
const { proxy } = getCurrentInstance();
const $notiflix = proxy.$notiflix;
// console.log(supabase);
const email = ref('');
const message = ref('');


const login=async()=>{
    $notiflix.Loading.dots("Please wait...");
    console.log(email.value);
    


  if (!email.value) return

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: 'http://localhost:5173/verifyotp' // Change this!
    }
  })

  if (error) {
    $notiflix.Loading.remove();
    $notiflix.Report.failure("Notification",error.message)
  } else {
    $notiflix.Loading.remove();
    $notiflix.Report.success("Notification","Check your email for the magic link!");
  
  }


}




const GetSession=async()=>{
  const {
  data: { user }
} = await supabase.auth.getUser()
console.log(user)
if (user) {

  // User is logged in
      window.location.href = '/dashboard'
} else {
  // Redirect to login or show guest view
}
}
onMounted(()=>{
    GetSession();
})
</script>
<template>
    
<div id='main-wrapper'>
        <div class="vh-100">
    <div class="authentication h-100" style="zoom:0.8;">
        <div class="container h-100">
            <div class="row justify-content-center h-100 align-items-center">
                <div class="col-md-8">
                    <div class="authincation-content">
                        <div class="row no-gutters">
                            <div class="col-xl-12">
                                <div class="auth-form">
                                    <div class="text-center mb-3">
                                        <img class="image-fluid w-50" src="https://zmarketadmin.zowasel.com/images/logo/logo-fuller.png" alt="">
                                    </div>
                                    <p class="text-center">Administrative Login Access</p>

                                    <form method="POST" id="loginForm">
                                        <div class="mb-3">
                                            <label><strong>Email Address</strong></label>
                                            <input v-model="email" id="email" type="email" name="email_address" class="form-control" placeholder="Email Address">
                                        </div>
                                        <div class="text-center">
                                            <button :onclick="login" id="login" type="button" class="btn btn-primary btn-block">Proceed</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
</template>