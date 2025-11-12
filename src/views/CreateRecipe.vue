<!-- src/views/CreateRecipe.vue -->
<template>
  <div class="p-6">
    <Card>
      <template #title>
        <h2 class="text-2xl font-bold">Ajouter une nouvelle recette</h2>
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
            <FileUpload name="recipeImage" @select="onImageSelect" :multiple="false" accept="image/*" :maxFileSize="4096000" customUpload>
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
                <label class="text-sm">Nom</label>
                <InputText v-model="ingredient.name" :invalid="!!errors[`ingredients.${index}.name`]" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm">Quantité</label>
                <InputNumber v-model="ingredient.quantity" :invalid="!!errors[`ingredients.${index}.quantity`]" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm">Mesure (ex: g, L, cuillère)</label>
                <InputText v-model="ingredient.measure" :invalid="!!errors[`ingredients.${index}.measure`]" />
              </div>
              <Button icon="pi pi-trash" severity="danger" text rounded @click="removeIngredient(index)" class="self-end"/>
            </div>
            <Button label="Ajouter un ingrédient" icon="pi pi-plus" severity="secondary" @click="addIngredient" />
          </div>

          <Divider />

          <!-- SECTION ÉTAPES (Dynamique) -->
          <div>
            <h3 class="font-semibold text-lg mb-2">Étapes de préparation</h3>
            <div v-for="(step, index) in form.steps" :key="index" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-3 bg-gray-50 rounded-lg items-start">
              <div class="flex flex-col gap-1">
                <label class="text-sm">Titre de l'étape</label>
                <InputText v-model="step.name" :invalid="!!errors[`steps.${index}.name`]" />
              </div>
              <div class="flex flex-col gap-1 col-span-2">
                <label class="text-sm">Description</label>
                <Textarea v-model="step.description" rows="2" :invalid="!!errors[`steps.${index}.description`]" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm">Durée (min)</label>
                <InputNumber v-model="step.duration" :invalid="!!errors[`steps.${index}.duration`]" />
              </div>
              <div class="md:col-start-4">
                  <Button icon="pi pi-trash" severity="danger" text rounded @click="removeStep(index)" class="self-end"/>
              </div>
            </div>
            <Button label="Ajouter une étape" icon="pi pi-plus" severity="secondary" @click="addStep" />
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
            <Button type="submit" label="Soumettre la recette" :loading="loading" />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { apiPost } from '@/services/apiService'; // Assurez-vous que le chemin est correct

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import FileUpload from 'primevue/fileupload';
import Divider from 'primevue/divider';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import Chips from 'primevue/chips';

const toast = useToast();
const loading = ref(false);
const errors = ref({});

// Structure de données qui correspond à la validation de Laravel
const form = ref({
  title: '',
  preparation_time: null,
  image: null, // On stockera l'objet File ici
  ingredients: [],
  steps: [],
  tags: []
});

// --- Fonctions pour gérer les listes dynamiques ---

const addIngredient = () => {
  form.value.ingredients.push({ name: '', quantity: null, measure: '' });
};
const removeIngredient = (index) => {
  form.value.ingredients.splice(index, 1);
};

const addStep = () => {
  form.value.steps.push({ name: '', description: '', duration: null });
};
const removeStep = (index) => {
  form.value.steps.splice(index, 1);
};

// --- Gestion du fichier ---

const onImageSelect = (event) => {
  // PrimeVue passe un tableau de fichiers, on prend le premier
  form.value.image = event.files[0];
};

// --- Logique de soumission ---

const submitRecipe = async () => {
  loading.value = true;
  errors.value = {};

  // 1. Créer un objet FormData pour l'envoi
  const formData = new FormData();

  // 2. Ajouter les champs simples
  formData.append('title', form.value.title || '');
  formData.append('preparation_time', form.value.preparation_time || 0);
  if (form.value.image) {
    formData.append('image', form.value.image);
  }

  // 3. Ajouter les tableaux (format spécial pour que PHP comprenne)
  form.value.ingredients.forEach((ing, index) => {
    formData.append(`ingredients[${index}][name]`, ing.name);
    formData.append(`ingredients[${index}][quantity]`, ing.quantity);
    formData.append(`ingredients[${index}][measure]`, ing.measure);
  });

  form.value.steps.forEach((step, index) => {
    formData.append(`steps[${index}][name]`, step.name);
    formData.append(`steps[${index}][description]`, step.description);
    formData.append(`steps[${index}][duration]`, step.duration);
  });

  form.value.tags.forEach((tag, index) => {
    formData.append(`tags[${index}]`, tag);
  });

  try {
    // Le controller est RecipeRequestController -> l'endpoint est /recipe-requests
    const response = await apiPost('/recipes', formData);

    if (!response.status === 201) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur survenue', life: 3000 });
    }else {
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette proposée avec succès !', life: 3000 });
    }

  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Erreurs de validation de Laravel
      errors.value = error.response.data.errors;
      toast.add({ severity: 'error', summary: 'Erreur de validation', detail: 'Veuillez corriger les erreurs.', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
    }
  } finally {
    loading.value = false;
  }
};
</script>
