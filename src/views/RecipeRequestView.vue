<!-- src/views/admin/RecipeRequestAdminView.vue -->
<template>
  <div>
    <Toast />
    <ConfirmDialog></ConfirmDialog>

    <Card>
      <template #title>
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">Modération des Propositions de Recettes</h2>
        </div>
      </template>

      <template #content>
        <Toolbar class="mb-4">
          <template #start>
            <div class="flex items-center gap-2">
              <label for="status-filter" class="font-semibold">Filtrer par statut :</label>
              <Dropdown
                id="status-filter"
                v-model="selectedStatus"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Tous les statuts"
                @change="onFilterChange"
                showClear
              />
            </div>
          </template>
        </Toolbar>

        <DataTable
          :value="recipeRequests"
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
          <Column field="user.name" header="Proposé par" sortable></Column>
          <Column field="status" header="Statut" sortable>
            <template #body="slotProps">
              <Tag :value="slotProps.data.status" :severity="getStatusTagSeverity(slotProps.data.status)" />
            </template>
          </Column>
          <Column header="Actions" :exportable="false" style="min-width:14rem">
            <template #body="slotProps">
              <Button icon="pi pi-eye" outlined rounded class="mr-2" @click="showRequestDetails(slotProps.data)" title="Voir les détails"/>

              <template v-if="slotProps.data.status === 'pending'">
                  <Button icon="pi pi-check" outlined rounded severity="success" class="mr-2" @click="confirmApprove(slotProps.data)" title="Valider"/>

                  <Button icon="pi pi-times" outlined rounded severity="warning" class="mr-2" @click="confirmReject(slotProps.data)" title="Rejeter"/>
              </template>

              <template v-if="slotProps.data.status === 'rejected' || slotProps.data.status === 'pending'">
                  <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" title="Supprimer"/>
              </template>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Dialog pour afficher les Détails de la proposition -->
    <Dialog v-model:visible="isDetailsDialogVisible" :style="{width: '700px'}" header="Détails de la Proposition" :modal="true">
        <div v-if="selectedRequest">
            <img :src="`http://127.0.0.1:8000/${selectedRequest.image_url}`" :alt="selectedRequest.title" class="w-full h-64 object-cover rounded-lg mb-4" />
            <h3 class="text-2xl font-bold mb-2">{{ selectedRequest.title }}</h3>
            <p class="text-gray-600 mb-1">Proposé par: <span class="font-medium">{{ selectedRequest.user.name }}</span></p>
            <p class="text-gray-600 mb-4">Temps de préparation: {{ selectedRequest.preparation_time }} minutes</p>

            <div class="mb-4">
                <h4 class="font-semibold text-lg mb-2 border-b pb-1">Tags</h4>
                <div class="flex flex-wrap gap-2">
                    <Tag v-for="tag in selectedRequest.tags" :key="tag.id" :value="tag.name"></Tag>
                </div>
            </div>
            <div class="mb-4">
                <h4 class="font-semibold text-lg mb-2 border-b pb-1">Ingrédients</h4>
                <ul class="list-disc list-inside">
                    <li v-for="ing in selectedRequest.ingredients" :key="ing.id">{{ ing.quantity }} {{ ing.measure }} de {{ ing.name }}</li>
                </ul>
            </div>
            <div>
                <h4 class="font-semibold text-lg mb-2 border-b pb-1">Étapes</h4>
                <div v-for="(step, index) in selectedRequest.steps" :key="step.id" class="mb-3">
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
import { getAdminRecipeRequests, approveRecipeRequest, rejectRecipeRequest, deleteAdminRecipeRequest } from '@/services/adminRecipeService';

// Import des composants PrimeVue
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Card from 'primevue/card';
import Toolbar from 'primevue/toolbar';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

const toast = useToast();
const confirm = useConfirm();

// --- État du composant ---
const recipeRequests = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const lazyParams = ref({ page: 1, rows: 10 });
const isDetailsDialogVisible = ref(false);
const selectedRequest = ref(null);

// --- État pour le filtrage ---
const selectedStatus = ref();
const statusOptions = ref([
    { label: 'En attente', value: 'Pending' },
    { label: 'Approuvé', value: 'Approved' },
    { label: 'Rejeté', value: 'Rejected' },
]);

// --- Initialisation ---
onMounted(() => loadRequests());

// --- Fonctions de chargement et de pagination ---
const loadRequests = async () => {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            per_page: lazyParams.value.rows,
            'filter[status]': selectedStatus.value, // Ajout du filtre
        };
        const response = await getAdminRecipeRequests(params);
        recipeRequests.value = response.data;
        totalRecords.value = response.total;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les propositions.', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page + 1;
    loadRequests();
};

const onFilterChange = () => {
    lazyParams.value.page = 1; // Réinitialiser à la première page lors d'un filtre
    loadRequests();
};

// --- Logique d'affichage ---
const showRequestDetails = (requestData) => {
    selectedRequest.value = requestData;
    isDetailsDialogVisible.value = true;
};

const getStatusTagSeverity = (status) => {
    switch (status) {
        case 'approved': return 'success';
        case 'pending': return 'warning';
        case 'rejected': return 'danger';
        default: return 'info';
    }
};

// --- Logique des actions (Approuver, Rejeter, Supprimer) ---
const confirmApprove = (requestData) => {
    confirm.require({
        message: `Voulez-vous vraiment approuver la recette "${requestData.title}" ? Cette action est irréversible.`,
        header: 'Confirmation d\'approbation',
        icon: 'pi pi-check-circle',
        acceptClass: 'p-button-success',
        accept: async () => {
            try {
                await approveRecipeRequest(requestData.id);
                toast.add({ severity: 'success', summary: 'Succès', detail: 'Proposition approuvée.', life: 3000 });
                loadRequests(); // Recharger la liste
            } catch (error) { toast.add({ severity: 'error', summary: 'Erreur', detail: 'L\'approbation a échoué.', life: 3000 }); }
        },
    });
};

const confirmReject = (requestData) => {
    confirm.require({
        message: `Voulez-vous vraiment rejeter la recette "${requestData.title}" ?`,
        header: 'Confirmation de rejet',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-warning',
        accept: async () => {
            try {
                await rejectRecipeRequest(requestData.id);
                toast.add({ severity: 'info', summary: 'Succès', detail: 'Proposition rejetée.', life: 3000 });
                loadRequests();
            } catch (error) { toast.add({ severity: 'error', summary: 'Erreur', detail: 'Le rejet a échoué.', life: 3000 }); }
        },
    });
};

const confirmDelete = (requestData) => {
    confirm.require({
        message: `Êtes-vous sûr de vouloir supprimer la proposition "${requestData.title}" ?`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-trash',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await deleteAdminRecipeRequest(requestData.id);
                toast.add({ severity: 'success', summary: 'Succès', detail: 'Proposition supprimée.', life: 3000 });
                loadRequests();
            } catch (error) { toast.add({ severity: 'error', summary: 'Erreur', detail: 'La suppression a échoué.', life: 3000 }); }
        },
    });
};
</script>
