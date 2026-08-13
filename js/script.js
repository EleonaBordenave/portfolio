// ===== MENU BURGER (mobile) =====
const burger = document.querySelector(".burger");
const menu = document.querySelector(".nav-links");

if (burger && menu) {
    burger.addEventListener("click", () => {
        menu.classList.toggle("ouvert");
    });
}

// ===== CLOCHE : s'ouvre au scroll et se referme quand on remonte (page d'accueil) =====
const clocheImage = document.querySelector("#cloche-image");

if (clocheImage) {
    const clocheOuverte = "assets/images/cloche_logiciels_ouverte.png";
    const clocheFermee = "assets/images/cloche_logiciels_fermee.png";

    let clocheEstOuverte = false; // etat courant, pour ne pas rejouer le fondu inutilement

    // change l'image avec un petit fondu (on efface, on change, on refait apparaitre)
    const changerCloche = (nouvelleSource) => {
        clocheImage.style.opacity = "0";
        setTimeout(() => {
            clocheImage.src = nouvelleSource;
            clocheImage.style.opacity = "1";
        }, 400);
    };

    const observateurCloche = new IntersectionObserver((entrees) => {
        entrees.forEach((entree) => {
            if (entree.isIntersecting && !clocheEstOuverte) {
                // on arrive a sa hauteur : elle s'ouvre
                clocheEstOuverte = true;
                changerCloche(clocheOuverte);
            } else if (!entree.isIntersecting && clocheEstOuverte) {
                // elle sort de vue : on ne la referme QUE si on remonte
                // (dans ce cas elle repart vers le bas de l'ecran : top > 0)
                const sortParLeBas = entree.boundingClientRect.top > 0;
                if (sortParLeBas) {
                    clocheEstOuverte = false;
                    changerCloche(clocheFermee);
                }
            }
        });
    }, {
        // Bande d'observation etroite, placee haut dans l'ecran (entre 15%
        // et 25% du haut). En descendant, la cloche monte : elle atteint
        // donc cette bande bien apres avoir depasse le centre, ce qui
        // retarde l'ouverture jusqu'a ce qu'elle soit pleinement installee.
        rootMargin: "-15% 0px -75% 0px",
        threshold: 0
    });

    observateurCloche.observe(clocheImage);
}

// ===== POPUP ADDITION : ouvrir / fermer (page d'accueil uniquement) =====
const btnAddition = document.querySelector("#btn-addition");
const additionOverlay = document.querySelector("#addition-overlay");
const ticketFermer = document.querySelector("#ticket-fermer");

if (btnAddition && additionOverlay) {

    // Ouvrir au clic sur "Demander l'addition"
    btnAddition.addEventListener("click", () => {
        additionOverlay.classList.add("visible");
    });

    // Fermer avec la croix
    if (ticketFermer) {
        ticketFermer.addEventListener("click", () => {
            additionOverlay.classList.remove("visible");
        });
    }

    // Fermer en cliquant sur le voile (mais pas sur le ticket lui-meme)
    additionOverlay.addEventListener("click", (e) => {
        if (e.target === additionOverlay) {
            additionOverlay.classList.remove("visible");
        }
    });

    // Fermer avec la touche Echap
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            additionOverlay.classList.remove("visible");
        }
    });
}

// ===== FILTRES DES PROJETS (page projets) =====
// Chaque carte porte ses categories dans data-categorie (separees par un
// espace : un projet peut relever de plusieurs domaines) et chaque bouton
// la categorie qu'il affiche dans data-filtre. "tous" montre tout.
//
// Quand un projet couvre plusieurs domaines, il peut aussi porter des
// attributs data-ancre-<categorie> : le lien mene alors directement a la
// bonne partie de la page projet pendant que ce filtre est actif.
const zoneFiltres = document.querySelector("#projets-filtres");
const grilleProjets = document.querySelector("#projets-grille");

if (zoneFiltres && grilleProjets) {
    const boutons = zoneFiltres.querySelectorAll(".btn-filtre");
    const messageVide = document.querySelector("#projets-vide");

    // Les vedettes du haut suivent les memes filtres que la grille du bas
    const grilleVedettes = document.querySelector("#incontournables-grille");
    const sectionVedettes = grilleVedettes ? grilleVedettes.closest("section") : null;

    const cartesGrille = Array.from(grilleProjets.querySelectorAll(".projet-carte"));
    const cartesVedettes = grilleVedettes
        ? Array.from(grilleVedettes.querySelectorAll(".projet-carte"))
        : [];
    const toutesLesCartes = cartesVedettes.concat(cartesGrille);

    // On memorise le lien de depart de chaque carte (sans ancre)
    toutesLesCartes.forEach((carte) => {
        const lien = carte.querySelector(".btn");
        if (lien) carte.dataset.lienBase = lien.getAttribute("href");
    });

    // Etat de depart : les doublons de vedette restent caches
    cartesGrille.forEach((carte) => {
        if (carte.hasAttribute("data-vedette")) carte.classList.add("masque");
    });

    // Affiche ou masque une carte, et pointe son lien vers la bonne partie
    // de la page projet quand une ancre existe pour ce filtre.
    //
    // Les cartes marquees data-vedette sont les doublons de Coffea et du
    // Labo dans la grille : elles ne servent que lorsqu'un filtre est actif,
    // moment ou tous les projets sont mis sur le meme rang. Sous "Tous les
    // projets", ces deux-la sont presentes en haut, en vedette.
    const appliquer = (carte, filtre) => {
        const categories = carte.dataset.categorie.split(" ");
        let garder = (filtre === "tous" || categories.includes(filtre));
        if (carte.hasAttribute("data-vedette") && filtre === "tous") garder = false;
        carte.classList.toggle("masque", !garder);

        const lien = carte.querySelector(".btn");
        if (lien) {
            const ancre = carte.getAttribute("data-ancre-" + filtre);
            lien.setAttribute("href", carte.dataset.lienBase + (ancre || ""));
        }
        return garder;
    };

    zoneFiltres.addEventListener("click", (e) => {
        const bouton = e.target.closest(".btn-filtre");
        if (!bouton) return;

        const filtre = bouton.dataset.filtre;

        // Un seul bouton actif a la fois
        boutons.forEach((b) => b.classList.toggle("actif", b === bouton));

        const grilleVisible = cartesGrille.filter((c) => appliquer(c, filtre)).length;

        // Le bandeau "Les incontournables" n'existe que sous "Tous les
        // projets" : des qu'on filtre, tous les projets sont sur le meme
        // rang et Coffea comme Le Labo rejoignent la grille.
        cartesVedettes.forEach((c) => appliquer(c, filtre));
        if (sectionVedettes) sectionVedettes.hidden = (filtre !== "tous");

        if (messageVide) messageVide.hidden = (grilleVisible > 0);
    });
}

// ===== CARTES A COLLECTIONNER (pages projet) =====
// Un clic retourne la carte. Une seule ouverte a la fois : on referme
// la precedente, sinon on se retrouve avec six dos affiches.
const grilleCartes = document.querySelector("#etude-cartes");

if (grilleCartes) {
    const cartes = grilleCartes.querySelectorAll("[data-carte]");

    grilleCartes.addEventListener("click", (e) => {
        const carte = e.target.closest("[data-carte]");
        if (!carte) return;

        const etaitRetournee = carte.classList.contains("retournee");
        cartes.forEach((c) => c.classList.remove("retournee"));
        if (!etaitRetournee) carte.classList.add("retournee");
    });
}

// ===== CARROUSELS DES PUBLICATIONS (pages projet) =====
// Une planche visible a la fois : on fait glisser la piste d'une largeur
// a chaque clic. Les fleches disparaissent aux extremites, et les points
// sous le cadre suivent la planche affichee, comme sur Instagram.
document.querySelectorAll("[data-carrousel]").forEach((carrousel) => {
    const piste = carrousel.querySelector(".labo-pub-piste");
    const total = piste.children.length;
    const compteur = carrousel.querySelector("[data-compteur]");
    const fleches = carrousel.querySelectorAll(".labo-pub-fleche");
    // Les points sont juste apres le cadre, dans la meme publication
    const zonePoints = carrousel.parentElement.querySelector("[data-points]");
    const points = zonePoints ? zonePoints.children : [];
    let index = 0;

    const afficher = () => {
        piste.style.transform = "translateX(" + (-index * 100) + "%)";
        if (compteur) compteur.textContent = (index + 1) + "/" + total;
        Array.from(points).forEach((p, i) => p.classList.toggle("actif", i === index));
        fleches.forEach((f) => {
            const sens = Number(f.dataset.sens);
            f.hidden = (sens < 0 && index === 0) || (sens > 0 && index === total - 1);
        });
    };

    carrousel.addEventListener("click", (e) => {
        const fleche = e.target.closest(".labo-pub-fleche");
        if (!fleche) return;
        index = Math.min(total - 1, Math.max(0, index + Number(fleche.dataset.sens)));
        afficher();
    });

    afficher();
});

// ===== EDITEUR D'AVATAR (pages projet) =====
// Reprend l'editeur du site Le Labo : un apercu sur fond de theme, et
// quatre onglets (Fourrure / Taches / Yeux / Bouche). Chaque option est
// illustree par une miniature de l'avatar, fabriquee avec les memes
// calques SVG que l'apercu principal.
const zoneAvatar = document.querySelector("#etude-avatar");

if (zoneAvatar) {
    const DOSSIER = zoneAvatar.dataset.dossier;

    // Les 12 teintes, communes au pelage et aux taches
    const COULEURS = [
        { id: "noir",          hex: "#333333" },
        { id: "gris-bleu",     hex: "#5A5A5A" },
        { id: "gris-silver",   hex: "#9AA0A6" },
        { id: "smoke-argente", hex: "#D9D9D9" },
        { id: "brun",          hex: "#6B4F3A" },
        { id: "chocolat",      hex: "#4A2F24" },
        { id: "cannelle",      hex: "#7A5C45" },
        { id: "roux-fonce",    hex: "#A25F3B" },
        { id: "roux-moyen",    hex: "#B8784A" },
        { id: "roux-clair",    hex: "#C9986B" },
        { id: "creme",         hex: "#F0D8A8" },
        { id: "blanc",         hex: "#F8F5ED" }
    ];

    // Les quatre taches, dans leur ordre d'empilement impose.
    // Chacune s'active independamment et porte sa propre couleur.
    const TACHES = [
        { id: "tacheg",  nom: "Joue gauche", fichier: "tache-gauche-{c}" },
        { id: "tached",  nom: "Joue droite", fichier: "tache-droite-{c}" },
        { id: "menton",  nom: "Menton",      fichier: "tache-menton-{c}" },
        { id: "rayures", nom: "Rayures",     fichier: "rayures-tete-{c}" }
    ];

    const YEUX = [
        { id: "ouverts",     g: "oeuil-gauche-ouvert", d: "oeuil-doit-ouvert" },
        { id: "clin-gauche", g: "clin-doeuil-gauche",  d: "oeuil-doit-ouvert" },
        { id: "clin-droit",  g: "oeuil-gauche-ouvert", d: "clin-doeuil-droit" },
        { id: "clins",       g: "clin-doeuil-gauche",  d: "clin-doeuil-droit" }
    ];
    const yeuxParId = (id) => YEUX.find((y) => y.id === id) || YEUX[0];

    const BOUCHES = [
        { id: "fermee",  fichier: "bouche-ferme" },
        { id: "ouverte", fichier: "bouche-ouverte" }
    ];

    const config = {
        fourrure: "noir",
        yeux: "ouverts",
        bouche: "fermee",
        theme: "pink",
        // La tache que la palette du bas modifie
        tacheSelectionnee: "tacheg",
        // Etat de chaque tache : allumee ou non, et sa teinte
        taches: {
            tacheg:  { actif: false, couleur: "blanc" },
            tached:  { actif: false, couleur: "blanc" },
            menton:  { actif: false, couleur: "blanc" },
            rayures: { actif: false, couleur: "blanc" }
        }
    };

    // Construit la pile de calques d'un avatar. Avec `forcerTache`, la
    // miniature ne montre QUE cette tache : on voit ainsi ce qu'elle
    // apporte, sans les autres taches deja allumees.
    const pileHTML = (forces, forcerTache) => {
        const c = Object.assign({}, config, forces || {});
        const img = (fichier) => '<img alt="" src="' + DOSSIER + fichier + '.svg">';

        let html = img("fond-" + c.fourrure);
        TACHES.forEach((t) => {
            const etat = config.taches[t.id];
            const allumee = forcerTache ? (t.id === forcerTache) : etat.actif;
            if (allumee) html += img(t.fichier.replace("{c}", etat.couleur));
        });
        html += img("fond-traits-de-base");
        const y = yeuxParId(c.yeux);
        html += img(y.g) + img(y.d);
        html += img(c.bouche === "ouverte" ? "bouche-ouverte" : "bouche-ferme");
        return html;
    };

    const pilePrincipale = zoneAvatar.querySelector('[data-pile="principal"]');
    const scene = zoneAvatar.querySelector(".avatar-scene");

    // Redessine l'apercu, les miniatures et l'etat actif de chaque bouton
    const dessiner = () => {
        pilePrincipale.innerHTML = pileHTML();
        scene.dataset.theme = config.theme;

        // Options simples (fourrure, yeux, bouche, theme)
        zoneAvatar.querySelectorAll("[data-cible]").forEach((el) => {
            el.classList.toggle("actif", config[el.dataset.cible] === el.dataset.valeur);
            const mini = el.querySelector(".avatar-mini");
            if (mini) {
                const forces = {};
                forces[el.dataset.cible] = el.dataset.valeur;
                mini.innerHTML = pileHTML(forces);
            }
        });

        // Tuiles de taches : la miniature montre la tache allumee
        zoneAvatar.querySelectorAll("[data-tache]").forEach((el) => {
            const id = el.dataset.tache;
            el.classList.toggle("actif", config.taches[id].actif);
            // La tache en cours d'edition porte un liestre plus marque
            el.classList.toggle("selectionnee", id === config.tacheSelectionnee);
            const mini = el.querySelector(".avatar-mini");
            if (mini) mini.innerHTML = pileHTML(null, id);
        });

        // La palette unique reflete la couleur de la tache selectionnee
        const selection = config.taches[config.tacheSelectionnee];
        zoneAvatar.querySelectorAll("[data-tache-couleur]").forEach((el) => {
            el.classList.toggle("actif", selection.couleur === el.dataset.valeur);
        });

        const nomActive = zoneAvatar.querySelector("[data-tache-active]");
        if (nomActive) {
            const t = TACHES.find((x) => x.id === config.tacheSelectionnee);
            nomActive.textContent = t ? t.nom.toLowerCase() : "";
        }
    };

    // --- Fabrication des listes d'options ---
    const pastilles = (cible, couleurs) => couleurs.map((c) =>
        '<button type="button" class="avatar-pastille" data-cible="' + cible +
        '" data-valeur="' + c.id + '" style="--pastille:' + c.hex +
        '" aria-label="' + c.id.replace(/-/g, " ") + '"></button>'
    ).join("");

    const tuiles = (cible, options) => options.map((o) =>
        '<button type="button" class="avatar-tuile" data-cible="' + cible +
        '" data-valeur="' + o.id + '"><span class="avatar-mini"></span></button>'
    ).join("");

    // Les quatre taches, en tuiles illustrees comme les yeux et la bouche
    const tuilesTaches = () => TACHES.map((t) =>
        '<button type="button" class="avatar-tuile" data-tache="' + t.id +
        '" aria-label="' + t.nom + '"><span class="avatar-mini"></span></button>'
    ).join("");

    // Une seule palette pour toutes les taches : elle agit sur la derniere
    // tache selectionnee
    const paletteTaches = () => COULEURS.map((c) =>
        '<button type="button" class="avatar-pastille" data-tache-couleur data-valeur="' + c.id +
        '" style="--pastille:' + c.hex + '" aria-label="' + c.id.replace(/-/g, " ") + '"></button>'
    ).join("");
    zoneAvatar.querySelector('[data-liste="fourrure"]').innerHTML = pastilles("fourrure", COULEURS);
    zoneAvatar.querySelector('[data-liste="taches"]').innerHTML = tuilesTaches();
    zoneAvatar.querySelector('[data-liste="tacheCouleur"]').innerHTML = paletteTaches();
    zoneAvatar.querySelector('[data-liste="yeux"]').innerHTML = tuiles("yeux", YEUX);
    zoneAvatar.querySelector('[data-liste="bouche"]').innerHTML = tuiles("bouche", BOUCHES);

    // --- Les onglets ---
    zoneAvatar.addEventListener("click", (e) => {
        const onglet = e.target.closest("[data-onglet]");
        if (!onglet) return;
        zoneAvatar.querySelectorAll("[data-onglet]").forEach((o) => {
            o.classList.toggle("actif", o === onglet);
        });
        zoneAvatar.querySelectorAll("[data-panneau]").forEach((p) => {
            p.hidden = (p.dataset.panneau !== onglet.dataset.onglet);
        });
    });

    // --- Les options ---
    zoneAvatar.addEventListener("click", (e) => {
        // Allumer / eteindre une tache. Elle devient aussi celle que la
        // palette du bas modifie.
        const interrupteur = e.target.closest("[data-tache]");
        if (interrupteur) {
            const id = interrupteur.dataset.tache;
            config.taches[id].actif = !config.taches[id].actif;
            config.tacheSelectionnee = id;
            dessiner();
            return;
        }

        // La palette agit sur la derniere tache selectionnee, qu'elle allume
        const teinte = e.target.closest("[data-tache-couleur]");
        if (teinte) {
            const etat = config.taches[config.tacheSelectionnee];
            etat.couleur = teinte.dataset.valeur;
            etat.actif = true;
            dessiner();
            return;
        }

        // Fourrure, yeux, bouche, theme
        const bouton = e.target.closest("[data-cible]");
        if (!bouton) return;
        config[bouton.dataset.cible] = bouton.dataset.valeur;
        dessiner();
    });

    // --- Le tirage au sort ---
    const boutonHasard = zoneAvatar.querySelector("#avatar-hasard");
    if (boutonHasard) {
        boutonHasard.addEventListener("click", () => {
            const tirer = (liste) => liste[Math.floor(Math.random() * liste.length)];
            config.fourrure = tirer(COULEURS).id;
            config.yeux = tirer(YEUX).id;
            config.bouche = tirer(BOUCHES).id;
            TACHES.forEach((t) => {
                config.taches[t.id].actif = (Math.random() < 0.5);
                config.taches[t.id].couleur = tirer(COULEURS).id;
            });
            dessiner();
        });
    }

    dessiner();
}
// ===== FORMULAIRE DE CONTACT (page contact) =====
//
// A REMPLIR POUR RECEVOIR LES MESSAGES DIRECTEMENT PAR MAIL :
// 1. creer un compte gratuit sur https://formspree.io (avec e.bordenave.contact@gmail.com)
// 2. creer un nouveau formulaire : Formspree donne une adresse du type
//    https://formspree.io/f/xdorwlqz  ->  l'identifiant est la fin : xdorwlqz
// 3. coller cet identifiant entre les guillemets ci-dessous.
//https://formspree.io/f/xnpavqdg
// Tant que la ligne reste vide, le formulaire ouvre la messagerie du visiteur
// avec un mail deja redige (solution de secours, sans inscription).
const IDENTIFIANT_FORMSPREE = "xnpavqdg";

const contactForm = document.querySelector("#contact-form");

if (contactForm) {
    const zoneErreur = contactForm.querySelector("#form-erreur");
    const zoneSucces = contactForm.querySelector("#form-succes");
    const boutonEnvoyer = contactForm.querySelector("#form-envoyer");
    const adresse = "e.bordenave.contact@gmail.com";

    const afficherErreur = (texte) => {
        zoneErreur.textContent = texte;
        zoneErreur.hidden = false;
    };

    // La confirmation s'affiche au centre de l'ecran, dans le meme
    // papier que le ticket de l'addition. Sans ce popup dans la page,
    // on retombe sur le message en ligne sous le formulaire.
    const popup = document.querySelector("#confirmation-overlay");
    const popupTexte = document.querySelector("#confirmation-texte");

    const fermerPopup = () => {
        if (popup) popup.classList.remove("visible");
    };

    if (popup) {
        const boutonsFermer = [
            document.querySelector("#confirmation-fermer"),
            document.querySelector("#confirmation-ok")
        ];
        boutonsFermer.forEach((b) => {
            if (b) b.addEventListener("click", fermerPopup);
        });

        // Clic sur le voile, mais pas sur le papier lui-meme
        popup.addEventListener("click", (e) => {
            if (e.target === popup) fermerPopup();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") fermerPopup();
        });
    }

    const afficherSucces = (texte) => {
        if (popup) {
            if (popupTexte) popupTexte.textContent = texte;
            popup.classList.add("visible");
            return;
        }
        zoneSucces.textContent = texte;
        zoneSucces.hidden = false;
    };

    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nom = contactForm.nom.value.trim();
        const email = contactForm.email.value.trim();
        const telephone = contactForm.telephone.value.trim();
        const entreprise = contactForm.entreprise.value.trim();
        const sujet = contactForm.sujet.value;
        const message = contactForm.message.value.trim();

        // On repart d'une ardoise propre a chaque tentative
        zoneErreur.hidden = true;
        zoneSucces.hidden = true;
        contactForm.querySelectorAll(".champ-invalide").forEach((champ) => {
            champ.classList.remove("champ-invalide");
        });

        // Verification des champs obligatoires
        const manquants = [];
        if (!nom) manquants.push(contactForm.nom);
        if (!email || !contactForm.email.checkValidity()) manquants.push(contactForm.email);
        if (!message) manquants.push(contactForm.message);

        if (manquants.length > 0) {
            manquants.forEach((champ) => champ.classList.add("champ-invalide"));
            manquants[0].focus();
            afficherErreur("Il manque quelques ingrédients : nom, email valide et message sont nécessaires.");
            return;
        }

        // --- Cas 1 : envoi direct par Formspree (rien ne s'ouvre chez le visiteur) ---
        if (IDENTIFIANT_FORMSPREE) {
            boutonEnvoyer.disabled = true;
            boutonEnvoyer.textContent = "Envoi en cours…";

            try {
                const reponse = await fetch("https://formspree.io/f/" + IDENTIFIANT_FORMSPREE, {
                    method: "POST",
                    headers: { "Accept": "application/json" },
                    body: new FormData(contactForm)
                });

                if (reponse.ok) {
                    contactForm.reset();
                    afficherSucces("Merci, votre réservation est bien enregistrée. Je vous réponds sous 48 h.");
                } else {
                    afficherErreur("L'envoi n'a pas abouti. Écrivez-moi directement à " + adresse + ".");
                }
            } catch (erreur) {
                afficherErreur("L'envoi n'a pas abouti (connexion). Écrivez-moi directement à " + adresse + ".");
            }

            boutonEnvoyer.disabled = false;
            boutonEnvoyer.textContent = "Envoyer la réservation";
            return;
        }

        // --- Cas 2 (secours) : on ouvre la messagerie avec un mail deja redige ---
        const objet = sujet + " - " + nom;
        const corps = [
            "Nom : " + nom,
            "Email : " + email,
            "Téléphone : " + (telephone || "non renseigné"),
            "Entreprise : " + (entreprise || "non renseignée"),
            "Motif : " + sujet,
            "",
            message
        ].join("\n");

        window.location.href = "mailto:" + adresse
            + "?subject=" + encodeURIComponent(objet)
            + "&body=" + encodeURIComponent(corps);
    });
}
