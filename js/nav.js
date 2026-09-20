// Work dropdown: opens on hover (desktop). Clicking / tapping "Work" itself
// goes to /work.html, the overview page listing all categories.
const workItem=document.getElementById('workItem');
if(workItem&&window.matchMedia('(hover:hover)').matches){
  workItem.addEventListener('mouseenter',()=>workItem.classList.add('open'));
  workItem.addEventListener('mouseleave',()=>workItem.classList.remove('open'));
}
