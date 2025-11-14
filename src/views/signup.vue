<template>
    <ion-page>
        <ion-header>
            <ion-toolbar>
                <ion-title>login!</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content fullscreen  class="ion-padding ion-justify-content-center ion-align-items-center">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Tab 1</ion-title>
                </ion-toolbar>
            </ion-header>
            <IonCard style="width: 50%; margin-left: 25%;">
                <IonCardContent>
                    <IonInput label="Username" type="text" label-placement="floating" v-model="username"></IonInput>
                    <IonInput label="Password" type="password" label-placement="floating" v-model="password"></IonInput>
                    <IonInput label="Konfirmasi Password" type="password" label-placement="floating" v-model="connpassword"></IonInput>
                    <IonButton @click="signup">Daftar</IonButton>

                    <IonButton @click=" router.push('/tabs/login')">sudah punya akun?</IonButton>
                </IonCardContent>
            </IonCard>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import router from '@/router';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonButton } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import mysql from 'mysql2'
import { ref } from 'vue';
import axios from 'axios';

const username = ref<string>('');
const password= ref<string>('');
const connpassword = ref<string>('');

function signup (): void {
    const pass = password.value ?? '';
    const conpass = connpassword.value ?? '';
    const usr = username.value ?? '';

    if (pass !== conpass){
        alert('password tidak sama')
        return
    }
    try{
        axios.post("http://localhost:3000/signup", {
            username: username.value,
            password: password.value
        })
    } catch (err){
        console.log(err)
    }
}
</script>