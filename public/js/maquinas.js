function mudar_icone_on(id_da_img) {
    const icone = document.getElementById(id_da_img);
    if (!icone) return; 
    if (!icone.dataset.srcNormal) {
        icone.dataset.srcNormal = icone.src;
    }
    const srcHover = icone.dataset.hoverSrc;
    icone.src = srcHover;
}
function mudar_icone_lv(id_da_img) {
    const icone = document.getElementById(id_da_img);
    if (!icone) return; 
    const srcNormal = icone.dataset.srcNormal;
    icone.src = srcNormal;
}