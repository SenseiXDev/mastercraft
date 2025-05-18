<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import supabase from '../../lib/supabaseClient.js';

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

// Customers data
const customers = ref([])
const totalCount = ref(0)

// Pagination
const perPage = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

// Form data
const formMode = ref('create') // or 'edit'
const currentId = ref(null)

const company_name = ref('')
const description = ref('')
const logo_url = ref('')

// Fetch total count of customers (for pagination)
const fetchTotalCount = async () => {
  const { count, error } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })

  if (error) {
    $notiflix.Notify.failure('Failed to get total count')
    return
  }
  totalCount.value = count
}

// Fetch customers with limit & offset
const fetchCustomers = async () => {
  const from = (currentPage.value - 1) * perPage
  const to = from + perPage - 1

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('datecreated', { ascending: false })
    .range(from, to)

  if (error) {
    $notiflix.Notify.failure('Failed to load customers')
    return
  }
  customers.value = data
}

const loadPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchCustomers()
}

onMounted(async () => {
  await fetchTotalCount()
  await fetchCustomers()
})

const resetForm = () => {
  company_name.value = ''
  description.value = ''
  logo_url.value = ''
  currentId.value = null
  formMode.value = 'create'
}

const createCustomer = async () => {
  if (!company_name.value) return $notiflix.Notify.failure('Company name is required')

  $notiflix.Loading.dots('Creating customer...')
  const { error } = await supabase.from('customers').insert([
    {
      company_name: company_name.value,
      description: description.value,
      logo_url: logo_url.value,
    },
  ])
  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Create failed')

  $notiflix.Notify.success('Customer created')
  resetForm()
  await fetchTotalCount()
  await loadPage(1)
}

const startEdit = (customer) => {
  formMode.value = 'edit'
  currentId.value = customer.id
  company_name.value = customer.company_name
  description.value = customer.description
  logo_url.value = customer.logo_url
}

const updateCustomer = async () => {
  if (!currentId.value) return
  if (!company_name.value) return $notiflix.Notify.failure('Company name is required')

  $notiflix.Loading.dots('Updating customer...')
  const { error } = await supabase
    .from('customers')
    .update({
      company_name: company_name.value,
      description: description.value,
      logo_url: logo_url.value,
    })
    .eq('id', currentId.value)

  $notiflix.Loading.remove()
  if (error) return $notiflix.Notify.failure('Update failed')

  $notiflix.Notify.success('Customer updated')
  resetForm()
  await fetchCustomers()
}

const deleteCustomer = async (id) => {
  if (!confirm('Delete this customer?')) return
  const { error } = await supabase.from('customers').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Customer deleted')
  await fetchTotalCount()
  // reload current page but ensure it is valid
  if (customers.value.length === 1 && currentPage.value > 1) {
    await loadPage(currentPage.value - 1)
  } else {
    await fetchCustomers()
  }
}
</script>

<template>
        <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style=" height:100vh;">

     
     

        <div class="container mt-4">
    <h4>{{ formMode === 'edit' ? 'Edit Customer' : 'Add Customer' }}</h4>
    <div class="card p-3 mb-4">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label>Company Name</label>
          <input v-model="company_name" type="text" class="form-control" placeholder="Company Name" />
        </div>
        <div class="col-md-6 mb-3">
          <label>Description</label>
          <input v-model="description" type="text" class="form-control" placeholder="Description" />
        </div>
        <div class="col-md-6 mb-3">
          <label>Logo URL</label>
          <input v-model="logo_url" type="text" class="form-control" placeholder="Logo URL" />
        </div>

        <div class="col-12">
          <button
            class="btn btn-primary me-2"
            @click="formMode === 'edit' ? updateCustomer() : createCustomer()"
          >
            {{ formMode === 'edit' ? 'Update Customer' : 'Add Customer' }}
          </button>
          <button class="btn btn-secondary" @click="resetForm" v-if="formMode === 'edit'">Cancel</button>
        </div>
      </div>
    </div>

    <h5>Customers List</h5>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>S/N</th>
          <th>Company Name</th>
          <th>Description</th>
          <th>Logo</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer, index) in customers" :key="customer.id">
          <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
          <td>{{ customer.company_name }}</td>
          <td>{{ customer.description }}</td>
          <td>
            <img
              v-if="customer.logo_url"
              :src="customer.logo_url"
              alt="Logo"
              style="max-height: 50px; max-width: 100px"
            />
            <span v-else>-</span>
          </td>
          <td>{{ new Date(customer.datecreated).toLocaleString() }}</td>
          <td>{{ new Date(customer.dateupdated).toLocaleString() }}</td>
          <td>
            <button class="btn btn-sm btn-info me-1" @click="startEdit(customer)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
          </td>
        </tr>
        <tr v-if="customers.length === 0">
          <td colspan="7" class="text-center">No customers found.</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <nav aria-label="Page navigation example">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link p-4 w-100" @click="loadPage(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        </li>

        <li class="page-item disabled">
          <span class="page-link p-4 w-100">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link p-4 w-100" @click="loadPage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
        </li>
      </ul>
    </nav>
  </div>



  </div>
  </div>
  </div>
</template>
