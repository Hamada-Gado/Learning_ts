namespace App {
    export abstract class Component<
        T extends HTMLElement,
        U extends HTMLElement
    > {
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
}
