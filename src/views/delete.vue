

<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>sign up</ion-title>
                
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen class="ion-padding ion-justify-content-center ion-align-items-center">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Login</ion-title>
                </ion-toolbar>
            </ion-header>

            <IonCard style="width: 50%; margin-left: 25%;">
                <IonCardContent>
                    <p>Yakin ingin dihapus?</p>
                    <IonButton @click="Delete" color="danger">Iya</IonButton>
                    <IonButton @click="router.push(`/tabs/home/${idUser}`)" color="success">Batal</IonButton>
                </IonCardContent>
            </IonCard>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import router from '@/router';


import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonInput } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { card } from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const route = useRoute()
const idUser = route.params.id_user as string;
const idPost = route.params.id_post as string;
const Nhead = ref<string>('')
const Nbody = ref<string>('')

async function Delete() {
  try {
    const authToken = localStorage.getItem('authToken')
    await axios.post(`http://192.168.1.8:3000/delete/${idUser}/${idPost}`, {
      id_user: idUser,
      id_post: idPost
    }, {headers: {'Authorization': `Bearer ${authToken}`}});
    window.location.replace(`http://100.108.76.111:8100/tabs/home/${idUser}`)
  } catch (e) {
    console.log(e);
  }
}
</script>
