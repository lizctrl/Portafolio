import { h } from './jsx';
import { App } from './App';
import './styles.css';

document.querySelector('#app')!.replaceChildren(h(App, null));
