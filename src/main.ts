import { mount } from 'svelte';
import './muster/tokens.css';
import App from './App.svelte';

const ziel = document.getElementById('app');
if (!ziel) throw new Error('Kein #app im Dokument');

export default mount(App, { target: ziel });
