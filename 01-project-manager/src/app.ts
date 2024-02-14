import { ProjectForm } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";
import { ProjectStatus } from "./models/project.js";

new ProjectForm();
new ProjectList(ProjectStatus.ACTIVE);
new ProjectList(ProjectStatus.FINISHED);
