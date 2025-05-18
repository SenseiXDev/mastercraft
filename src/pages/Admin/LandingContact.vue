<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import supabase from '../../lib/supabaseClient.js'

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

const contacts = ref([])
const totalCount = ref(0)
const perPage = 5
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(totalCount.value / perPage))

const fetchTotalCount = async () => {
  const { count, error } = await supabase
    .from('contactus')
    .select('*', { count: 'exact', head: true })

  if (error) return $notiflix.Notify.failure('Failed to get total count')
  totalCount.value = count
}

const fetchContacts = async () => {
  const from = (currentPage.value - 1) * perPage
  const to = from + perPage - 1

  const { data, error } = await supabase
    .from('contactus')
    .select('*')
    .order('datecreated', { ascending: false })
    .range(from, to)

  if (error) return $notiflix.Notify.failure('Failed to load contacts')
  contacts.value = data
}

const loadPage = async (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await fetchContacts()
}

onMounted(async () => {
  await fetchTotalCount()
  await fetchContacts()
})

const deleteContact = async (id) => {
  if (!confirm('Delete this message?')) return
  const { error } = await supabase.from('contactus').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Message deleted')
  await fetchTotalCount()
  if (contacts.value.length === 1 && currentPage.value > 1) {
    await loadPage(currentPage.value - 1)
  } else {
    await fetchContacts()
  }
}
</script>

<template>
  <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style="min-height: 100vh;">
        <div class="container mt-4">
          <h4>Contact Us Messages</h4>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(msg, index) in contacts" :key="msg.id">
                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                <td>{{ msg.name }}</td>
                <td>{{ msg.email }}</td>
                <td>{{ msg.phone || '-' }}</td>
                <td>{{ msg.subject || '-' }}</td>
                <td>{{ msg.message }}</td>
                <td>{{ new Date(msg.datecreated).toLocaleString() }}</td>
                <td>{{ new Date(msg.dateupdated).toLocaleString() }}</td>
                <td>
                  <button class="btn btn-sm btn-danger" @click="deleteContact(msg.id)">Delete</button>
                </td>
              </tr>
              <tr v-if="contacts.length === 0">
                <td colspan="9" class="text-center">No messages found.</td>
              </tr>
            </tbody>
          </table>

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
