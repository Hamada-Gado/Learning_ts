import { Component } from "./base-component.js";
import { ProjectItem } from "./project-item.js";
import { ProjectStatus, Project } from "../models/project.js";
import { autoBind } from "../decorators/autobind.js";
import { DragTarget } from "../models/drag-drop.js";
import { projectState } from "../state/project-state.js";

export class ProjectList
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
