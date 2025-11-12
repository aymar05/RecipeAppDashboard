
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css';
import './assets/main.css';

import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Dialog from 'primevue/dialog';


const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'false',
      cssLayer: false
      }
  }
});
app.use(ConfirmationService);
app.use(ToastService);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('Toast', Toast);
app.component('ConfirmDialog', ConfirmDialog);
app.component('InputText', InputText);
app.component('Tag', Tag);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('Dialog', Dialog);


app.mount('#app');
