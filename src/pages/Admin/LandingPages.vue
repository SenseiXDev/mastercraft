<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import supabase from '../../lib/supabaseClient.js';

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

const pages = ref([])
const formMode = ref('create') // 'create' or 'edit'
const currentPageId = ref(null)

// Form data
const pagename = ref('')
const pagedescription = ref('')
const pageurl = ref('')
const parent_id = ref(null)
const isDropdownParent = ref(false)
const sort_order = ref(0)

const fetchPages = async () => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('sort_order', { ascending: true })

  if (!error) pages.value = data
  else $notiflix.Notify.failure('Failed to fetch pages')
}

onMounted(fetchPages)

const resetForm = () => {
  pagename.value = ''
  pagedescription.value = ''
  pageurl.value = ''
  parent_id.value = null
  isDropdownParent.value = false
  sort_order.value = 0
  currentPageId.value = null
  formMode.value = 'create'
}

const createPage = async () => {
  if (!pagename.value) return $notiflix.Notify.failure('Page name required')
  if (!isDropdownParent.value && !pageurl.value)
    return $notiflix.Notify.failure('URL required for non-dropdowns')

  $notiflix.Loading.dots('Saving...')

  const payload = {
    pagename: pagename.value,
    pagedescription: pagedescription.value,
    pageurl: isDropdownParent.value ? null : pageurl.value,
    parent_id: isDropdownParent.value ? null : parent_id.value || null,
    sort_order: sort_order.value || 0,
  }

  const { error } = await supabase.from('pages').insert([payload])
  $notiflix.Loading.remove()

  if (error) return $notiflix.Notify.failure('Error saving page')

  $notiflix.Notify.success('Page created')
  resetForm()
  fetchPages()
}

const editPage = async () => {
  if (!currentPageId.value) return
  $notiflix.Loading.dots('Updating...')

  const payload = {
    pagename: pagename.value,
    pagedescription: pagedescription.value,
    pageurl: isDropdownParent.value ? null : pageurl.value,
    parent_id: isDropdownParent.value ? null : parent_id.value || null,
    sort_order: sort_order.value || 0,
  }

  const { error } = await supabase
    .from('pages')
    .update(payload)
    .eq('id', currentPageId.value)

  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Update failed')

  $notiflix.Notify.success('Page updated')
  resetForm()
  fetchPages()
}

const startEdit = (page) => {
  formMode.value = 'edit'
  currentPageId.value = page.id
  pagename.value = page.pagename
  pagedescription.value = page.pagedescription
  pageurl.value = page.pageurl
  parent_id.value = page.parent_id
  isDropdownParent.value = !page.pageurl
  sort_order.value = page.sort_order
}

const deletePage = async (id) => {
  if (!confirm('Delete this page?')) return

  const { error } = await supabase.from('pages').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')

  $notiflix.Notify.success('Page deleted')
  fetchPages()
}

const saveSortOrders = async () => {
  const updates = pages.value.map((p) => ({
    id: p.id,
    sort_order: p.sort_order || 0,
  }))

  for (const item of updates) {
    await supabase.from('pages').update({ sort_order: item.sort_order }).eq('id', item.id)
  }

  $notiflix.Notify.success('Sort order saved')
  fetchPages()
}

const getParentName = (id) => {
  const parent = pages.value.find((p) => p.id === id)
  return parent ? parent.pagename : '-'
}
</script>

<template>
     <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style=" height:100vh;">
      
      
 
  <div class="container mt-4">
    <h4>{{ formMode === 'edit' ? 'Edit Page' : 'Create New Page' }}</h4>
    <div class="card p-3 mb-4">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label>Page Name</label>
          <input v-model="pagename" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label>Page Description</label>
          <input v-model="pagedescription" class="form-control" />
        </div>
        <div class="col-md-6 mb-3">
          <label>Is Dropdown Parent?</label>
          <select v-model="isDropdownParent" class="form-control">
            <option :value="false">No</option>
            <option :value="true">Yes</option>
          </select>
        </div>
        <div class="col-md-6 mb-3" v-if="!isDropdownParent">
          <label>Page URL</label>
          <input v-model="pageurl" class="form-control" />
        </div>
        <div class="col-md-6 mb-3" v-if="!isDropdownParent">
          <label>Parent Page (optional)</label>
          <select v-model="parent_id" class="form-control">
            <option :value="null">None</option>
            <option v-for="page in pages" :key="page.id" :value="page.id">
              {{ page.pagename }}
            </option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label>Sort Order</label>
          <input type="number" class="form-control" v-model="sort_order" />
        </div>

        <div class="col-12">
          <button
            class="btn btn-primary me-2"
            @click="formMode === 'edit' ? editPage() : createPage()"
          >
            {{ formMode === 'edit' ? 'Update Page' : 'Create Page' }}
          </button>
          <button class="btn btn-secondary" @click="resetForm" v-if="formMode === 'edit'">Cancel</button>
        </div>
      </div>
    </div>

    <h5>Navigation Pages</h5>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Page Name</th>
          <th>URL</th>
          <th>Parent</th>
          <th>Sort</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="page in pages" :key="page.id">
          <td>{{ page.pagename }}</td>
          <td>{{ page.pageurl || '-' }}</td>
          <td>{{ getParentName(page.parent_id) }}</td>
          <td>
            <input
              type="number"
              class="form-control form-control-sm"
              v-model="page.sort_order"
              style="width: 80px"
            />
          </td>
          <td>
            <button class="btn btn-sm btn-info me-1" @click="startEdit(page)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deletePage(page.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <button class="btn btn-success mt-2" @click="saveSortOrders">Save Sort Order</button>
  </div>


  </div>
  </div>
</div>
</template>
