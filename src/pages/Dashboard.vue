<script setup >

import supabase from '../lib/supabaseClient.js';
import { onMounted , getCurrentInstance,ref} from 'vue'

/* ---------------------------- BRING IN NOTIFLIX --------------------------- */
const { proxy } = getCurrentInstance();
const $notiflix = proxy.$notiflix;



</script>
<template>
    <!--**********************************
        Main wrapper start
    ***********************************-->

<div class="content-body">
  <div class="container-fluid">
    <div class="card">
      <div class="container my-5">
        <!-- Search Bar -->
        <div class="row mb-4">
          <div class="col-md-8 offset-md-2">
            <input type="text" id="searchInput" class="form-control form-control-lg" placeholder="Search users...">
          </div>
        </div>

        <!-- User Cards -->
        <div class="row g-4" id="userCardsContainer"></div>

        <!-- Pagination -->
        <nav>
          <ul class="pagination mt-4" id="pagination"></ul>
        </nav>
      </div>
    </div>
  </div>

</div>         
</template>