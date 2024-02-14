// Drag and Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }

    protected updateListeners(items: T[]) {
        for (const listenerFn of this.listeners) {
            listenerFn(items);
        }
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            people,
            ProjectStatus.ACTIVE
        );
        this.projects.push(newProject);
        this.updateListeners(this.projects.slice());
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

// Helpers
interface ValidateConfig {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(input: ValidateConfig) {
    if (
        (input.required && input.value.toString().trim().length === 0) ||
        (input.minLength != null &&
            input.value.toString().length < input.minLength) ||
        (input.maxLength != null &&
            input.value.toString().length > input.maxLength) ||
        (input.min != null && +input.value < input.min) ||
        (input.max != null && +input.value > input.max)
    ) {
        return false;
    }

    return true;
}

function autoBind(_: any, __: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            return originalMethod.bind(this);
        },
    };
    return adjDescriptor;
}

enum ProjectStatus {
    ACTIVE = "active",
    FINISHED = "finished",
}

// Main classes
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAt: "afterbegin" | "beforeend" | "afterend" | "beforebegin",
        elementId?: string
    ) {
        this.templateElement = document.getElementById(
            templateId
        ) as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId) as T;

        const importedNode = document.importNode(
            this.templateElement.content,
            true
        );
        this.element = importedNode.firstElementChild as U;
        if (elementId) {
            this.element.id = elementId;
        }

        this.attach(insertAt);
    }

    private attach(
        insertAt: "afterbegin" | "beforeend" | "afterend" | "beforebegin"
    ) {
        this.hostElement.insertAdjacentElement(insertAt, this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

class ProjectItem
    extends Component<HTMLUListElement, HTMLLIElement>
    implements Draggable
{
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        } else {
            return `${this.project.people} persons`;
        }
    }

    constructor(hostId: string, private project: Project) {
        super("single-project", hostId, "beforeend", project.id);
        this.configure();
        this.renderContent();
    }

    @autoBind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData("text/plain", this.project.id);
        event.dataTransfer!.effectAllowed = "move";
    }
    dragEndHandler(_: DragEvent): void {}

    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHandler);
    }
    renderContent(): void {
        this.element.querySelector("h2")!.textContent = this.project.title;
        this.element.querySelector(
            "h3"
        )!.textContent = `${this.persons} assigned`;
        this.element.querySelector("p")!.textContent = this.project.description;
    }
}

class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
{
    assignedProjects: Project[];

    constructor(private type: ProjectStatus) {
        super("project-list", "app", "beforeend", `${type}-projects`);

        this.assignedProjects = [];
        this.element.id = `${this.type}-projects`;

        this.configure();
        this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent): void {
        if (
            event.dataTransfer &&
            event.dataTransfer.types[0] === "text/plain"
        ) {
            event.preventDefault();
            const listEl = this.element.querySelector("ul")!;
            listEl.classList.add("droppable");
        }
    }
    @autoBind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData("text/plain");
        projectState.moveProject(prjId, this.type);
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }
    @autoBind
    dragLeaveHandler(event: DragEvent): void {
        const listEl = this.element.querySelector("ul")!;
        listEl.classList.remove("droppable");
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul")!.id = listId;
        this.element.querySelector("h2")!.textContent =
            this.type.toString().toUpperCase() + " PROJECTS";
    }

    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHandler);
        this.element.addEventListener("drop", this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects.filter(
                (prj) => prj.status === this.type
            );
            this.renderProjects();
        });
    }

    private renderProjects() {
        const listEl = document.getElementById(
            `${this.type}-projects-list`
        ) as HTMLUListElement;
        listEl.innerHTML = "";
        for (const project of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul")!.id, project);
        }
    }
}

class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
    titleEl!: HTMLInputElement;
    descriptionEl!: HTMLInputElement;
    peopleEl!: HTMLInputElement;
    constructor() {
        super("project-input", "app", "afterbegin", "user-input");

        this.configure();
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleEl.value;
        const enteredDescription = this.descriptionEl.value;
        const enteredPeople = this.peopleEl.value;

        if (
            !validate({ value: enteredTitle, required: true }) ||
            !validate({
                value: enteredDescription,
                required: true,
                minLength: 5,
            }) ||
            !validate({
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 10,
            })
        ) {
            alert("Invalid input, please try again!");
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    configure() {
        this.titleEl = this.element.querySelector("#title") as HTMLInputElement;
        this.descriptionEl = this.element.querySelector(
            "#description"
        ) as HTMLInputElement;
        this.peopleEl = this.element.querySelector(
            "#people"
        ) as HTMLInputElement;

        this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent(): void {}

    private clearInputs() {
        this.titleEl.value = "";
        this.descriptionEl.value = "";
        this.peopleEl.value = "";
    }

    @autoBind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (userInput) {
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            this.clearInputs();
        }
    }
}

const form = new ProjectForm();
const activeProjectList = new ProjectList(ProjectStatus.ACTIVE);
const finishedProjectList = new ProjectList(ProjectStatus.FINISHED);
