/// <reference path="models/project.ts"/>
/// <reference path="components/project-input.ts"/>
/// <reference path="components/project-list.ts"/>

namespace App {
    // Main classes
    new ProjectForm();
    new ProjectList(ProjectStatus.ACTIVE);
    new ProjectList(ProjectStatus.FINISHED);
}
