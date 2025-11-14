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
                    <IonInput label="Username" type="text" label-placement="floating" v-model="user"></IonInput>
                    <IonInput label="Password" type="password" label-placement="floating" v-model="pass" pass>
                    </IonInput>
                    <IonButton @click="login">Login</IonButton>
                    <IonButton @click=" router.push('/tabs/signup')">Tidak punya akun?</IonButton>
                </IonCardContent>
            </IonCard>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonInput, IonButton } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import router from '@/router';
import { ref } from 'vue';
import axios from 'axios';
import Signup from './login.vue';

const user = ref('')
const pass = ref('')
async function login() {
    try {
        const serverIp = "192.168.1.8"; // Ganti dengan IP address server Anda
        const res = await axios.post(`http://${serverIp}:3000/login`, {
            username: user.value,
            password: pass.value
        })
        if (res.status == 200) {
            console.log(res.data);

            localStorage.setItem('authToken', res.data.token)
            alert('berhasil login')
            router.push(`/tabs/home/${res.data.user.id}`)
        } else {
            alert('pastikan username dan password benar!')
        }
    } catch (err: any) {
        if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            alert(`Error: ${err.response.data.message}`);
        } else if (err.request) {
            // The request was made but no response was received
            alert("Network Error: Could not connect to the server. Please check your network connection and the server IP address.");
        } else {
            // Something happened in setting up the request that triggered an Error
            alert(`Error: ${err.message}`);
        }
    }
}
</script>