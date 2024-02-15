import { Component } from "./base-component";
import { validate } from "../utils/validation";
import { autoBind } from "../decorators/autobind";
import { projectState } from "../state/project-state";

export class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
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
