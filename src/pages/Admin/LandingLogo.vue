<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import supabase from '../../lib/supabaseClient.js';

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

const logoLight = ref('')
const logoDark = ref('')

// Convert File to Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
  })
}

// Upload Logo Function
const uploadLogo = async (type) => {
  const fileInput = document.getElementById(`upload-${type}`)
  const file = fileInput.files[0]
  if (!file) return $notiflix.Report.failure("Notification",'Please choose a file.')

  $notiflix.Loading.dots('Uploading...')

  try {
    const base64 = await toBase64(file)

    const response = await fetch('https://base64api.zowasel.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagefile: base64 })
    })

    const result = await response.json()
    if (!result.data) throw new Error('Upload failed.')

    const newUrl = result.data

    // Update Supabase
    const { error } = await supabase
      .from('logos')
      .update({ logourl: newUrl })
      .eq('logoname', type)

    if (error) throw error

    // Update local UI
    if (type === 'light') {
      logoLight.value = newUrl
    } else {
      logoDark.value = newUrl
    }

    $notiflix.Report.success("Notification",`Logo ${type} updated successfully.`)
  } catch (err) {
    console.error(err)
    $notiflix.Report.failure("Notification",`Failed to update logo: ${err.message}`)
  } finally {
    $notiflix.Loading.remove()
  }
}

// Load existing logos on mount
onMounted(async () => {
  const { data, error } = await supabase.from('logos').select('*')
  if (error) {
    $notiflix.Report.failure("Notification",'Failed to load logos')
    return
  }

  const light = data.find(l => l.logoname === 'light')
  const dark = data.find(l => l.logoname === 'dark')

  logoLight.value = light?.logourl || ''
  logoDark.value = dark?.logourl || ''
})
</script>

<template>
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
                  <img
                    :src="logoLight"
                    alt="Logo Light"
                    id="preview-light"
                    class="img-fluid mb-3"
                      style="max-height: 150px; background-color: #f1f1f1; border: 1px solid #ccc;"
                  />
                  <input
                    type="file"
                    class="form-control"
                    id="upload-light"
                    accept="image/*"
                  />
                  <button
                    class="btn btn-primary mt-2"
                    @click="uploadLogo('light')"
                  >
                    Update Logo Light
                  </button>
                </div>
              </div>
            </div>

            <!-- Logo Dark -->
            <div class="col-md-6 mb-4">
              <div class="card">
                <div class="card-header">Logo Dark</div>
                <div class="card-body text-center">
                  <img
                    :src="logoDark"
                    alt="Logo Dark"
                    id="preview-dark"
                    class="img-fluid mb-3"
                    style="max-height: 150px; background-color: #f1f1f1; border: 1px solid #ccc;"
                  />
                  <input
                    type="file"
                    class="form-control"
                    id="upload-dark"
                    accept="image/*"
                  />
                  <button
                    class="btn btn-primary mt-2"
                    @click="uploadLogo('dark')"
                  >
                    Update Logo Dark
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  </div>
</template>
