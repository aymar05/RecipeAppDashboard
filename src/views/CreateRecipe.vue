<!-- src/views/CreateRecipe.vue -->
<template>
  <div>
    <!-- Le Toast doit être dans votre layout principal (MainLayout.vue) pour être global, mais on le laisse ici pour l'exemple -->
    <Toast />

    <div class="p-6">
      <Card>
        <template #title>
          <h2 class="text-2xl font-bold">Proposer une nouvelle recette</h2>
          <p class="text-gray-600 text-sm mt-1">Votre proposition sera examinée par un administrateur avant sa publication.</p>
        </template>
        <template #content>
          <form @submit.prevent="submitRecipe" class="space-y-6">

            <!-- SECTION INFORMATIONS GÉNÉRALES -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label for="title" class="font-medium">Titre de la recette</label>
                <InputText id="title" v-model="form.title" :invalid="!!errors.title" />
                <small v-if="errors.title" class="p-error">{{ errors.title[0] }}</small>
              </div>
              <div class="flex flex-col gap-2">
                <label for="prep_time" class="font-medium">Temps de préparation (minutes)</label>
                <InputNumber id="prep_time" v-model="form.preparation_time" :invalid="!!errors.preparation_time" />
                <small v-if="errors.preparation_time" class="p-error">{{ errors.preparation_time[0] }}</small>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <label class="font-medium">Image de la recette</label>
              <!-- Ajout d'une ref pour pouvoir le vider manuellement -->
              <FileUpload ref="fileUploader" name="recipeImage" @select="onImageSelect" :multiple="false" accept="image/*" :maxFileSize="4096000" customUpload>
                <template #empty>
                  <p>Glissez-déposez une image ou cliquez pour choisir.</p>
                </template>
              </FileUpload>
              <small v-if="errors.image" class="p-error">{{ errors.image[0] }}</small>
            </div>

            <Divider />

            <!-- SECTION INGRÉDIENTS (Dynamique) -->
            <div>
              <h3 class="font-semibold text-lg mb-2">Ingrédients</h3>
              <div v-for="(ingredient, index) in form.ingredients" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg items-start">
                <div class="flex flex-col gap-1">
                  <InputText v-model="ingredient.name" placeholder="Nom" :invalid="!!errors[`ingredients.${index}.name`]" />
                </div>
                <div class="flex flex-col gap-1">
                  <InputNumber v-model="ingredient.quantity" placeholder="Quantité" :invalid="!!errors[`ingredients.${index}.quantity`]" />
                </div>
                <div class="flex flex-col gap-1">
                  <InputText v-model="ingredient.measure" placeholder="Mesure (ex: g, L)" :invalid="!!errors[`ingredients.${index}.measure`]" />
                </div>
                <Button icon="pi pi-trash" severity="danger" text rounded @click="removeIngredient(index)" class="self-end"/>
              </div>
              <Button label="Ajouter un ingrédient" icon="pi pi-plus" severity="secondary" @click="addIngredient" outlined />
            </div>

            <Divider />

            <!-- SECTION ÉTAPES (Dynamique) -->
            <div>
              <h3 class="font-semibold text-lg mb-2">Étapes de préparation</h3>
              <div v-for="(step, index) in form.steps" :key="index" class="flex flex-col gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                  <div class="flex justify-between items-center">
                      <span class="font-semibold">Étape {{ index + 1 }}</span>
                      <Button icon="pi pi-trash" severity="danger" text rounded @click="removeStep(index)"/>
                  </div>
                  <InputText v-model="step.name" placeholder="Titre de l'étape" :invalid="!!errors[`steps.${index}.name`]" />
                  <Textarea v-model="step.description" placeholder="Description de l'étape" rows="2" :invalid="!!errors[`steps.${index}.description`]" />
                  <InputNumber v-model="step.duration" placeholder="Durée (min)" :invalid="!!errors[`steps.${index}.duration`]" />
              </div>
              <Button label="Ajouter une étape" icon="pi pi-plus" severity="secondary" @click="addStep" outlined/>
            </div>

            <Divider />

            <!-- SECTION TAGS -->
            <div class="flex flex-col gap-2">
              <label for="tags" class="font-medium">Tags (appuyez sur Entrée pour ajouter)</label>
              <Chips id="tags" v-model="form.tags" />
              <small v-if="errors.tags" class="p-error">{{ errors.tags[0] }}</small>
            </div>

            <!-- SUBMIT -->
            <div class="text-right">
              <Button type="submit" label="Soumettre ma proposition" :loading="loading" />
            </div>
          </form>
        </template>
      </Card>
    </div>

    <!-- MODALE DE SUCCÈS -->
    <Dialog v-model:visible="isSuccessDialogVisible" :style="{width: '450px'}" header="Proposition Envoyée !" :modal="true">
        <div class="text-center">
            <i class="pi pi-check-circle text-green-500 text-6xl mb-4"></i>
            <p class="text-lg">Merci ! Votre proposition de recette a bien été envoyée.</p>
            <p class="text-gray-600">Elle sera examinée par notre équipe prochainement.</p>
        </div>
        <template #footer>
            <Button label="Proposer une autre recette" icon="pi pi-plus" text @click="isSuccessDialogVisible = false" />
            <Button label="Voir mes propositions" icon="pi pi-list" @click="navigateToMyRequests" />
        </template>
    </Dialog>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { apiPost } from '@/services/apiService';

// Import de tous les composants PrimeVue
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import FileUpload from 'primevue/fileupload';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Chips from 'primevue/chips';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';

const router = useRouter();
const toast = useToast();
const loading = ref(false);
const errors = ref({});
const fileUploader = ref(null); // Référence pour le composant FileUpload
const isSuccessDialogVisible = ref(false);

// Fonction pour obtenir l'état initial du formulaire (pour le nettoyage)
const getInitialFormState = () => ({
  title: '',
  preparation_time: null,
  image: null,
  ingredients: [],
  steps: [],
  tags: []
});

const form = ref(getInitialFormState());

// --- Fonctions de nettoyage ---
const resetForm = () => {
    form.value = getInitialFormState();
    errors.value = {};
    // On vide le composant FileUpload visuellement
    if (fileUploader.value) {
        fileUploader.value.clear();
    }
};

// --- Fonctions pour gérer les listes dynamiques ---
const addIngredient = () => form.value.ingredients.push({ name: '', quantity: null, measure: '' });
const removeIngredient = (index) => form.value.ingredients.splice(index, 1);
const addStep = () => form.value.steps.push({ name: '', description: '', duration: null });
const removeStep = (index) => form.value.steps.splice(index, 1);

// --- Gestion du fichier ---
const onImageSelect = (event) => {
  form.value.image = event.files[0];
};

// --- Logique de soumission ---
const submitRecipe = async () => {
  loading.value = true;
  errors.value = {};

  const formData = new FormData();
  formData.append('title', form.value.title || '');
  formData.append('preparation_time', form.value.preparation_time || 0);
  if (form.value.image) {
    formData.append('image', form.value.image);
  }
  form.value.ingredients.forEach((ing, i) => {
    formData.append(`ingredients[${i}][name]`, ing.name || '');
    formData.append(`ingredients[${i}][quantity]`, ing.quantity || 0);
    formData.append(`ingredients[${i}][measure]`, ing.measure || '');
  });
  form.value.steps.forEach((step, i) => {
    formData.append(`steps[${i}][name]`, step.name || '');
    formData.append(`steps[${i}][description]`, step.description || '');
    formData.append(`steps[${i}][duration]`, step.duration || 0);
  });
  form.value.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));

  try {
    // L'endpoint est /recipe-requests, ce qui est correct pour une proposition
    await apiPost('/recipe-requests', formData);

    // Si la requête réussit :
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette proposée avec succès !', life: 3000 });
    isSuccessDialogVisible.value = true; // AFFICHER LA MODALE
    resetForm(); // NETTOYER LE FORMULAIRE

  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
      toast.add({ severity: 'error', summary: 'Erreur de validation', detail: 'Veuillez corriger les erreurs.', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue.', life: 3000 });
    }
  } finally {
    loading.value = false;
  }
};

// --- Navigation ---
const navigateToMyRequests = () => {
    isSuccessDialogVisible.value = false;
    // Assurez-vous que le nom de la route est correct dans votre router/index.js
    router.push({ name: 'recipeRequest' });
};
</script>
