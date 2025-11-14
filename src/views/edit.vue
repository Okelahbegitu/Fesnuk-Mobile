7<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Update the content</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Edit</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-card>
        <ion-card-content>
            <ion-input type="text" label="Judul" label-placement="floating" v-model="HeadI"></ion-input>
            <ion-input type="text" label="Isi" label-placement="floating" v-model="BodyI"></ion-input>
            <IonButton color="success" @click="UpdatePost(idUser, idPost, HeadI, BodyI)">Ubah✏️</IonButton>
          </ion-card-content>
      </ion-card>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonCardTitle, IonBackButton, IonButton } from '@ionic/vue';
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import router from '@/router';



const route = useRoute();
const idUser = route.params.id_user as string;
const idPost = route.params.id_post as string;
const posts = ref<any[]>([])

const BodyI = ref<string>('')
const HeadI = ref<string>('')
onMounted(async () => {
  try {
        const authToken = localStorage.getItem('authToken')
    const res = await axios.get(`https://fesnuk-mobile.vercel.app/edit/${idUser}/${idPost}`, {headers: {'Authorization': `Bearer ${authToken}`}});
    posts.value = res.data.content
  } catch (e) {
    console.log(e)
  }
})
async function UpdatePost (idUser: string, idPost: string, HeadU: string, BodyU: string) {
  try {
    console.log("Sending body:", { head: HeadU, body: BodyU });

    const authToken = localStorage.getItem('authToken')
    const res = await axios.post(`https://fesnuk-mobile.vercel.app/edit/${idPost}`, {
      head: HeadU,
      body: BodyU
    }, {headers: {'Authorization': `Bearer ${authToken}`}});
    alert(res.data.message);
    router.push(`/tabs/home/${idUser}`)
  } catch (err) {
    alert(err);
  }
}

</script>
