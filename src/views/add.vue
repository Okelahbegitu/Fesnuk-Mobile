<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>Add new content</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding" :fullscreen="true">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Add new post</ion-title>
                </ion-toolbar>
            </ion-header>
            <IonCard style="max-width: 500px; margin-inline: auto;">
                <IonCardContent>
                    <ion-input type="text" v-model="Nhead" label="Judul" label-placement="floating"></ion-input>
                    <ion-input type="text" v-model="Nbody" label="Isi" label-placement="floating"></ion-input>
                    <IonButton color="success" @click="addNewPost( Nhead, Nbody, idUser)">Tambah✏️</IonButton>
                </IonCardContent>
            </IonCard>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonInput } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { card } from 'ionicons/icons';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
const route = useRoute()
const idUser = route.params.id_user as string;
const Nhead = ref<string>('')
const Nbody = ref<string>('')
async function addNewPost(Nhead: string, Nbody: string, iduser: string) {
    try{
        const authToken = localStorage.getItem('authToken')
        await axios.post(`https://fesnuk-mobile.vercel.app/add/${idUser}`, {
            id_user: idUser,
            id_post: null,
            Head: Nhead,
            Body: Nbody
        }, {headers: {'Authorization': `Bearer ${authToken}`}})
        window.location.replace(`https://fesnuk-mobile.vercel.app/tabs/home/${idUser}`)
    } catch (err){
        alert(err);
    }
}
</script>
