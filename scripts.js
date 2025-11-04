// chave de identificação dos dados salvos no browser
const STORAGE_KEY = "prompts_storage";

// estado carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,
};

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById(" btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new-prompt"),
  btnCopy: document.getElementById("btn-copy"),
};

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;
  wrapper.classList.toggle("is-empty", !hasText);
}

// Funções para abrir e fechar a sidebar
function openSidebar() {
  elements.sidebar.style.display = "flex";
  elements.btnOpen.style.display = "none";
}

function closeSidebar() {
  elements.sidebar.style.display = "none";
  elements.btnOpen.style.display = "block";
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });

  elements.promptContent.addEventListener("input", function () {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
}

// EVENTOS

function save() {
  const title = elements.promptTitle.textContent.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim();

  if (!title || !hasContent) {
    alert("Título ou conteúdo não podem estar vazios");
    return;
  }

  if (state.selectedId) {
    // editando um prompt

    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId);
    if (existingPrompt) {
      existingPrompt.title = title || "Sem título";
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    // criando um novo
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    };
    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }
  renderList(elements.search.value);
  persist();
  alert("Salvo com sucesso!");
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
    console.log("prompts carregados", state.prompts);
  } catch (error) {}
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    alert("Erro ao salvar no localStorage", error);
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement("div");
  tmp.innerHTML = prompt.content;
  return `
  <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-main">
          <div class="prompt-item-title">${prompt.title}</div>
          <div class="prompt-item-description">${prompt.content}</div>
      </div>
      <button class="btn-icon" data-action="remove" aria-label="Remover prompt">
          <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
      </button>
  </li>
  `;
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("");

  elements.list.innerHTML = filteredPrompts;
}

function add() {
  state.selectedId = null;
  elements.promptTitle.textContent = "";
  elements.promptContent.innerHTML = "";
  updateAllEditableStates();
  elements.promptTitle.focus();
}
elements.btnNew.addEventListener("click", add);
elements.btnCopy.addEventListener("click", () =>
  navigator.clipboard.writeText(elements.promptContent.innerText)
);
elements.btnSave.addEventListener("click", save);
elements.search.addEventListener("input", function (event) {
  renderList(event.target.value);
});

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest("[data-action = 'remove']");
  const item = event.target.closest("[data-id]");

  if (!item) return;

  const id = item.getAttribute("data-id");
  state.selectedId = id;

  if (removeBtn) {
    //remover botao
    state.prompts = state.prompts.filter((p) => p.id !== id);
    renderList(elements.search.value);
    persist();
    return;
  }
  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id);
    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      updateAllEditableStates();
    }
  }
});

// Inicialização
function init() {
  load();
  renderList("");
  attachAllEditableHandlers();
  updateAllEditableStates();

  // Estado inicial: sidebar aberta, botão de abrir oculto
  elements.sidebar.style.display = "";
  elements.btnOpen.style.display = "none";

  // Eventos para abrir/fechar sidebar
  elements.btnOpen.addEventListener("click", openSidebar);
  elements.btnCollapse.addEventListener("click", closeSidebar);
}

// Executa a inicialização ao carregar o script
init();
