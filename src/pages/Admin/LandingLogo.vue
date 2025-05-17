<script setup >
import Header from '../../components/Header.vue';
import Sidebar from '../../components/Sidebar.vue';
import { onMounted , getCurrentInstance,ref} from 'vue'

const { proxy } = getCurrentInstance();
const $notiflix = proxy.$notiflix;

const uploadLogo=(type)=>{
    console.log(type)
    $notiflix.Loading.dots('Uploading...');
}

</script>
<template>
    
<Header/>
<Sidebar/>
<!--**********************************
    Content body start
***********************************-->
<div class="content-body default-height">
    <div class="container-fluid">
        <div class="card p-4">
              
            <div class="container mt-4">
                <h4>Landing Page Logos</h4>
                <div class="row">
                    <!-- Logo Light -->
                    <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">Logo Light</div>
                        <div class="card-body text-center">
                        <img src="https://via.assets.so/img.jpg?w=200&h=150&tc=blue&bg=#fafafa" alt="Logo Light" id="preview-light" class="img-fluid mb-3" style="max-height: 150px;">
                        <input type="file" class="form-control" id="upload-light" accept="image/*">
                        <button class="btn btn-primary mt-2" @click="uploadLogo('light')">Update Logo Light</button>
                        </div>
                    </div>
                    </div>

                    <!-- Logo Dark -->
                    <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">Logo Dark</div>
                        <div class="card-body text-center">
                        <img src="https://via.assets.so/img.jpg?w=200&h=150&tc=blue&bg=#fafafa" alt="Logo Dark" id="preview-dark" class="img-fluid mb-3" style="max-height: 150px;">
                        <input type="file" class="form-control" id="upload-dark" accept="image/*">
                        <button class="btn btn-primary mt-2" @click="uploadLogo('dark')">Update Logo Dark</button>
                        </div>
                    </div>
                    </div>
                </div>
                </div>

        </div>

        
    </div>
</div>

<!--**********************************
    Content body end
***********************************-->        
</template>