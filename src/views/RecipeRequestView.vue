<script setup>
import { ref, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
// Le chemin d'importation est la seule chose qui change si vous changez de librairie
import { getRecipeRequests, deleteRecipeRequest } from '@/services/recipeService'; // Assurez-vous que le chemin est correct

const confirm = useConfirm();
const toast = useToast();

const recipeRequests = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const lazyParams = ref({
    first: 0,
    rows: 10,
    page: 1,
    sortField: 'created_at',
    sortOrder: -1,
});
const filters = ref({
    name: { value: null, matchMode: 'contains' },
    status: { value: null, matchMode: 'equals' },
});

onMounted(() => {
    loadLazyData();
});

const loadLazyData = async () => {
    loading.value = true;
    try {
        const params = {
            page: lazyParams.value.page,
            per_page: lazyParams.value.rows,
            'filter[name]': filters.value.name.value,
            'filter[status]': filters.value.status.value,
            sort: (lazyParams.value.sortOrder === -1 ? '-' : '') + lazyParams.value.sortField,
        };

        const response = await getRecipeRequests(params);
        recipeRequests.value = response.data;
        totalRecords.value = response.total;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    lazyParams.value.page = event.page + 1;
    lazyParams.value.rows = event.rows;
    loadLazyData();
};

const onSort = (event) => {
    lazyParams.value.sortField = event.sortField;
    lazyParams.value.sortOrder = event.sortOrder;
    loadLazyData();
};

const onFilter = () => {
    lazyParams.value.page = 1;
    loadLazyData();
};

const onGlobalFilter = () => {
    onFilter();
};

const openAddModal = () => {
    // Logique pour ouvrir une modale d'ajout
    toast.add({ severity: 'info', summary: 'Info', detail: 'Fonctionnalité à implémenter.', life: 3000 });
};

const editRecipeRequest = (recipe) => {
    // Logique pour ouvrir une modale de modification
    toast.add({ severity: 'info', summary: 'Info', detail: 'Fonctionnalité à implémenter.', life: 3000 });
};

const confirmDeleteRecipeRequest = (recipe) => {
    confirm.require({
        message: `Êtes-vous sûr de vouloir supprimer la proposition "${recipe.name}" ?`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await deleteRecipeRequest(recipe.id);
                toast.add({ severity: 'success', summary: 'Succès', detail: 'Proposition supprimée.', life: 3000 });
                await loadLazyData();
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Erreur', detail: error.message, life: 3000 });
            }
        },
    });
};

const getStatusSeverity = (status) => {
    const statusMap = { 'pending': 'warning', 'approved': 'success', 'rejected': 'danger' };
    return statusMap[status] || 'info';
};
</script>

<template>

    <div class="card">
        <Toast />
        <ConfirmDialog></ConfirmDialog>

        <DataTable
            :value="recipeRequests"
            lazy
            paginator
            stripedRows
            :rows="lazyParams.rows"
            :totalRecords="totalRecords"
            :loading="loading"
            @page="onPage($event)"
            @sort="onSort($event)"
            @filter="onFilter($event)"
            :rowsPerPageOptions="[10, 20, 50]"
            tableStyle="min-width: 50rem"
            dataKey="id"
        >
            <template #header>
                <div class="flex justify-between">
                     <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['name'].value" placeholder="Rechercher par nom" @keydown.enter="onGlobalFilter" />
                    </IconField>
                    <RouterLink to="/createrecipe">
                      <Button
                          label="Proposer une recette"
                          icon="pi pi-plus"
                          severity="success"
                      />
                  </RouterLink>
                </div>
            </template>
            <template #empty> Aucune proposition de recette trouvée. </template>
            <template #loading> Chargement des données. Veuillez patienter. </template>

            <Column field="name" header="Nom" sortable style="width: 35%"></Column>
            <Column field="status" header="Statut" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>
            <Column field="created_at" header="Date de création" sortable >
                 <template #body="{ data }">
                    {{ new Date(data.created_at).toLocaleDateString() }}
                </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width:12rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editRecipeRequest(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteRecipeRequest(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>


