// Vue 3 Admin Chat Page (Vue + Supabase)
<script setup>
import { ref, onMounted } from 'vue';
import supabase from '../../lib/supabaseClient.js';

const users = ref([]);
const selectedUserId = ref(null);
const messages = ref([]);
const replyText = ref('');

const loadUsers = async () => {
  const { data } = await supabase
    .from('chat_messages')
    .select('user_id, name')
    .order('datecreated', { ascending: false });

  const seen = new Set();
  users.value = data.filter(msg => {
    if (seen.has(msg.user_id)) return false;
    seen.add(msg.user_id);
    return true;
  });
};

const loadMessages = async (user_id) => {
  selectedUserId.value = user_id;
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user_id)
    .order('datecreated', { ascending: true });
  messages.value = data;
};

const sendReply = async () => {
  if (!replyText.value || !selectedUserId.value) return;

  await supabase.from('chat_messages').insert([{
    user_id: selectedUserId.value,
    name: 'Admin',
    is_admin: true,
    message: replyText.value
  }]);
  replyText.value = '';
};

onMounted(async () => {
  await loadUsers();

  supabase.channel('admin-chat')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages'
    }, payload => {
      const msg = payload.new;
      if (msg.user_id === selectedUserId.value) {
        messages.value.push(msg);
      }

      if (!users.value.find(u => u.user_id === msg.user_id)) {
        users.value.unshift({ user_id: msg.user_id, name: msg.name });
      }
    })
    .subscribe();
});
</script>
<template>
      <div class="content-body default-height">
    <div class="container-fluid">
      <div class="card p-4" style=" height:100vh;">
        <div class="container mt-5">
    <div class="row">
      <div class="col-md-4">
        <h5>Users</h5>
        <ul class="list-group">
          <li v-for="user in users" :key="user.user_id" class="list-group-item" @click="loadMessages(user.user_id)">
            {{ user.name }}
          </li>
        </ul>
      </div>
      <div class="col-md-8">
        <h5>Messages</h5>
        <div class="border p-3 mb-3" style="height: 300px; overflow-y: auto;">
          <div v-for="msg in messages" :key="msg.id" class="mb-2">
            <strong>{{ msg.is_admin ? 'Admin' : msg.name }}:</strong> {{ msg.message }}
          </div>
        </div>
        <form @submit.prevent="sendReply">
          <div class="input-group">
            <input v-model="replyText" class="form-control" placeholder="Type a reply...">
            <button class="btn btn-primary" type="submit">Send</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  </div>
  </div>
  </div>
</template>
