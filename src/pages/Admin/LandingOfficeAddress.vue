<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import supabase from '../../lib/supabaseClient.js'

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

const addresses = ref([])
const totalCount = ref(0)
const perPage = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

const formMode = ref('create')
const currentId = ref(null)
const country = ref('')
const description = ref('')

const fetchTotalCount = async () => {
  const { count, error } = await supabase
    .from('office_addresses')
    .select('*', { count: 'exact', head: true })

  if (error) return $notiflix.Notify.failure('Failed to get total count')
  totalCount.value = count
}

const fetchAddresses = async () => {
  const from = (currentPage.value - 1) * perPage
  const to = from + perPage - 1

  const { data, error } = await supabase
    .from('office_addresses')
    .select('*')
    .order('datecreated', { ascending: false })
    .range(from, to)

  if (error) return $notiflix.Notify.failure('Failed to load addresses')
  addresses.value = data
}

const loadPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchAddresses()
}

onMounted(async () => {
  await fetchTotalCount()
  await fetchAddresses()
})

const resetForm = () => {
  country.value = ''
  description.value = ''
  currentId.value = null
  formMode.value = 'create'
}

const createAddress = async () => {
  if (!country.value) return $notiflix.Notify.failure('Country is required')

  $notiflix.Loading.dots('Adding address...')
  const { error } = await supabase.from('office_addresses').insert([
    { country: country.value, description: description.value },
  ])
  $notiflix.Loading.remove()

  if (error) return $notiflix.Notify.failure('Create failed')

  $notiflix.Notify.success('Address added')
  resetForm()
  await fetchTotalCount()
  await loadPage(1)
}

const startEdit = (address) => {
  formMode.value = 'edit'
  currentId.value = address.id
  country.value = address.country
  description.value = address.description
}

const updateAddress = async () => {
  if (!currentId.value || !country.value) return $notiflix.Notify.failure('Country is required')

  $notiflix.Loading.dots('Updating address...')
  const { error } = await supabase
    .from('office_addresses')
    .update({ country: country.value, description: description.value })
    .eq('id', currentId.value)
  $notiflix.Loading.remove()

  if (error) return $notiflix.Notify.failure('Update failed')

  $notiflix.Notify.success('Address updated')
  resetForm()
  await fetchAddresses()
}

const deleteAddress = async (id) => {
  if (!confirm('Delete this address?')) return
  const { error } = await supabase.from('office_addresses').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Address deleted')
  await fetchTotalCount()
  if (addresses.value.length === 1 && currentPage.value > 1) {
    await loadPage(currentPage.value - 1)
  } else {
    await fetchAddresses()
  }
}
</script>

<template>
      <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style="min-height: 100vh;">


  <div class="container mt-4">
    <h4>{{ formMode === 'edit' ? 'Edit Office Address' : 'Add Office Address' }}</h4>
    <div class="card p-3 mb-4">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label>Country</label>
          <input v-model="country" type="text" class="form-control" placeholder="Country" />
        </div>
        <div class="col-md-6 mb-3">
          <label>Description</label>
          <input v-model="description" type="text" class="form-control" placeholder="Description" />
        </div>
        <div class="col-12">
          <button
            class="btn btn-primary me-2"
            @click="formMode === 'edit' ? updateAddress() : createAddress()"
          >
            {{ formMode === 'edit' ? 'Update Address' : 'Add Address' }}
          </button>
          <button class="btn btn-secondary" @click="resetForm" v-if="formMode === 'edit'">Cancel</button>
        </div>
      </div>
    </div>

    <h5>Office Address List</h5>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>S/N</th>
          <th>Country</th>
          <th>Description</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(address, index) in addresses" :key="address.id">
          <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
          <td>{{ address.country }}</td>
          <td>{{ address.description }}</td>
          <td>{{ new Date(address.datecreated).toLocaleString() }}</td>
          <td>{{ new Date(address.dateupdated).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-info me-1" @click="startEdit(address)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteAddress(address.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="addresses.length === 0">
          <td colspan="6" class="text-center">No addresses found.</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <nav aria-label="Page navigation">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link p-4 w-100" @click="loadPage(currentPage - 1)">Previous</button>
        </li>
        <li class="page-item disabled">
          <span class="page-link p-4 w-100">Page {{ currentPage }} of {{ totalPages }}</span>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link p-4 w-100" @click="loadPage(currentPage + 1)">Next</button>
        </li>
      </ul>
    </nav>
  </div>


  </div>
  </div>
  </div>
</template>
