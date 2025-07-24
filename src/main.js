import { defineCustomElement } from 'vue'
import Sorting from './components/Sorting.ce.vue'
import '@kvass/ui/style.css'

customElements.define('kvass-sorting', defineCustomElement(Sorting))
