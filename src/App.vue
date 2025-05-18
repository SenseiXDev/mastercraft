<script setup>
import { onMounted , getCurrentInstance} from 'vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { RouterView } from 'vue-router';
import Header from './components/Header.vue';
import Sidebar from './components/Sidebar.vue';
const route = useRoute()

// Hide sidebar on these routes
const noSidebarRoutes = ['/', '/verifyotp']

const showSidebar = computed(() => !noSidebarRoutes.includes(route.path))
</script>

<template>
    <Header v-if="showSidebar"/>
    <Sidebar v-if="showSidebar"/>
<RouterView/>
</template>
