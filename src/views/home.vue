<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Home 🏠</ion-title>
        <IonButton slot="end" color="danger" @click="showLogoutAlert = true">Log out</IonButton>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">My Posts</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Menampilkan Posts -->
      <ion-card v-for="data in posts" :key="data.id_post">
        <ion-card-header>
          <ion-card-title>{{ data.Head }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p class="text-gray-600 mb-4">{{ data.Body }}</p>
          <div>
            <!-- TIDAK PERLU ID USER di URL, hanya ID POST saja -->
            <IonButton color="warning" @click="router.push(`/tabs/edit/${data.id_post}`)">Edit</IonButton>
            <!-- Menggunakan DELETE endpoint yang telah disesuaikan -->
            <IonButton color="danger" @click="deletePost(data.id_post)">Hapus</IonButton>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Tombol Fab Add -->
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <!-- TIDAK PERLU ID USER di URL -->
        <IonFabButton @click="router.push(`/tabs/add`)">
          <IonIcon :icon="addCircle"></IonIcon>
        </IonFabButton>
      </IonFab>

      <!-- 1. Alert Modal untuk Logout -->
      <ion-alert
        :is-open="showLogoutAlert"
        header="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari akun?"
        :buttons="logoutAlertButtons"
        @didDismiss="showLogoutAlert = false"
      ></ion-alert>

      <!-- 2. Toast untuk pesan sukses/gagal -->
      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :color="toastColor"
        :duration="3000"
        @didDismiss="showToast = false"
      ></ion-toast>
      
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, 
  IonCardTitle, IonButton, IonFab, IonIcon, IonFabButton, IonAlert, IonToast 
} from '@ionic/vue';
import { addCircle } from 'ionicons/icons';
import { ref, onMounted } from "vue";
import axios from "axios";
import router from '@/router';

// State untuk UI
const posts = ref<any[]>([]);
const showLogoutAlert = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref<'success' | 'danger'>('success');

// Base URL (penting untuk konsistensi)
const API_BASE_URL = "https://fesnuk-mobile.vercel.app";

// --- FUNGSI TOAST ---
const showNotification = (message: string, color: 'success' | 'danger') => {
  toastMessage.value = message;
  toastColor.value = color;
  showToast.value = true;
};

// --- FUNGSI UTAMA ---

const fetchPosts = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    showNotification("Token tidak ditemukan, silakan login ulang.", 'danger');
    router.push("/tabs/login");
    return;
  }

  try {
    // API ENDPOINT SUDAH DIBUAT HANYA /home (tanpa ID di URL)
    const res = await axios.get(`${API_BASE_URL}/home`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    posts.value = res.data.content;
  } catch (e: any) {
    const errorMessage = e.response?.data?.message || e.message;
    console.error("Error API /home:", errorMessage);
    showNotification(`Gagal memuat post: ${errorMessage}`, 'danger');
  }
};

const deletePost = async (id_post: number) => {
  // Mengganti confirm() native dengan Ionic Alert jika diperlukan
  if (!window.confirm("Apakah Anda yakin ingin menghapus post ini?")) {
      return;
  }
  
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
      showNotification("Sesi habis, silakan login.", 'danger');
      router.push("/tabs/login");
      return;
  }

  try {
      // Menggunakan method DELETE dan endpoint yang disesuaikan
      await axios.delete(`${API_BASE_URL}/delete/${id_post}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      showNotification("Post berhasil dihapus.", 'success');
      // Muat ulang daftar post setelah penghapusan
      await fetchPosts(); 

  } catch (e: any) {
      const errorMessage = e.response?.data?.message || e.message;
      console.error("Error API /delete:", errorMessage);
      showNotification(`Gagal menghapus post: ${errorMessage}`, 'danger');
  }
};

// Logika Logout
const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/tabs/login');
};

const logoutAlertButtons = [
  { text: 'Batal', role: 'cancel' },
  { text: 'Ya', role: 'confirm', handler: handleLogout },
];

onMounted(() => {
  fetchPosts();
});
</script>