import "./style.css";

import { BaseComponent } from "./components/BaseComponent";
import { Card } from "./components/ui/Card";
import { List } from "./components/ui/List";
import { TagBuilder } from "./core/TagBuilder";
import { FormController } from "./forms/FormController";
import {
  EmailValidation,
  MinLengthValidation,
  PatternValidation,
  RequiredValidation,
} from "./forms/validation";
import { HttpClient } from "./http/HttpClient";
import { installMockApi } from "./http/mockApi";
import type { Priorite } from "./models/Tache";
import { Router, type RouteMatch } from "./router/Router";
import { TacheService } from "./services/TacheService";
import {
  AppStateStore,
  type StoredTask,
  type TaskDraft,
} from "./store/AppStateStore";

const store = AppStateStore.getInstance();
store.useLocalStorage();

const router = new Router([
  { path: "/", label: "Liste" },
  { path: "/tasks/:taskId", label: "Détail" },
  { path: "/tasks/:taskId/edit", label: "Édition" },
  { path: "/about", label: "À propos" },
]);

installMockApi();
const httpClient = new HttpClient("/api");
const tacheService = new TacheService(httpClient);

function createTaskForm(
  initialValues: TaskDraft,
  submitLabel: string,
  onSubmit: (values: TaskDraft) => Promise<void>,
  onValuesChange?: (values: TaskDraft) => void,
): { cleanup: () => void; element: HTMLElement } {
  const formController = new FormController<TaskDraft>(initialValues, {
    title: [
      new RequiredValidation("Titre requis"),
      new MinLengthValidation(3, "3 caractères minimum"),
    ],
    description: [
      new RequiredValidation("Description requise"),
      new MinLengthValidation(5, "5 caractères minimum"),
    ],
    ownerEmail: [
      new RequiredValidation("Email requis"),
      new EmailValidation("Email invalide"),
    ],
    priorite: [new PatternValidation(/^(urgente|standard|faible)$/, "Priorité invalide")],
  });

  const titleInput = new TagBuilder("input").build() as HTMLInputElement;
  titleInput.placeholder = "Titre";

  const descriptionInput = new TagBuilder("input").build() as HTMLInputElement;
  descriptionInput.placeholder = "Description";

  const emailInput = new TagBuilder("input").build() as HTMLInputElement;
  emailInput.placeholder = "Email";

  const prioritySelect = new TagBuilder("select").build() as HTMLSelectElement;
  (["urgente", "standard", "faible"] as Priorite[]).forEach((priorite) => {
    const option = document.createElement("option");
    option.value = priorite;
    option.textContent = priorite;
    prioritySelect.appendChild(option);
  });

  const titleError = new TagBuilder("small").withClass("field-error").build();
  const descriptionError = new TagBuilder("small").withClass("field-error").build();
  const emailError = new TagBuilder("small").withClass("field-error").build();
  const priorityError = new TagBuilder("small").withClass("field-error").build();

  const form = new TagBuilder("form").withClass("form").build();
  const submitButton = new TagBuilder("button").withText(submitLabel).build();

  const fields: Array<[string, HTMLElement, HTMLElement]> = [
    ["Titre", titleInput, titleError],
    ["Description", descriptionInput, descriptionError],
    ["Email", emailInput, emailError],
    ["Priorité", prioritySelect, priorityError],
  ];

  fields.forEach(([labelText, field, error]) => {
    const wrapper = new TagBuilder("label").withClass("field").build();
    wrapper.appendChild(new TagBuilder("span").withText(labelText).build());
    wrapper.appendChild(field);
    wrapper.appendChild(error);
    form.appendChild(wrapper);
  });
  form.appendChild(submitButton);

  const renderErrors = () => {
    const errors = formController.getErrors();
    titleError.textContent = errors.title[0] ?? "";
    descriptionError.textContent = errors.description[0] ?? "";
    emailError.textContent = errors.ownerEmail[0] ?? "";
    priorityError.textContent = errors.priorite[0] ?? "";
  };

  const cleanups = [
    formController.bindInput("title", titleInput),
    formController.bindInput("description", descriptionInput),
    formController.bindInput("ownerEmail", emailInput),
    formController.bindInput("priorite", prioritySelect),
    formController.subscribeErrors(renderErrors),
    formController.subscribeValues((values) => {
      onValuesChange?.(values);
    }),
  ];

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!formController.validateAll()) {
      return;
    }

    void onSubmit(formController.getValues());
  });

  renderErrors();

  return {
    cleanup: () => {
      cleanups.forEach((cleanup) => cleanup());
    },
    element: form,
  };
}

class TasksPage extends BaseComponent {
  render(): HTMLElement {
    const container = new TagBuilder("div").withClass("layout").build();
    const formHost = new TagBuilder("div").build();
    const listHost = new TagBuilder("div").build();
    const info = new TagBuilder("p")
      .withClass("muted")
      .withText("Démo CRUD branchée sur un client HTTP mocké.")
      .build();
    const taskForm = createTaskForm(
      store.getState().draft,
      "Ajouter",
      async (values) => {
        await tacheService.create(values);
        await refreshTasks();
        await store.dispatch({
          type: "SET_DRAFT",
          payload: {
            title: "",
            description: "",
            ownerEmail: "",
            priorite: "standard",
          },
        });
      },
      (values) => {
        void store.dispatch({ type: "SET_DRAFT", payload: values });
      },
    );

    const renderTasks = () => {
      listHost.innerHTML = "";

      const list = new List<StoredTask>({
        items: store.getState().tasks,
        emptyText: "Aucune tâche",
        renderItem: (task, index) => {
          const actions = new TagBuilder("div").withClass("actions").build();

          actions.appendChild(
            new TagBuilder("button")
              .withText("Voir")
              .withEvent("click", () => router.navigate(`/tasks/${index}`))
              .build(),
          );

          actions.appendChild(
            new TagBuilder("button")
              .withText("Modifier")
              .withEvent("click", () => router.navigate(`/tasks/${index}/edit`))
              .build(),
          );

          actions.appendChild(
            new TagBuilder("button")
              .withClass("danger")
              .withText("Supprimer")
              .withEvent("click", () => {
                void tacheService.delete(index).then(() => refreshTasks());
              })
              .build(),
          );

          return new Card({
            title: task.title,
            subtitle: task.priorite,
            children: [
              new TagBuilder("p").withText(task.description).build(),
              new TagBuilder("small").withText(task.ownerEmail).build(),
            ],
            footer: actions,
          }).render();
        },
      }).render();

      listHost.appendChild(list);
    };

    this.registerCleanup(taskForm.cleanup);
    this.registerCleanup(
      store.subscribe(() => {
        renderTasks();
      }),
    );

    formHost.appendChild(
      new Card({
        title: "Nouvelle tâche",
        children: [taskForm.element, info],
      }).render(),
    );

    container.appendChild(formHost);
    container.appendChild(listHost);

    renderTasks();

    return container;
  }
}

class TaskDetailsPage extends BaseComponent<{ taskIndex: number; children?: never[] }> {
  render(): HTMLElement {
    const task = store.getState().tasks[this.props.taskIndex];

    if (!task) {
      return new Card({
        title: "Introuvable",
        children: [
          new TagBuilder("button")
            .withText("Retour")
            .withEvent("click", () => router.navigate("/"))
            .build(),
        ],
      }).render();
    }

    return new Card({
      title: task.title,
      subtitle: task.priorite,
      children: [
        new TagBuilder("p").withText(task.description).build(),
        new TagBuilder("small").withText(task.ownerEmail).build(),
      ],
      footer: new TagBuilder("div")
        .withChild(
          new TagBuilder("button")
            .withText("Modifier")
            .withEvent("click", () => router.navigate(`/tasks/${this.props.taskIndex}/edit`))
            .build(),
        )
        .withChild(
          new TagBuilder("button")
            .withText("Retour")
            .withEvent("click", () => router.navigate("/"))
            .build(),
        )
        .build(),
    }).render();
  }
}

class TaskEditPage extends BaseComponent<{ taskIndex: number; children?: never[] }> {
  render(): HTMLElement {
    const task = store.getState().tasks[this.props.taskIndex];

    if (!task) {
      return new Card({
        title: "Introuvable",
        children: [new TagBuilder("p").withText("La tâche demandée n'existe pas.").build()],
      }).render();
    }

    const wrapper = new TagBuilder("div").withClass("layout").build();
    const taskForm = createTaskForm(
      {
        title: task.title,
        description: task.description,
        ownerEmail: task.ownerEmail,
        priorite: task.priorite,
      },
      "Enregistrer",
      async (values) => {
        await tacheService.update(this.props.taskIndex, values);
        await refreshTasks();
        router.navigate(`/tasks/${this.props.taskIndex}`);
      },
    );

    this.registerCleanup(taskForm.cleanup);

    wrapper.appendChild(
      new Card({
        title: "Modifier la tâche",
        children: [taskForm.element],
      }).render(),
    );

    return wrapper;
  }
}

class AboutPage extends BaseComponent {
  render(): HTMLElement {
    return new Card({
      title: "À propos",
      children: [
        new TagBuilder("p")
          .withText("Cette SPA démontre Builder, Factory, Singleton, Strategy, Observer, Router et HTTP.")
          .build(),
        new TagBuilder("p")
          .withText("Elle propose une démo CRUD simple avec validation et routage client.")
          .build(),
      ],
    }).render();
  }
}

function createAppShell(): { root: HTMLElement; outlet: HTMLElement } {
  const root = new TagBuilder("div").withClass("app").build();
  const nav = new TagBuilder("nav").withClass("nav").build();
  const outlet = new TagBuilder("main").build();

  nav.appendChild(
    new TagBuilder("button")
      .withText("Liste")
      .withEvent("click", () => router.navigate("/"))
      .build(),
  );

  nav.appendChild(
    new TagBuilder("button")
      .withText("À propos")
      .withEvent("click", () => router.navigate("/about"))
      .build(),
  );

  root.appendChild(nav);
  root.appendChild(outlet);

  return { root, outlet };
}

async function refreshTasks(): Promise<void> {
  const tasks = await tacheService.getAll();
  await store.dispatch({ type: "SET_TASKS", payload: tasks });
}

async function bootstrap(): Promise<void> {
  await store.hydrate();
  await refreshTasks();
  router.start();

  const { root, outlet } = createAppShell();
  document.body.innerHTML = "";
  document.body.appendChild(root);

  let currentPage: BaseComponent | null = null;
  let currentElement: HTMLElement | null = null;

  const renderRoute = (route: RouteMatch) => {
    void store.dispatch({ type: "SET_ROUTE", payload: route.path });

    if (currentPage && currentElement) {
      currentPage.destroy(currentElement);
    }

    outlet.innerHTML = "";

    currentPage =
      route.definition.path === "/"
        ? new TasksPage({})
        : route.definition.path === "/tasks/:taskId"
          ? new TaskDetailsPage({ taskIndex: Number(route.params.taskId) })
          : route.definition.path === "/tasks/:taskId/edit"
            ? new TaskEditPage({ taskIndex: Number(route.params.taskId) })
            : new AboutPage({});

    currentPage.mount(outlet);
    currentElement = outlet.lastElementChild as HTMLElement | null;
  };

  router.subscribe(renderRoute);
}

void bootstrap();
