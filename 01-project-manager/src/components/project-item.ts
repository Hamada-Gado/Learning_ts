import { Draggable } from "../models/drag-drop";
import { Project } from "../models/project";
import { Component } from "./base-component";
import { autoBind } from "../decorators/autobind";

export class ProjectItem
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
