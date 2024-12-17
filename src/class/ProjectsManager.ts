import { ErrorMessage } from "./ErrorMessage"
import { IProject, Project } from "./Project"

export class ProjectsManager {
  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container

    // Crear un proyecto predeterminado
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date(),
    })
  }

  newProject(data: IProject): Project {
    // Validaciones
    const projectNames = this.list.map((project) => project.name)

    if (data.name.length < 5) {
      throw new Error("Project name must be at least 5 characters long")
    }

    if (projectNames.includes(data.name)) {
      throw new Error(`A project with the name '${data.name}' already exists`)
    }

    const finishDate =
      data.finishDate && !isNaN(new Date(data.finishDate).getTime())
        ? new Date(data.finishDate)
        : this.getDefaultFinishDate()

    // Crear el proyecto
    const project = new Project({ ...data, finishDate })

    // Asignar evento de clic a la tarjeta completa para mostrar detalles
    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (projectsPage && detailsPage) {
        projectsPage.style.display = "none"
        detailsPage.style.display = "flex"
        this.setDetailsPage(project)
      }
    })
    // Añadir el proyecto a la UI y a la lista
    this.ui.append(project.ui)
    this.list.push(project)

    return project
  }

  private getDefaultFinishDate(): Date {
    const today = new Date()
    today.setDate(today.getDate() + 90) // Añadir 90 días a la fecha actual
    return today
  }

  private setDetailsPage(project: Project): void {
    const detailsPage = document.getElementById("project-details") as HTMLDivElement
    if (!detailsPage) return

    detailsPage.setAttribute("data-project-id", project.id)
    console.log("Project ID set in details page:", project.id)

    const name = detailsPage.querySelector("[data-project-info='name']")
    if (name) name.textContent = project.name

    const description = detailsPage.querySelector("[data-project-info='description']")
    if (description) description.textContent = project.description

    const cardName = detailsPage.querySelector("[data-project-info='cardName']")
    if (cardName) cardName.textContent = project.name

    const cardDescription = detailsPage.querySelector("[data-project-info='cardDescription']")
    if (cardDescription) cardDescription.textContent = project.description

    const status = detailsPage.querySelector("[data-project-info='status']")
    if (status) status.textContent = project.status

    const cost = detailsPage.querySelector("[data-project-info='cost']")
    if (cost) cost.textContent = project.cost.toString()

    const role = detailsPage.querySelector("[data-project-info='role']")
    if (role) role.textContent = project.userRole

    const date = detailsPage.querySelector("[data-project-info='date']")
    if (date) {
      const dateObj = new Date(project.finishDate)
      date.textContent = dateObj.toDateString()
    }

    const progress = detailsPage.querySelector("[data-project-info='progress']")
    if (progress) {
      progress.textContent = `${project.progress * 100}%`
    }
  }

  getProject(id: string): Project | undefined {
    return this.list.find((project) => project.id === id)
  }

  deleteProject(id: string): void {
    const project = this.getProject(id)
    if (!project) return

    project.ui.remove()
    this.list = this.list.filter((p) => p.id !== id)
  }

  exportToJSON(fileName: string = "projects"): void {
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  importFromJSON(): void {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    const reader = new FileReader()

    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) return
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          console.warn("Error importing project:", error)
        }
      }
    })

    input.addEventListener("change", () => {
      const filesList = input.files
      if (!filesList) return
      reader.readAsText(filesList[0])
    })

    input.click()
  }

  editProject(projectId: string): void {
    const project = this.getProject(projectId) // Retrieve the project by ID
    if (!project) {
      console.warn("Project not found:", projectId)
      return
    }
  
    const editModal = document.getElementById("edit-project-modal") as HTMLDialogElement // Locate the modal
    if (!editModal) {
      console.warn("Edit modal not found.")
      return
    }
  
    // Fill the modal with the current project details
    this.fillEditModal(project, editModal)
  
    // Handle form submission to save changes
    const form = editModal.querySelector("#edit-project-form") as HTMLFormElement
    if (form) {
      form.onsubmit = (event) => {
        event.preventDefault()
  
        const formData = new FormData(form)
        const updatedFields = {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          status: formData.get("status") as string,
          finishDate: new Date(formData.get("finishDate") as string),
          cost: parseFloat(formData.get("cost") as string),
          progress: parseInt(formData.get("progress") as string, 10),
        }
  
        // Update the project object with new values
        Object.assign(project, updatedFields)
  
        // Update only the changed parts of the UI
        this.updateProjectDetailsUI(project)
  
        // Close the modal
        editModal.close()
      }
    }
  
    // Show the modal
    editModal.showModal()
  }
  
  private fillEditModal(project: Project, modal: HTMLDialogElement): void {
    const nameInput = modal.querySelector('input[name="name"]') as HTMLInputElement
    const descriptionInput = modal.querySelector('textarea[name="description"]') as HTMLTextAreaElement
    const statusSelect = modal.querySelector('select[name="status"]') as HTMLSelectElement
    const costInput = modal.querySelector('input[name="cost"]') as HTMLInputElement
    const finishDateInput = modal.querySelector('input[name="finishDate"]') as HTMLInputElement
    const progressInput = modal.querySelector('input[name="progress"]') as HTMLInputElement
  
    if (nameInput) nameInput.value = project.name
    if (descriptionInput) descriptionInput.value = project.description
    if (statusSelect) statusSelect.value = project.status
    if (costInput) costInput.value = project.cost.toString()
    if (finishDateInput) finishDateInput.value = project.finishDate.toISOString().split("T")[0]
    if (progressInput) progressInput.value = project.progress.toString()
  }
  
  updateProjectDetailsUI(project: Project): void {
    const card = project.ui;
    if (card) {
      const nameElement = card.querySelector("[data-project-info='name']") as HTMLElement;
      const descriptionElement = card.querySelector("[data-project-info='description']") as HTMLElement;
  
      if (nameElement) nameElement.textContent = project.name;
      if (descriptionElement) descriptionElement.textContent = project.description;
    }
  }
}