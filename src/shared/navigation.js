import './navigation.css';
export const homeUrl = () => import.meta.env.BASE_URL;
export function addHomeLink(target = document.body) {
  const link=document.createElement('a');
  link.className='home-link';link.href=homeUrl();
  link.innerHTML='<span aria-hidden="true">⌂</span> Home';
  link.setAttribute('aria-label',"Home — Levi's Games");
  target.prepend(link);
}
