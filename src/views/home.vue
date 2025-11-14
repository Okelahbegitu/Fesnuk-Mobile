<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Home🏠</ion-title>
        <IonButton color="danger" @click="Logout" >Log out</IonButton>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-card v-for="data in posts" :key="data.id_post">
        <ion-card-header>
          <ion-card-title>{{ data.Head }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          {{ data.Body }}
          <div>
            <IonButton color="warning" @click="router.push(`/tabs/edit/${idUser}/${data.id_post}`)">Edit</IonButton>
            <IonButton color="danger" @click="router.push(`/tabs/delete/${idUser}/${data.id_post}`)">Hapus</IonButton>
          </div>
        </ion-card-content>
      </ion-card>
      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton @click="router.push(`/tabs/add/${idUser}`)">
          <IonIcon :Icon="addCircle"></IonIcon>
        </IonFabButton>
      </IonFab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonCardTitle, IonButton, IonFab, IonIcon, IonFabButton } from '@ionic/vue';
import { addCircle } from 'ionicons/icons';
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import router from '@/router';
import { Icon } from 'ionicons/dist/types/components/icon/icon';

const route = useRoute();
const idUser = route.params.id_user as string;
const posts = ref<any[]>([]);

onMounted(async () => {
  try {
    const authToken = localStorage.getItem('authToken')
    const res = await axios.get(`http://192.168.1.8:3000/home/${idUser}`, {headers: {'Authorization': `Bearer ${authToken}`}});
    posts.value = res.data.content;
  } catch (e) {
    console.log(e);
  }
});



function Logout(){
  if(confirm('yakin log out?')){
    localStorage.removeItem('authToken');
    router.push('/tabs/login')
  }
}
</script>
