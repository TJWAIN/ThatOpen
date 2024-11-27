import { ErrorMessage } from "./class/ErrorMessage"
import { IProject, ProjectStatus, UserRole } from "./class/Project"
import { ProjectsManager } from "./class/ProjectsManager"

function showModal(id: string) {
  const modal = document.getElementById(id)
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal()
  } else {
    console.warn("The provided modal wasn't found. ID: ", id)
  }
}

function toggleModal(id: string, show: boolean) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    if (show) {
      modal.showModal();
    } else {
      modal.close();
    }
  } else {
    console.warn("The provided modal wasn't found or is not a dialog element. ID: ", id);
  }
}


const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

// This document object is provided by the browser, and its main purpose is to help us interact with the DOM.
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {showModal("new-project-modal")})
} else {
  console.warn("New projects button was not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      const project = projectsManager.newProject(projectData)
      projectForm.reset()
      toggleModal("new-project-modal",false)
      console.log(project)
    } catch (error) {
      projectForm.reset()
      const errordisp = new ErrorMessage(document.getElementById("error-container") as HTMLElement, error);
      errordisp.showError()
      console.log(error)
    }
  })
} else {
	console.warn("The project form was not found. Check the ID!")
}

const exportProjectsBtn= document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn= document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}