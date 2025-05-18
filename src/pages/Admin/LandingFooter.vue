<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue'
import supabase from '../../lib/supabaseClient.js'

const { proxy } = getCurrentInstance()
const $notiflix = proxy.$notiflix

// Tabs
const activeTab = ref('sections')

// Sections
const sections = ref([])
const sectionTitle = ref('')
const editingSectionId = ref(null)

const fetchSections = async () => {
  const { data, error } = await supabase.from('footer_sections').select('*').order('datecreated', { ascending: false })
  if (error) return $notiflix.Notify.failure('Failed to fetch sections')
  sections.value = data
}

const saveSection = async () => {
  if (!sectionTitle.value) return $notiflix.Notify.failure('Title required')

  $notiflix.Loading.dots('Saving section...')
  if (editingSectionId.value) {
    const { error } = await supabase
      .from('footer_sections')
      .update({ title: sectionTitle.value })
      .eq('id', editingSectionId.value)
    if (error) return $notiflix.Notify.failure('Update failed')
    $notiflix.Notify.success('Section updated')
  } else {
    const { error } = await supabase.from('footer_sections').insert([{ title: sectionTitle.value }])
    if (error) return $notiflix.Notify.failure('Create failed')
    $notiflix.Notify.success('Section added')
  }

  $notiflix.Loading.remove()
  resetSectionForm()
  await fetchSections()
}

const editSection = (section) => {
  editingSectionId.value = section.id
  sectionTitle.value = section.title
}

const deleteSection = async (id) => {
  if (!confirm('Delete this section?')) return
  const { error } = await supabase.from('footer_sections').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Section deleted')
  await fetchSections()
}

const resetSectionForm = () => {
  editingSectionId.value = null
  sectionTitle.value = ''
}

// Footer Links
const links = ref([])
const linkTitle = ref('')
const linkUrl = ref('')
const selectedSectionId = ref('')
const editingLinkId = ref(null)

const fetchLinks = async () => {
  const { data, error } = await supabase
    .from('footer_links')
    .select('*, footer_sections(title)')
    .order('datecreated', { ascending: false })
  if (error) return $notiflix.Notify.failure('Failed to fetch links')
  links.value = data
}

const saveLink = async () => {
  if (!linkTitle.value || !linkUrl.value || !selectedSectionId.value)
    return $notiflix.Notify.failure('All fields required')

  $notiflix.Loading.dots('Saving link...')
  if (editingLinkId.value) {
    const { error } = await supabase
      .from('footer_links')
      .update({ title: linkTitle.value, url: linkUrl.value, section_id: selectedSectionId.value })
      .eq('id', editingLinkId.value)
    if (error) return $notiflix.Notify.failure('Update failed')
    $notiflix.Notify.success('Link updated')
  } else {
    const { error } = await supabase.from('footer_links').insert([
      { title: linkTitle.value, url: linkUrl.value, section_id: selectedSectionId.value },
    ])
    if (error) return $notiflix.Notify.failure('Create failed')
    $notiflix.Notify.success('Link added')
  }

  $notiflix.Loading.remove()
  resetLinkForm()
  await fetchLinks()
}

const editLink = (link) => {
  editingLinkId.value = link.id
  linkTitle.value = link.title
  linkUrl.value = link.url
  selectedSectionId.value = link.section_id
}

const deleteLink = async (id) => {
  if (!confirm('Delete this link?')) return
  const { error } = await supabase.from('footer_links').delete().eq('id', id)
  if (error) return $notiflix.Notify.failure('Delete failed')
  $notiflix.Notify.success('Link deleted')
  await fetchLinks()
}

const resetLinkForm = () => {
  editingLinkId.value = null
  linkTitle.value = ''
  linkUrl.value = ''
  selectedSectionId.value = ''
}

onMounted(async () => {
  await fetchSections()
  await fetchLinks()
})
</script>

<template>
  <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style="min-height: 100vh;">
        <div class="mb-4">
          <button class="btn btn-outline-primary me-2" @click="activeTab = 'sections'">Manage Sections</button>
          <button class="btn btn-outline-primary" @click="activeTab = 'links'">Manage Footer Links</button>
        </div>

        <!-- Sections Tab -->
        <div v-if="activeTab === 'sections'">
          <h4>{{ editingSectionId ? 'Edit Section' : 'Add Section' }}</h4>
          <div class="mb-3">
            <input v-model="sectionTitle" class="form-control mb-2" placeholder="Section Title" />
            <button class="btn btn-primary me-2" @click="saveSection">
              {{ editingSectionId ? 'Update' : 'Add' }}
            </button>
            <button class="btn btn-secondary" v-if="editingSectionId" @click="resetSectionForm">Cancel</button>
          </div>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Title</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(section, index) in sections" :key="section.id">
                <td>{{ index + 1 }}</td>
                <td>{{ section.title }}</td>
                <td>{{ new Date(section.datecreated).toLocaleString() }}</td>
                <td>{{ new Date(section.dateupdated).toLocaleString() }}</td>
                <td>
                  <button class="btn btn-sm btn-info me-1" @click="editSection(section)">Edit</button>
                  <button class="btn btn-sm btn-danger" @click="deleteSection(section.id)">Delete</button>
                </td>
              </tr>
              <tr v-if="sections.length === 0">
                <td colspan="5" class="text-center">No sections found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Links Tab -->
        <div v-if="activeTab === 'links'">
          <h4>{{ editingLinkId ? 'Edit Footer Link' : 'Add Footer Link' }}</h4>
          <div class="row mb-3">
            <div class="col-md-4 mb-2">
              <input v-model="linkTitle" class="form-control" placeholder="Link Title" />
            </div>
            <div class="col-md-4 mb-2">
              <input v-model="linkUrl" class="form-control" placeholder="Link URL" />
            </div>
            <div class="col-md-4 mb-2">
              <select v-model="selectedSectionId" class="form-control">
                <option value="" disabled>Select Section</option>
                <option v-for="section in sections" :key="section.id" :value="section.id">{{ section.title }}</option>
              </select>
            </div>
            <div class="col-12">
              <button class="btn btn-primary me-2" @click="saveLink">
                {{ editingLinkId ? 'Update' : 'Add' }}
              </button>
              <button class="btn btn-secondary" v-if="editingLinkId" @click="resetLinkForm">Cancel</button>
            </div>
          </div>

          <table class="table table-bordered">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Title</th>
                <th>URL</th>
                <th>Section</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(link, index) in links" :key="link.id">
                <td>{{ index + 1 }}</td>
                <td>{{ link.title }}</td>
                <td>{{ link.url }}</td>
                <td>{{ link.footer_sections?.title || '-' }}</td>
                <td>{{ new Date(link.datecreated).toLocaleString() }}</td>
                <td>{{ new Date(link.dateupdated).toLocaleString() }}</td>
                <td>
                  <button class="btn btn-sm btn-info me-1" @click="editLink(link)">Edit</button>
                  <button class="btn btn-sm btn-danger" @click="deleteLink(link.id)">Delete</button>
                </td>
              </tr>
              <tr v-if="links.length === 0">
                <td colspan="7" class="text-center">No footer links found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
