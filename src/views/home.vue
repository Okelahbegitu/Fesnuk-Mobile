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
      <div v-if="posts.length === 0" class="ion-padding text-center text-gray-500 mt-10">
          <p>Belum ada post yang dibuat.</p>
          <p>Silakan tekan tombol tambah (+) untuk membuat post pertama Anda.</p>
      </div>

      <ion-card v-for="data in posts" :key="data.id_post">
        <ion-card-header>
          <ion-card-title>{{ data.Head }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <p class="text-gray-600 mb-4">{{ data.Body }}</p>
          <div>
            <IonButton color="warning" @click="router.push(`/tabs/edit/${data.id_post}`)">Edit</IonButton>
            <!-- Panggil fungsi konfirmasi delete -->
            <IonButton color="danger" @click="confirmDelete(data.id_post)">Hapus</IonButton> 
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Tombol Fab Add -->
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
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

      <!-- 2. Alert Modal untuk Konfirmasi Hapus -->
      <ion-alert
        :is-open="showDeleteAlert"
        header="Konfirmasi Hapus"
        message="Anda yakin ingin menghapus post ini secara permanen?"
        :buttons="deleteAlertButtons"
        @didDismiss="showDeleteAlert = false"
      ></ion-alert>

      <!-- 3. Toast untuk pesan sukses/gagal -->
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
  IonCardTitle, IonButton, IonFab, IonIcon, IonFabButton, IonAlert, IonToast,
  onIonViewWillEnter // <<< PERUBAHAN KRITIS
} from '@ionic/vue';
import { addCircle } from 'ionicons/icons';
import { ref } from "vue";
import axios from "axios";
import router from '@/router';

// State untuk UI & Logic
const posts = ref<any[]>([]);
const showLogoutAlert = ref(false);
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref<'success' | 'danger'>('success');
const postIdToDelete = ref<number | null>(null); // State untuk menyimpan ID post yang akan dihapus
const showDeleteAlert = ref(false); // State untuk menampilkan konfirmasi hapus

// Base URL
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
    // PUSH ke login jika token tidak ada
    router.push("/tabs/login");
    return;
  }

  try {
    // Panggilan API TANPA ID USER di URL
    const res = await axios.get(`${API_BASE_URL}/home`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    posts.value = res.data.content;
  } catch (e: any) {
    const errorMessage = e.response?.data?.message || "Gagal memuat data (Check Vercel Logs).";
    console.error("Error API /home:", errorMessage);
    showNotification(`Gagal memuat post: ${errorMessage}`, 'danger');
  }
};

const deletePost = async (id_post: number) => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
      showNotification("Sesi habis, silakan login.", 'danger');
      router.push("/tabs/login");
      return;
  }

  try {
      await axios.delete(`${API_BASE_URL}/delete/${id_post}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      showNotification("Post berhasil dihapus.", 'success');
      // Muat ulang daftar post setelah penghapusan
      await fetchPosts(); 

  } catch (e: any) {
      const errorMessage = e.response?.data?.message || "Gagal menghapus post (Server Error).";
      console.error("Error API /delete:", errorMessage);
      showNotification(`Gagal menghapus post: ${errorMessage}`, 'danger');
  }
};

// Logika Konfirmasi Hapus
const confirmDelete = (id: number) => {
    postIdToDelete.value = id;
    showDeleteAlert.value = true;
};

const deleteAlertButtons = [
  { text: 'Batal', role: 'cancel', handler: () => { showDeleteAlert.value = false; } },
  { text: 'Ya, Hapus', role: 'confirm', handler: () => {
    if (postIdToDelete.value !== null) {
      deletePost(postIdToDelete.value);
    }
  }},
];

// Logika Logout
const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/tabs/login');
};

const logoutAlertButtons = [
  { text: 'Batal', role: 'cancel' },
  { text: 'Ya', role: 'confirm', handler: handleLogout },
];

// MENGGANTI onMounted() dengan onIonViewWillEnter()
onIonViewWillEnter(() => {
  fetchPosts();
});
</script>