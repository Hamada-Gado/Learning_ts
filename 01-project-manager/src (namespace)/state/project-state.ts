namespace App {
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

    export class ProjectState extends State<Project> {
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

    export const projectState = ProjectState.getInstance();
}
