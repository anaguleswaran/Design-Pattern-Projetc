import "./style.css";

import { Tache } from "./models/Tache";
import type { Priorite } from "./models/Tache";
import { TacheService } from "./services/TacheService";
import { TagBuilder } from "./core/TagBuilder";

const service = new TacheService();

function afficherTaches() {
  document.body.innerHTML = "";

  service.getAll().forEach((tache, index) => {
    const title = new TagBuilder("h2").withText(tache.title).build();
    const description = new TagBuilder("p").withText(tache.description).build();
    const priorite = new TagBuilder("P")
      .withText(`Priorité : ${tache.priorite}`)
      .build();

    const modifier = new TagBuilder("button")
      .withText("Modifier")
      .withEvent("click", () => {
        const nouveauTitre = prompt("Nouveau titre", tache.title);
        const nouvelleDescription = prompt(
          "Nouvelle description",
          tache.description,
        );
        const nouvellePriorite = prompt(
          "Nouvelle priorité : urgente, standard ou faible",
          tache.priorite,
        );

        if (
          nouveauTitre !== null &&
          nouvelleDescription !== null &&
          (nouvellePriorite === "urgente" ||
            nouvellePriorite === "standard" ||
            nouvellePriorite === "faible")
        ) {
          service.update(
            index,
            new Tache(nouveauTitre, nouvelleDescription, nouvellePriorite),
          );
          afficherTaches();
        }
      })
      .build();

    const supprimer = new TagBuilder("button")
      .withText("Supprimer")
      .withEvent("click", () => {
        service.delete(index);
        afficherTaches();
      })
      .build();

    const card = new TagBuilder("div")
      .withClass("task")
      .withChild(title)
      .withChild(description)
      .withChild(priorite)
      .withChild(modifier)
      .withChild(supprimer)
      .build();

    document.body.appendChild(card);
  });

  afficherFormulaire();
}

function afficherFormulaire() {
  const titleInput = new TagBuilder("input")
    .withStyle("display", "block")
    .build() as HTMLInputElement;
  titleInput.placeholder = "Titre";

  const descriptionInput = new TagBuilder("input")
    .withStyle("display", "block")
    .build() as HTMLInputElement;

  descriptionInput.placeholder = "Description";

  const select = document.createElement("select");

  const priorites: Priorite[] = ["urgente", "standard", "faible"];

  priorites.forEach((priorite) => {
    const option = document.createElement("option");

    option.value = priorite;
    option.textContent = priorite;

    select.appendChild(option);
  });

  const bouton = new TagBuilder("button")
    .withText("Ajouter une tâche")
    .withEvent("click", () => {
      const priorite = select.value as Priorite;

      service.create(
        new Tache(titleInput.value, descriptionInput.value, priorite),
      );

      afficherTaches();
    })
    .build();

  document.body.appendChild(titleInput);
  document.body.appendChild(descriptionInput);
  document.body.appendChild(select);
  document.body.appendChild(bouton);
}

afficherTaches();
