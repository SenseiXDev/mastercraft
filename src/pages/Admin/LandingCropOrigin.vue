<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import supabase from '../../lib/supabaseClient.js';

// Access Notiflix from global proxy
const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

// Reactive state
const croporigins = ref([])
const totalCount = ref(0)
const perPage = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

// Form mode and selected record
const formMode = ref('create')
const currentId = ref(null)

// Form fields
const title = ref('')
const content = ref('')
const thumbnail_url = ref('')
const author = ref('')
const tags = ref('') // comma-separated string in form; will split to array on save

// Fetch total count for pagination
const fetchTotalCount = async () => {
  const { count, error } = await supabase
    .from('croporigin')
    .select('*', { count: 'exact', head: true })
  if (error) {
    $notiflix.Notify.failure('Failed to get total count')
    return
  }
  totalCount.value = count
}

// Fetch paginated data
const fetchCropOrigins = async () => {
  const from = (currentPage.value - 1) * perPage
  const to = from + perPage - 1

  const { data, error } = await supabase
    .from('croporigin')
    .select('*')
    .order('datecreated', { ascending: false })
    .range(from, to)

  if (error) {
    $notiflix.Notify.failure('Failed to load crop origins')
    return
  }
  croporigins.value = data
}

// Load a specific page
const loadPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchCropOrigins()
}

// Reset form fields
const resetForm = () => {
  title.value = ''
  content.value = ''
  thumbnail_url.value = ''
  author.value = ''
  tags.value = ''
  currentId.value = null
  formMode.value = 'create'
}

// Create new record
const createCropOrigin = async () => {
  if (!title.value || !content.value) {
    return $notiflix.Notify.failure('Title and content are required')
  }
  $notiflix.Loading.dots('Creating crop origin...')
  const { error } = await supabase.from('croporigin').insert([
    {
      title: title.value,
      content: content.value,
      thumbnail_url: thumbnail_url.value,
      author: author.value,
      tags: tags.value ? tags.value.split(',').map(t => t.trim()) : [],
    },
  ])
  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Create failed')
  $notiflix.Notify.success('Crop origin created')
  resetForm()
  await fetchTotalCount()
  await loadPage(1)
}

// Start editing a record
const startEdit = (record) => {
  formMode.value = 'edit'
  currentId.value = record.id
  title.value = record.title
  content.value = record.content
  thumbnail_url.value = record.thumbnail_url || ''
  author.value = record.author || ''
  tags.value = record.tags ? record.tags.join(', ') : ''
}

// Update existing record
const updateCropOrigin = async () => {
  if (!currentId.value) return
  if (!title.value || !content.value) {
    return $notiflix.Notify.failure('Title and content are required')
  }
  $notiflix.Loading.dots('Updating crop origin...')
  const { error } = await supabase
    .from('croporigin')
    .update({
      title: title.value,
      content: content.value,
      thumbnail_url: thumbnail_url.value,
      author: author.value,
      tags: tags.value ? tags.value.split(',').map(t => t.trim()) : [],
    })
    .eq('id', currentId.value)
  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Update failed')
  $notiflix.Notify.success('Crop origin updated')
  resetForm()
  await fetchCropOrigins()
}

// Delete record
const deleteCropOrigin = async (id) => {
  if (!confirm('Delete this crop origin?')) return
  const { error } = await supabase.from('croporigin').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Crop origin deleted')
  await fetchTotalCount()
  if (croporigins.value.length === 1 && currentPage.value > 1) {
    await loadPage(currentPage.value - 1)
  } else {
    await fetchCropOrigins()
  }
}

// Upload thumbnail via base64api
const uploadThumbnail = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = async () => {
    const base64String = reader.result
    try {
      $notiflix.Loading.dots('Uploading image...')
      const response = await fetch('https://base64api.zowasel.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagefile: base64String }),
      })
     
      const data = await response.json()
      $notiflix.Loading.remove()
   
      if (data && data.data) {
        thumbnail_url.value = data.data
        $notiflix.Notify.success('Image uploaded successfully')
      } else {
        $notiflix.Notify.failure('Image upload failed')
      }
    } catch (err) {
      $notiflix.Loading.remove()
      $notiflix.Notify.failure('Image upload error')
    }
  }

  reader.onerror = () => {
    $notiflix.Notify.failure('Error reading file')
  }
}

// On mounted, load data
onMounted(async () => {
  await fetchTotalCount()
  await fetchCropOrigins()
})
</script>

<template>
  <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style="min-height: 100vh;">
        <h4>{{ formMode === 'edit' ? 'Edit Crop Origin' : 'Add Crop Origin' }}</h4>
        <div class="card p-3 mb-4">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label>Title</label>
              <input v-model="title" type="text" class="form-control" placeholder="Title" />
            </div>

            <div class="col-md-6 mb-3">
              <label>Author</label>
              <input v-model="author" type="text" class="form-control" placeholder="Author" />
            </div>

            <div class="col-md-12 mb-3">
              <label>Content</label>
              <textarea id="ckeditor"
                v-model="content"
                rows="6"
                class="form-control"
                placeholder="Rich text content here (you can replace this with a rich text editor)"
              ></textarea>

              
            </div>

            <div class="col-md-6 mb-3">
              <label>Thumbnail URL</label>
              <input v-model="thumbnail_url" type="text" class="form-control" placeholder="Thumbnail URL" />
            </div>

            <div class="col-md-6 mb-3">
              <label>Upload Thumbnail Image</label>
              <input type="file" @change="uploadThumbnail" accept="image/*" class="form-control" />
            </div>

            <div class="col-md-12 mb-3">
              <label>Tags (comma separated)</label>
              <input v-model="tags" type="text" class="form-control" placeholder="e.g. maize,organic,corn" />
            </div>

            <div class="col-12">
              <button
                class="btn btn-primary me-2"
                @click="formMode === 'edit' ? updateCropOrigin() : createCropOrigin()"
              >
                {{ formMode === 'edit' ? 'Update Crop Origin' : 'Add Crop Origin' }}
              </button>
              <button class="btn btn-secondary" @click="resetForm" v-if="formMode === 'edit'">Cancel</button>
            </div>
          </div>
        </div>

        <h5>Crop Origins List</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Title</th>
              <th>Author</th>
              <th>Thumbnail</th>
              <th>Tags</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in croporigins" :key="record.id">
              <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ record.title }}</td>
              <td>{{ record.author || '-' }}</td>
              <td>
                <img
                  v-if="record.thumbnail_url"
                  :src="record.thumbnail_url"
                  alt="Thumbnail"
                  style="max-height: 50px; max-width: 100px"
                />
                <span v-else>-</span>
              </td>
              <td>{{ record.tags ? record.tags.join(', ') : '-' }}</td>
              <td>{{ new Date(record.datecreated).toLocaleString() }}</td>
              <td>{{ new Date(record.dateupdated).toLocaleString() }}</td>
              <td>
                <button class="btn btn-sm btn-info me-1" @click="startEdit(record)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteCropOrigin(record.id)">Delete</button>
              </td>
            </tr>
            <tr v-if="croporigins.length === 0">
              <td colspan="8" class="text-center">No crop origins found.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Controls -->
        <nav aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link  p-4 w-100" @click="loadPage(currentPage - 1)" :disabled="currentPage === 1">
                Previous
              </button>
            </li>

            <li class="page-item disabled">
              <span class="page-link  p-4 w-100">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link p-4 w-100" @click="loadPage(currentPage + 1)" :disabled="currentPage === totalPages">
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>
