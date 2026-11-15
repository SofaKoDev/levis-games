import '../../home/styles.css';
import {addHomeLink} from '../../shared/navigation.js';
import {illustrations} from '../../home/illustrations.js';
document.querySelector('#app').innerHTML=`<main class="games-home"><header class="welcome"><h1>Smoothie Station</h1><p class="tagline">A little kitchen is on its way!</p></header><div style="max-width:340px;margin:auto">${illustrations.smoothie}</div><p style="text-align:center">Coming soon. Let's explore Color Lab while we get ready!</p></main>`;
addHomeLink(document.querySelector('main'));
