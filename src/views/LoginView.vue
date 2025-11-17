<script setup>
import { ref } from 'vue';
import { useRouter,} from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { login } from '@/services/authService';
import { useAuth } from '@/services/useAuth';
const { login: storeLogin } = useAuth(); // Assurez-vous que le chemin est correct

// Initialisation des outils Vue et PrimeVue
const router = useRouter();
const toast = useToast();

// Références réactives pour le formulaire, les erreurs et l'état de chargement
const form = ref({
    email: '',
    password: '',
    remember: false,
});
const errors = ref({});
const loading = ref(false);

// Fonction de soumission du formulaire
const submit = async () => {
    loading.value = true;
    errors.value = {}; // Réinitialiser les erreurs précédentes

    try {
        const response = await login(form.value);
        //console.log('Connexion réussie:', response);

        storeLogin(response.user, response.token);
        toast.add({
            severity: 'success',
            summary: 'Connexion réussie',
            detail: 'Vous allez être redirigé.',
            life: 3000
        });

        // Rediriger vers le tableau de bord ou une autre page protégée
        router.push('/dashboard');

    } catch (error) {
        if (error.response && error.response.status === 422) {
            // Erreurs de validation de Laravel
            errors.value = error.response.data.errors;
            toast.add({ severity: 'error', summary: 'Erreur de validation', detail: 'Veuillez vérifier les champs.', life: 3000 });
        } else {
            // Autres erreurs (ex: email/mot de passe incorrect)
            errors.value = { general: error.message };
            toast.add({ severity: 'error', summary: 'Échec de la connexion', detail: error.message, life: 3000 });
        }
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <!-- Le layout général et le fond d'écran sont conservés -->
    <div class="bg-[url()] bg-no-repeat  flex min-h-screen flex-col items-center justify-center  p-6 md:p-10">
        <div class="w-full max-w-sm md:max-w-3xl">
            <div class="flex flex-col gap-6">
                <div class="overflow-hidden rounded-lg border bg-white  text-card-foreground shadow">
                    <div class="grid p-0 md:grid-cols-2">
                        <!-- Utilisation de @submit.prevent sur la balise <form> -->
                        <form class="p-6 md:p-8" @submit.prevent="submit">
                            <div class="flex flex-col gap-6">
                                <div v-if="errors.general" class="mb-4 text-center text-sm font-medium text-red-600">
                                    {{ errors.general }}
                                </div>
                                <div class="flex flex-col items-center text-center">
                                    <h1 class="text-2xl font-bold">Heureux de vous revoir</h1>
                                    <p class="text-balance text-muted-foreground">Connectez-vous à votre compte.</p>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label for="email" class="text-sm font-medium leading-none">Email</label>
                                    <InputText
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        v-model="form.email"
                                        class="w-full"
                                        :invalid="!!errors.email"
                                    />
                                    <small v-if="errors.email" class="p-error">{{ errors.email[0] }}</small>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <div class="flex items-center">
                                        <label for="password" class="text-sm font-medium leading-none">Mot de passe</label>

                                    </div>
                                    <InputText
                                        id="password"
                                        type="password"
                                        v-model="form.password"
                                        class="w-full"
                                        :invalid="!!errors.password"
                                    />
                                    <small v-if="errors.password" class="p-error">{{ errors.password[0] }}</small>
                                </div>

                                <Button
                                    type="submit"
                                    label="Connexion"
                                    class="w-full"
                                    :loading="loading"
                                />
                            </div>
                        </form>
                        <div class="relative hidden bg-muted md:block">
                            <img
                                src="../../public/img/coo.jpg"
                                alt="Image"
                                class="absolute inset-0 h-full w-full object-cover "
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
