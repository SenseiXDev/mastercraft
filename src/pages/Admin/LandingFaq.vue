<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import supabase from '../../lib/supabaseClient.js'

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

const faqs = ref([])
const totalCount = ref(0)
const perPage = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

const formMode = ref('create')
const currentId = ref(null)

const title = ref('')
const description = ref('') // rich text or plain text

const fetchTotalCount = async () => {
  const { count, error } = await supabase
    .from('faq')
    .select('*', { count: 'exact', head: true })
  if (error) {
    $notiflix.Notify.failure('Failed to get total count')
    return
  }
  totalCount.value = count
}

const fetchFaqs = async () => {
  const from = (currentPage.value - 1) * perPage
  const to = from + perPage - 1

  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .order('datecreated', { ascending: false })
    .range(from, to)

  if (error) {
    $notiflix.Notify.failure('Failed to load FAQs')
    return
  }
  faqs.value = data
}

const loadPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchFaqs()
}

const resetForm = () => {
  title.value = ''
  description.value = ''
  currentId.value = null
  formMode.value = 'create'
}

const createFaq = async () => {
  if (!title.value || !description.value) {
    return $notiflix.Notify.failure('Title and description are required')
  }
  $notiflix.Loading.dots('Creating FAQ...')
  const { error } = await supabase.from('faq').insert([
    {
      title: title.value,
      description: description.value,
    },
  ])
  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Create failed')
  $notiflix.Notify.success('FAQ created')
  resetForm()
  await fetchTotalCount()
  await loadPage(1)
}

const startEdit = (record) => {
  formMode.value = 'edit'
  currentId.value = record.id
  title.value = record.title
  description.value = record.description
}

const updateFaq = async () => {
  if (!currentId.value) return
  if (!title.value || !description.value) {
    return $notiflix.Notify.failure('Title and description are required')
  }
  $notiflix.Loading.dots('Updating FAQ...')
  const { error } = await supabase
    .from('faq')
    .update({
      title: title.value,
      description: description.value,
    })
    .eq('id', currentId.value)
  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Update failed')
  $notiflix.Notify.success('FAQ updated')
  resetForm()
  await fetchFaqs()
}

const deleteFaq = async (id) => {
  if (!confirm('Delete this FAQ?')) return
  const { error } = await supabase.from('faq').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('FAQ deleted')
  await fetchTotalCount()
  if (faqs.value.length === 1 && currentPage.value > 1) {
    await loadPage(currentPage.value - 1)
  } else {
    await fetchFaqs()
  }
}

onMounted(async () => {
  await fetchTotalCount()
  await fetchFaqs()
})
</script>

<template>
  <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style="min-height: 100vh;">
        <h4>{{ formMode === 'edit' ? 'Edit FAQ' : 'Add FAQ' }}</h4>
        <div class="card p-3 mb-4">
          <div class="row">
            <div class="col-md-12 mb-3">
              <label>Title</label>
              <input v-model="title" type="text" class="form-control" placeholder="FAQ Title" />
            </div>

            <div class="col-md-12 mb-3">
              <label>Description</label>
              <textarea
                v-model="description"
                rows="6"
                class="form-control"
                placeholder="FAQ Description (rich text can be integrated)"
              ></textarea>
            </div>

            <div class="col-12">
              <button
                class="btn btn-primary me-2"
                @click="formMode === 'edit' ? updateFaq() : createFaq()"
              >
                {{ formMode === 'edit' ? 'Update FAQ' : 'Add FAQ' }}
              </button>
              <button class="btn btn-secondary" @click="resetForm" v-if="formMode === 'edit'">Cancel</button>
            </div>
          </div>
        </div>

        <h5>FAQ List</h5>
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Title</th>
              <th>Description</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(faq, index) in faqs" :key="faq.id">
              <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ faq.title }}</td>
              <td v-html="faq.description.length > 100 ? faq.description.substring(0, 100) + '...' : faq.description"></td>
              <td>{{ new Date(faq.datecreated).toLocaleString() }}</td>
              <td>{{ new Date(faq.dateupdated).toLocaleString() }}</td>
              <td>
                <button class="btn btn-sm btn-info me-1" @click="startEdit(faq)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteFaq(faq.id)">Delete</button>
              </td>
            </tr>
            <tr v-if="faqs.length === 0">
              <td colspan="6" class="text-center">No FAQs found.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <nav aria-label="Page navigation example">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link p-4 w-100" @click="loadPage(currentPage - 1)" :disabled="currentPage === 1">
                Previous
              </button>
            </li>

            <li class="page-item disabled">
              <span class="page-link p-4 w-100">
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
