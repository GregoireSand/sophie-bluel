const worksURL = "http://localhost:5678/api/works";
const categoriesURL = "http://localhost:5678/api/categories";
const token = localStorage.getItem("token");

let allWorks = [];
let selectedDivId;


const getCategories = () => {
    fetch(categoriesURL)
        .then(response => response.json())
        .then(categories => {
            const containerCategories = document.getElementById("categories");
            categories.forEach(category => {
                let btn = document.createElement('button');
                btn.classList.add("category-button");
                btn.id = `cat-${category.id}`;
                btn.innerHTML = category.name;
                btn.addEventListener('click', () => filterWorksByCategory(category.id));
                containerCategories.appendChild(btn);
            });
       
            document.getElementById('btnTous').addEventListener('click', () => displayWorks(allWorks));
        });
}

const getWorks = () => {
    fetch(worksURL)
        .then(response => response.json())
        .then(works => {
            allWorks = works;
            displayWorks(works);
        });
}

const displayWorks = (works) => {
    const container = document.querySelector(".gallery");
    container.innerHTML = ''; // vider works
    works.forEach(work => {
        let div = document.createElement("div");
        div.setAttribute("id", `card${work.id}`) ;
        let img = document.createElement("img");
        img.src = work.imageUrl;
        img.setAttribute("data-image-id", work.id); // Ajoute un attribut pour l'identifiant de l'image
        let p = document.createElement("p");
        p.innerText = work.title;
        div.appendChild(img);
        div.appendChild(p);
        container.appendChild(div);
    }); 

    // Boucle qui insère les images dans la modale

    for (let i = 0; i < works.length; i++) {
        document.querySelector("#modalCardContainer").innerHTML +=
            `<div class="card" id="${works[i].id}">
                <div class="card-img">
                    <img src='${works[i].imageUrl}'>  
                    <button aria-label="supprimer-projet" class= "card-bouton_supprimer" id="card${works[i].id}-bouton_supprimer">
                        <i class="fa-solid fa-trash-can" style="color: #ffffff;"></i>
                    </button>           
                </div> 
            </div>`
        }
        deleteProject();
}

const filterWorksByCategory = (categoryId) => {
    const filteredWorks = allWorks.filter(work => work.categoryId === categoryId);
    displayWorks(filteredWorks);
}

getCategories();
getWorks();


// Ajout du bandeau Edition

if (token != null) {
    const editionSelecteur = document.querySelector("#edition");
    editionSelecteur.style.display = "flex";
    const headerSelecteur = document.querySelector("header");
    headerSelecteur.style.margin = "87px 0";
    const navLoginSelecteur = document.querySelector("#nav-login");
    navLoginSelecteur.textContent = "logout"
    const filtresSelecteur = document.querySelector("#categories");
    filtresSelecteur.style.display = "none";
    const editProjectsBtn = document.querySelector("#editProjectsBtn");
    editProjectsBtn.style.display = "flex";


    // -- BOUTON LOGOUT --
    const logoutSelecteur = document.querySelector("#nav-login");
    logoutSelecteur.addEventListener("click", (event) => {
        event.preventDefault();
        window.localStorage.removeItem("token");
        document.location.reload();
    });
}


    // -- MODALE -- //


const openModal = function (e) {
    e.preventDefault()
    const modaleElement = document.querySelector('#modalContainer');
    modaleElement.style.display = 'flex';
    modaleElement.style.justifyContent = 'center';
    modaleElement.style.alignItems = 'center';
    modaleElement.removeAttribute('aria-hidden');
    modaleElement.setAttribute('aria-modal', 'true');
    modaleElement.addEventListener('click', closeModal);
    modaleElement.querySelector('.js-modal-close').addEventListener('click', closeModal);
    modaleElement.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);
    const modalePage2Selector = document.querySelector('#modale_ajout_projet');
    modalePage2Selector.style.display = 'none';
    const modalePage1Selector = document.querySelector('#modale_index');
    modalePage1Selector.style.display = 'flex';
}

const closeModal = function (e) {
    e.preventDefault()
    const modaleElement = document.querySelector('#modalContainer');
    modaleElement.style.display = 'none';
    modaleElement.setAttribute('aria-hidden', 'true');
    modaleElement.removeAttribute('aria-modale');
    modaleElement.removeEventListener('click', closeModal);
    modaleElement.querySelector('.js-modal-close').removeEventListener('click', closeModal);
    modaleElement.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
}

    //---- MODALE PAGE 2 ----//

const ouvreModaleAjouterProjet = function (e) {
       e.preventDefault();
       const modaleElement = document.querySelector('#modale_index');
       modaleElement.style.display = 'none';
       const modalePage2Selector = document.querySelector('#modale_ajout_projet');
       modalePage2Selector.style.display = 'flex';
       const fermerModale = document.querySelector('#modale-page2-close').addEventListener('click', closeModal);
       const modaleRetourSelector = document.querySelector('#modale-retour').addEventListener('click', openModal);
   }

const stopPropagation = function (e) {
    e.stopPropagation();
}

document.querySelector('#modale-ajout_photo').addEventListener('click', ouvreModaleAjouterProjet);
document.querySelector("#editProjectsBtn").addEventListener("click", openModal)


    //---- Supprimer dynamiquement les projets ----//

function deleteProject() {
    const deleteButtons = document.querySelectorAll('.card-bouton_supprimer');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.card');
            const cardId = card.id;

            // Supprimer l'image de la modale
            card.remove();

            // Supprimer l'image sur le site web
            document.querySelector(`.gallery #card${cardId}`).remove(); 

            // Supprimer l'image sur le serveur
            fetch(`http://localhost:5678/api/works/${cardId}`, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.status === 200) {
                    // La suppression sur le serveur a réussi
                    console.log(`Image avec l'ID ${cardId} supprimée du serveur.`);
                } if (response.status === 401) {
                    console.log("Erreur d'authentification");
                } 
            })
            .catch(error => {
                console.error("Erreur lors de la suppression de l'image sur le serveur : " + error);
            });
        });
    });
} 


// -- AJOUTER UNE PHOTO -- 
let isImageUploaded = false;
const inputFile = document.querySelector('#ajouter-fichier');

// afficher l'image ajoutée dans le form 
let imageAjoutee = "";
inputFile.addEventListener('change', function () {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        imageAjoutee = reader.result;
        let containerAjoutImageSelector = document.querySelector('.container-ajouter-fichier');
        containerAjoutImageSelector.style.backgroundImage = `url(${imageAjoutee})`;
        containerAjoutImageSelector.style.backgroundColor = '#E8F1F6';
        inputFile.style.color = "transparent";
        inputFile.style.backgroundColor = "transparent";
        inputFile.style.backgroundImage = 'url()';
        document.querySelector("label#ajouter-fichier").style.display="none";
        document.querySelector(".container-ajouter-fichier p").style.display="none";
        isImageUploaded = true;
        changeSubmitColor();
    })
    reader.readAsDataURL(this.files[0]);
})

// -- Change la couleur du bouton valider quand tous les input sont remplis 
let isTitleFiled = false;
let isCategoryFiled = false;

function changeSubmitColor() {
    if (isImageUploaded == true && isTitleFiled == true && isCategoryFiled == true) {
        document.querySelector('#modale-form-submit').style.backgroundColor = "#1D6154";
        document.querySelector('#modale_ajout_projet #form_incomplet').style.display = "none";
    }
    else {
        document.querySelector('#modale-form-submit').style.backgroundColor = "#A7A7A7"
        document.querySelector('#modale_ajout_projet #form_incomplet').style.display = "block";
    }
}

document.querySelector('#ajouter-titre').addEventListener('input', function () {
    if (document.querySelector('#ajouter-titre').value != "") {
        isTitleFiled = true;
    }
    else {
        isTitleFiled = false;
    }
    changeSubmitColor();
})

document.querySelector('#select_categorie').addEventListener('input', function () {
    if (document.querySelector('#select_categorie').value != "") {
        isCategoryFiled = true;
    }
    else {
        isCategoryFiled = false;
    }
    changeSubmitColor();
})

document.querySelector('#modale-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    let titleValue = document.querySelector('#ajouter-titre').value;
    const getCategory = document.querySelector("#select_categorie").value;

    // condition si form bien complété
    if (isImageUploaded == true && titleValue != "" && getCategory != "") {
        const modaleForm = document.querySelector('#modale-form');
        const formData = new FormData(modaleForm);

        // requête fetch en POST pour ajouter les projets 
        const addProjectAPI = await fetch('http://localhost:5678/api/works', {
            method: "POST",
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })

        if (addProjectAPI.ok) {
            const res = await addProjectAPI.json();

            // -- ajouter les projets dans le DOM - partie galerie
            const gallery = document.querySelector(".gallery")
            const createFigure = document.createElement("figure");
            gallery.appendChild(createFigure);
            createFigure.setAttribute('id', `card${res.id}`);
            const createImage = document.createElement("img");
            createImage.src = imageAjoutee;
            createFigure.appendChild(createImage);
            const createFigcaption = document.createElement("figcaption");
            createFigcaption.textContent = formData.get('title');
            createFigure.appendChild(createFigcaption);

            // ajouter les projets dans le DOM - partie modale
            const divModale = document.createElement('div');
            divModale.classList.add('card');
            divModale.setAttribute('id', res.id);
            document.querySelector('#modalCardContainer').appendChild(divModale);
            const divImgModale = document.createElement('div');
            divImgModale.setAttribute('class', 'card-img');
            divModale.appendChild(divImgModale);
            const imgModale = document.createElement('img');
            divImgModale.appendChild(imgModale);
            imgModale.src = imageAjoutee;
            const buttonModale = document.createElement('button');
            buttonModale.setAttribute('class', 'card-bouton_supprimer');
            divImgModale.appendChild(buttonModale);
            const iModale = document.createElement('i');
            iModale.setAttribute('class', 'fa-solid fa-trash-can');
            buttonModale.appendChild(iModale);
         
            // appel la fonction pour supprimer des projets si besoin
            deleteProject();

            // vide les valeurs renseignées dans le formulaire et affiche sa version de base 
            document.querySelector('#ajouter-titre').value = "";
            document.querySelector("#select_categorie").value = "";
            document.querySelector('.container-ajouter-fichier').style.backgroundImage = `url()`;
            inputFile.style.zIndex = '1';
            document.querySelector("label#ajouter-fichier").style.display="flex";
            document.querySelector("label#ajouter-fichier").style.zIndex = "1";
            document.querySelector(".container-ajouter-fichier p").style.display = "flex";
            document.querySelector(".container-ajouter-fichier p").style.zIndex = "1";
            inputFile.style.color = "#E8F1F6";
            inputFile.style.backgroundColor = "#E8F1F6";
            inputFile.style.backgroundImage = 'url(assets/icons/image.png)';
            const modaleElement = document.querySelector('#modalContainer');
            modaleElement.style.display = 'none';
            modaleElement.setAttribute('aria-hidden', 'true');
            modaleElement.removeAttribute('aria-modale');
            modaleElement.removeEventListener('click', closeModal);
            modaleElement.querySelector('.js-modal-close').removeEventListener('click', closeModal);
            modaleElement.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
        }
        else {
            console.error('une erreur est survenue')
        }
    }
    else {
        document.querySelector('#modale_ajout_projet #form_incomplet').style.display = "block";
    }
})