<!-- src/views/admin/RecipeAdminView.vue -->
<template>
  <div>
    <Toast />
    <ConfirmDialog></ConfirmDialog>
<Card>
  <template #title>
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Gestion des Recettes</h2>
    </div>
  </template>

  <template #content>
    <Toolbar class="mb-4">
      <template #end>
        <Button label="Nouvelle Recette" icon="pi pi-plus" @click="openNew" />
      </template>
    </Toolbar>

    <DataTable
      :value="recipes"
      :loading="loading"
      lazy
      paginator
      :rows="lazyParams.rows"
      :totalRecords="totalRecords"
      @page="onPage($event)"
      dataKey="id"
      stripedRows
      responsiveLayout="scroll"
    >
      <Column header="Image" style="width: 10rem">
         <template #body="slotProps">
            <img :src="`http://127.0.0.1:8000/${slotProps.data.image_url}`" :alt="slotProps.data.title" class="w-24 h-16 object-cover rounded-md" />
         </template>
      </Column>
      <Column field="title" header="Titre" sortable></Column>
      <Column field="time" header="Préparation (min)" sortable></Column>
      <Column header="Actions" :exportable="false" style="min-width:12rem">
        <template #body="slotProps">
          <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="showRecipeDetails(slotProps.data)" />
          <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRecipe(slotProps.data)" />
          <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteRecipe(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
  </template>
</Card>

<!-- Dialog pour Créer / Modifier une recette -->
<Dialog v-model:visible="isRecipeDialogVisible" :style="{width: '800px'}" :header="isEditMode ? 'Modifier la Recette' : 'Nouvelle Recette'" :modal="true" class="p-fluid">
  <TabView>
    <!-- <ProgressBar v-if="uploading" :value="progress" /> -->
    <TabPanel header="Informations Générales">
      <div class="space-y-4 pt-4">
        <div class="flex flex-col gap-2">
          <label for="title">Titre</label>
          <InputText id="title" v-model.trim="recipe.title" required="true" :invalid="!!errors.title" />
          <small class="p-error" v-if="errors.title">{{ errors.title[0] }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label for="prep_time">Temps de préparation (minutes)</label>
          <InputNumber id="prep_time" v-model="recipe.time" required="true" :invalid="!!errors.time" />
          <small class="p-error" v-if="errors.time">{{ errors.time[0] }}</small>
        </div>
        <div class="flex flex-col gap-2">
          <label>Image</label>
          <FileUpload mode="basic" @select="onFileSelect"   :maxFileSize="4096000" customUpload auto severity="secondary" class="p-button-outlined" />
          <img v-if="src" :src="src" alt="Image" class="shadow-md rounded-xl w-full sm:w-64"  />
          <small class="p-error" v-if="errors.image">{{ errors.image[0] }}</small>
        </div>
      </div>
    </TabPanel>
    <TabPanel header="Ingrédients">
        <div class="pt-4">
          <div v-for="(ingredient, index) in recipe.ingredients" :key="index" class="flex flex-col gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex justify-between items-center">
                    <span class="font-semibold">Ingrédient {{ index + 1 }}</span>
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="removeIngredient(index)"/>
              </div>
            <div class="flex  gap-3">
              <div class="flex flex-col gap-1">
                  <InputText v-model="ingredient.name" placeholder="Nom (ex: Farine)" />
              </div>

              <div class="flex flex-col gap-1">
                  <InputNumber v-model="ingredient.quantity" placeholder="Quantité"/>
              </div>

              <div class="flex flex-col gap-1 md:ml-4">  <!-- <-- LA MODIFICATION EST ICI -->
                  <InputText v-model="ingredient.measure" placeholder="Mesure (ex: g, L)"/>
              </div>

            </div>


          </div>
          <Button label="Ajouter un ingrédient" icon="pi pi-plus" severity="secondary" @click="addIngredient" outlined/>
      </div>
    </TabPanel>
    <TabPanel header="Étapes">
        <div class="pt-4">
            <div v-for="(step, index) in recipe.steps" :key="index" class="flex flex-col gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                <div class="flex justify-between items-center">
                    <span class="font-semibold">Étape {{ index + 1 }}</span>
                    <Button icon="pi pi-trash" severity="danger" text rounded @click="removeStep(index)"/>
                </div>
                <InputText v-model="step.name" placeholder="Titre de l'étape (ex: Préparer la pâte)" />
                <Textarea v-model="step.description" placeholder="Description de l'étape" rows="3"/>
                <InputNumber v-model="step.duration" placeholder="Durée de l'étape (min)" />
            </div>
            <Button label="Ajouter une étape" icon="pi pi-plus" severity="secondary" @click="addStep" outlined/>
        </div>
    </TabPanel>
    <TabPanel header="Tags">
        <div class="pt-4 flex flex-col gap-2">
            <label for="tags">Tags (appuyez sur Entrée pour valider un tag)</label>
            <Chips id="tags" v-model="recipe.tags" />
        </div>
    </TabPanel>
  </TabView>
  <template #footer>
    <Button label="Annuler" icon="pi pi-times" text @click="hideDialog"/>
    <Button label="Enregistrer" icon="pi pi-check" :loading="saving" @click="saveRecipe"/>
  </template>
</Dialog>

<!-- Dialog pour afficher les Détails -->
<Dialog v-model:visible="isDetailsDialogVisible" :style="{width: '700px'}" header="Détails de la Recette" :modal="true">
    <div v-if="selectedRecipe">
        <img :src="`http://127.0.0.1:8000/${selectedRecipe.image_url}`" :alt="selectedRecipe.title" class="w-full h-64 object-cover rounded-lg mb-4" />
        <h3 class="text-2xl font-bold mb-2">{{ selectedRecipe.title }}</h3>
        <p class="text-gray-600 mb-4">Temps de préparation: {{ selectedRecipe.time }} minutes</p>

        <div class="mb-4">
            <h4 class="font-semibold text-lg mb-2 border-b pb-1">Tags</h4>
            <div class="flex flex-wrap gap-2">
                <Tag v-for="tag in selectedRecipe.tags" :key="tag.id" :value="tag.name"></Tag>
            </div>
        </div>

        <div class="mb-4">
            <h4 class="font-semibold text-lg mb-2 border-b pb-1">Ingrédients</h4>
            <ul class="list-disc list-inside">
                <li v-for="ing in selectedRecipe.ingredients" :key="ing.id">{{ ing.quantity }} {{ ing.measure }} de {{ ing.name }}</li>
            </ul>
        </div>

        <div>
            <h4 class="font-semibold text-lg mb-2 border-b pb-1">Étapes</h4>
            <div v-for="(step, index) in selectedRecipe.steps" :key="step.id" class="mb-3">
                <p class="font-bold">Étape {{ index + 1 }}: {{ step.name }} ({{ step.duration }} min)</p>
                <p>{{ step.description }}</p>
            </div>
        </div>
    </div>
</Dialog>
</div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { getDashboardRecipes, createRecipe as apiCreateRecipe, updateRecipe as apiUpdateRecipe, deleteRecipe as apiDeleteRecipe } from '@/services/adminRecipeService';

// Import de tous les composants PrimeVue nécessaires
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Textarea from 'primevue/textarea';
import Chips from 'primevue/chips';
import Tag from 'primevue/tag';

const toast = useToast();
const confirm = useConfirm();

// --- État du composant ---
const recipes = ref([]);
const loading = ref(false);
const saving = ref(false);
const totalRecords = ref(0);
const lazyParams = ref({ page: 1, rows: 10 });
const fileUploader = ref(null); // Référence pour le composant FileUpload

// -- État pour les modales ---
const isRecipeDialogVisible = ref(false);
const isDetailsDialogVisible = ref(false);
const isEditMode = ref(false);
const recipe = ref({});
const selectedRecipe = ref(null);
const src = ref(null);
const selectedImage = ref(null);
const errors = ref({});

// --- Initialisation ---
onMounted(() => loadRecipes());

// --- Fonctions de base (chargement, pagination) ---
const loadRecipes = async () => {
    loading.value = true;
    try {
        const response = await getDashboardRecipes({ page: lazyParams.value.page, per_page: lazyParams.value.rows });
        recipes.value = response.data;
        totalRecords.value = response.total;
    } catch (error) { toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les recettes.', life: 3000 }); }
    finally { loading.value = false; }
};

const onPage = (event) => {
    lazyParams.value.page = event.page + 1;
    loadRecipes();
};

// --- Logique pour les modales ---
const hideDialog = () => isRecipeDialogVisible.value = false;

const openNew = () => {
    recipe.value = { title: '', time: null, ingredients: [], steps: [], tags: [] };
    src.value = null;
    errors.value = {};
    isEditMode.value = false;
    isRecipeDialogVisible.value = true;
};

const editRecipe = (recipeData) => {
    const API_URL = 'http://127.0.0.1:8000';
    // Crée une copie profonde pour éviter les modifications réactives non désirées
    recipe.value = JSON.parse(JSON.stringify(recipeData));
     console.log(recipe.value);
    src.value = recipe.value.image_url ? `${API_URL}/${recipe.value.image_url}` : null;
    errors.value = {};
    isEditMode.value = true;
    isRecipeDialogVisible.value = true;
};

const showRecipeDetails = (recipeData) => {
    selectedRecipe.value = recipeData;
    isDetailsDialogVisible.value = true;
};

// --- Fonctions de gestion dynamique (ingrédients, étapes) ---
const addIngredient = () => recipe.value.ingredients.push({ name: '', quantity: null, measure: '' });
const removeIngredient = (index) => recipe.value.ingredients.splice(index, 1);
const addStep = () => recipe.value.steps.push({ name: '', description: '', duration: null });
const removeStep = (index) => recipe.value.steps.splice(index, 1);

// --- Gestion de l'upload et de la sauvegarde ---
function onFileSelect(event) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        src.value = e.target?.result ?? null;
    };

    if (file) {
        selectedImage.value = file;
    }

    reader.readAsDataURL(file);
}


const saveRecipe = async () => {
    saving.value = true;
    errors.value = {};

    // Construction du FormData, qui est essentiel pour l'upload de fichier
    const formData = new FormData();
    formData.append('title', recipe.value.title || '');
    formData.append('time', recipe.value.time || 0);
    if (selectedImage.value) {
        formData.append('image', selectedImage.value);
    }
    recipe.value.ingredients.forEach((ing, i) => {
        formData.append(`ingredients[${i}][name]`, ing.name || '');
        formData.append(`ingredients[${i}][quantity]`, ing.quantity || 0);
        formData.append(`ingredients[${i}][measure]`, ing.measure || '');
    });
    recipe.value.steps.forEach((step, i) => {
        formData.append(`steps[${i}][name]`, step.name || '');
        formData.append(`steps[${i}][description]`, step.description || '');
        formData.append(`steps[${i}][duration]`, step.duration || 0);
    });
    recipe.value.tags.forEach((tag, i) => formData.append(`tags[${i}]`, tag));

    try {
        if (isEditMode.value) {
            await apiUpdateRecipe(recipe.value.id, formData);
            toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette mise à jour', life: 3000 });
        } else {
            await apiCreateRecipe(formData);
            toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette créée', life: 3000 });
        }
        hideDialog();
        loadRecipes();

        if (fileUploader.value) {
            fileUploader.value.clear();
        }
    } catch (error) {
        if (error.response && error.response.status === 422) {
            errors.value = error.response.data.errors;
            toast.add({ severity: 'error', summary: 'Erreur de validation', detail: 'Veuillez corriger les erreurs.', life: 3000 });
        } else {
            toast.add({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
        }
    } finally { saving.value = false; }
};

// --- Logique de suppression ---
const confirmDeleteRecipe = (recipeData) => {
    confirm.require({
        message: `Êtes-vous sûr de vouloir supprimer la recette "${recipeData.title}" ?`,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await apiDeleteRecipe(recipeData.id);
                toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette supprimée', life: 3000 });
                loadRecipes();
            } catch (error) { toast.add({ severity: 'error', summary: 'Erreur', detail: 'La suppression a échoué.', life: 3000 }); }
        },
    });
};
</script>
