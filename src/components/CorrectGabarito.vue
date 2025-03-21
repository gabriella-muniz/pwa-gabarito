<template>
  <div class="p-6 font-display relative">
    <!-- Cabeçalho -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Correção do Gabarito</h1>
      <p class="text-gray-400 font-semibold">
        Envie imagens dos gabaritos dos alunos para correção automatizada
      </p>

      <!-- Seleção de Turma -->
      <div class="flex flex-wrap gap-2 mt-4 bg-gray-100 p-2 rounded-2xl">
        <button
          v-for="classOption in classes"
          :key="classOption.id"
          :class="{
            'bg-white text-[#003838]': selectedClass === classOption.name,
            'bg-gray-100 text-[#003838]': selectedClass !== classOption.name,
          }"
          @click="selectedClass = classOption.name"
          class="px-4 py-2 rounded-lg focus:outline-none cursor-pointer"
        >
          {{ classOption.name }}
        </button>
      </div>

      <!-- Campo de Busca -->
      <div class="mt-6 relative">
        <IconBusca
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
        />
        <input
          id="search"
          v-model="searchTerm"
          type="text"
          placeholder="Digite o nome do aluno"
          class="border border-[#D9D9D9] focus:border-gray-600 outline-none bg-transparent focus:bg-[#f7f7f8] pl-10 py-2 w-full rounded-lg"
        />
      </div>
    </div>

    <!-- Lista de Alunos -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
    >
      <div
        v-for="aluno in filteredAlunosBySearch"
        :key="aluno.id"
        class="bg-gray-100 p-4 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-center">
            <div
              class="font-bold text-xs border border-gray-400 rounded-xl p-1"
            >
              {{ aluno.id }}
            </div>
            <component
              :is="aluno.imagemCapturada ? IconCheck : IconAlert"
              class="text-xl"
            />
          </div>
          <h3 class="mt-2 text-lg font-bold text-[#003838]">
            {{ aluno.nome }}
          </h3>

          <!-- Mensagem de sucesso quando o gabarito for processado -->
          <p v-if="aluno.imagemCapturada" class="text-sm text-green-600 mt-2">
            Gabarito processado com sucesso!
          </p>
        </div>

        <div class="flex justify-start mt-6">
          <button
            @click="openUploadModal(aluno)"
            class="border border-gray-400 text-black py-2 px-4 rounded-lg hover:bg-gray-100 w-fit cursor-pointer font-semibold flex items-center gap-2"
          >
            <IconUpload /> Enviar Gabarito
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Seleção - Só abre se o aluno for selecionado -->
    <div
      v-if="isUploadModalOpen"
      class="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white w-full max-w-[500px] sm:max-w-[80%] md:max-w-[500px] rounded-lg shadow-lg p-6 relative"
      >
        <!-- Cabeçalho -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">
            Gabarito de {{ selectedAluno?.nome }}
          </h2>
          <button @click="closeUploadModal" class="cursor-pointer">
            <IconFechar />
          </button>
        </div>

        <div v-if="selectedAluno" class="space-y-4">
          <div class="border border-gray-300 p-4 rounded-lg shadow">
            <label
              :for="'fileInput' + selectedAluno.id"
              class="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition"
            >
              <p class="text-gray-500 mt-2">
                Clique para selecionar uma imagem
              </p>
              <input
                type="file"
                :id="'fileInput' + selectedAluno.id"
                accept="image/*"
                @change="(event) => handleFileUpload(event, selectedAluno)"
                class="hidden"
                ref="fileInput"
              />
            </label>

            <!-- Exibir imagem salva -->
            <div v-if="selectedAluno.imagemCapturada" class="mt-4">
              <p class="text-[#003838]">Imagem salva:</p>
              <img
                :src="selectedAluno.imagem"
                alt="Imagem do aluno"
                class="w-32 h-32 object-cover rounded-lg"
              />

              <!-- Botão de Finalizar -->
              <button
                @click="finalizarProcesso"
                class="mt-4 bg-[#003838] text-white py-2 px-4 rounded-lg w-full"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>

        <!-- Botões -->
        <div class="flex justify-between mt-4 space-x-2">
          <button
            @click="openFilePicker"
            class="flex-1 border border-gray-300 rounded-lg py-2 flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <IconGaleria class="mr-2" />
            Galeria
          </button>

          <button
            @click="openCameraModal"
            class="flex-1 border border-gray-300 rounded-lg py-2 flex items-center justify-center text-gray-600 hover:bg-gray-100"
          >
            <IconCamera class="mr-2" />
            Câmera
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Câmera -->
    <div
      v-if="isCameraOpen"
      class="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white w-full max-w-[500px] sm:max-w-[80%] md:max-w-[500px] rounded-lg shadow-lg p-4 relative"
      >
        <!-- Cabeçalho do Modal -->
        <div class="flex justify-between items-center">
          <button @click="closeCamera" class="cursor-pointer">
            <IconFechar />
          </button>
          <button
            @click="toggleCamera"
            class="bg-gray-100 text-black py-2 px-4 rounded cursor-pointer"
          >
            <IconModoCamera />
          </button>
        </div>

        <!-- Vídeo e Imagem Capturada -->
        <div class="flex-1 mt-4">
          <video
            v-if="!capturedImage"
            ref="videoElement"
            class="aspect-[16/9] w-full h-[65vh] sm:h-[60vh] md:h-[75vh] object-cover"
            autoplay
            playsinline
          ></video>
          <img
            v-if="capturedImage"
            :src="capturedImage"
            class="aspect-[16/9] w-full h-[65vh] sm:h-[60vh] md:h-[75vh] object-cover"
          />
        </div>

        <!-- Botões de Captura -->
        <div class="mt-4 flex flex-col space-y-2">
          <div v-if="!capturedImage" class="flex justify-center">
            <button
              @click="captureImage"
              class="bg-gray-100 text-black py-2 px-4 rounded cursor-pointer w-full flex items-center justify-center"
            >
              <IconCamera class="text-lg" />
            </button>
          </div>

          <div v-else>
            <p class="text-center font-bold">A imagem ficou boa?</p>
            <div class="flex space-x-2 mt-2">
              <button
                @click="saveImage(currentAlunoId)"
                class="bg-[#003838] text-white py-2 px-4 rounded w-full"
              >
                Usar esta imagem
              </button>
              <button
                @click="retakeImage"
                class="bg-[#fc6e4d] text-white py-2 px-4 rounded w-full"
              >
                Tirar outra
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botão de Confirmar Turma -->
    <div class="relative flex flex-col justify-end items-center">
      <button
        @click="confirmarTurma"
        :disabled="!isConfirmButtonEnabled"
        class="px-4 py-2 rounded-lg text-white font-bold transition duration-200 flex items-center gap-2 relative cursor-pointer"
        :class="
          isTurmaConfirmed
            ? 'bg-green-500'
            : isConfirmButtonEnabled
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-400 cursor-not-allowed'
        "
      >
        <!-- Ícone de status -->
        <span
          v-if="turmaStatusIcon"
          class="absolute top-0 right-0 -translate-y-2 translate-x-2 text-xl"
        >
          <component :is="turmaStatusIcon" />
        </span>
        <!-- Texto do botão -->
        <span v-if="isTurmaConfirmed" class="flex items-center gap-2">
          <IconCheckConfirm /> Turma Confirmada</span
        >
        <span v-else class="flex items-center gap-2">
          <IconCheckConfirm /> Confirmar Turma
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, onMounted } from "vue";
import IconCamera from "../components/icons/IconCamera.vue";
import IconCheck from "../components/icons/IconCheck.vue";
import IconAlert from "../components/icons/IconAlert.vue";
import IconFechar from "../components/icons/IconFechar.vue";
import IconModoCamera from "./icons/IconModoCamera.vue";
import IconUpload from "./icons/IconUpload.vue";
import IconBusca from "./icons/IconBusca.vue";
import IconGaleria from "./icons/IconGaleria.vue";
import IconAlertConfirm from "./icons/IconAlertConfirm.vue";

import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import IconCheckConfirm from "./icons/IconCheckConfirm.vue";

// Define os estados e variáveis do projeto
const classes = [
  { id: 1, name: "Turma A" },
  { id: 2, name: "Turma B" },
  { id: 3, name: "Turma C" },
];

const alunosData = ref([
  {
    id: 133333333333333333,
    nome: "Ana Souza",
    turma: "Turma A",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },

  {
    id: 2,
    nome: "Carlos Oliveira",
    turma: "Turma A",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },
  {
    id: 3,
    nome: "Fernanda Costa",
    turma: "Turma B",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },
  {
    id: 4,
    nome: "Gabriel Silva",
    turma: "Turma C",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },
  {
    id: 5,
    nome: "Juliana Santos",
    turma: "Turma B",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },
  {
    id: 6,
    nome: "Anny Ferreira",
    turma: "Turma C",
    checked: false,
    imagemCapturada: false,
    imagem: null,
  },
]);

const searchTerm = ref("");
const stream = ref(null);
const selectedClass = ref("Turma A");
const isCameraOpen = ref(false);
const videoElement = ref(null);
const currentAlunoId = ref(null);
const capturedImage = ref(null);
let mediaStream = null;
let currentFacingMode = ref("environment"); // Inicia na câmera traseira
const selectedAluno = ref(null);
const isUploadModalOpen = ref(false);
const isTurmaConfirmed = ref(false);

const fileInput = ref(null);

const openFilePicker = () => {
  if (fileInput.value) {
    fileInput.value.click(); // Dispara o clique no input
  }
};

// Verifica se todos os alunos da turma selecionada têm imagem processada
const isConfirmButtonEnabled = computed(() => {
  const alunosDaTurma = alunosData.value.filter(
    (aluno) => aluno.turma === selectedClass.value
  );
  return (
    !isTurmaConfirmed.value &&
    alunosDaTurma.length > 0 &&
    alunosDaTurma.every((aluno) => aluno.imagemCapturada || aluno.imagem)
  );
});

// Define o ícone de status da turma
const turmaStatusIcon = computed(() => {
  const alunosDaTurma = alunosData.value.filter(
    (aluno) => aluno.turma === selectedClass.value
  );

  // Verifica se todos os alunos têm o gabarito processado
  const todosAlunosConfirmados = alunosDaTurma.every(
    (aluno) => aluno.imagemCapturada || aluno.imagem
  );
  if (todosAlunosConfirmados && isTurmaConfirmed.value) {
    return IconCheck;
  }
  if (!todosAlunosConfirmados) {
    return IconAlertConfirm;
  }
  return null;
});

// Função para confirmar turma
const confirmarTurma = () => {
  if (isConfirmButtonEnabled.value) {
    isTurmaConfirmed.value = true;

    // Exibir o toast de sucesso após confirmar a turma
    const isMobile = window.innerWidth < 768;

    toast.success("Turma confirmada!", {
      position: isMobile ? "top-center" : "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};

const finalizarProcesso = (aluno) => {
  const isMobile = window.innerWidth < 768;

  toast.success("Gabarito Processado com Sucesso!", {
    position: isMobile ? "top-center" : "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  aluno.gabaritoProcessado = true;

  isUploadModalOpen.value = false;
};

// Função para selecionar um aluno
const selectAluno = (aluno) => {
  selectedAluno.value = aluno;
  console.log("Aluno selecionado:", selectedAluno.value); // Debug
};

// Função para abrir o modal para o aluno específico
const openUploadModal = (aluno) => {
  selectedAluno.value = aluno;
  isUploadModalOpen.value = true;
};

// Função para fechar o modal
const closeUploadModal = () => {
  isUploadModalOpen.value = false;
  selectedAluno.value = null;
};

// Função openCameraModal onde aluno é passado
const openCameraModal = async () => {
  isCameraOpen.value = true;
  capturedImage.value = null;
  currentAlunoId.value = selectedAluno.value.id;

  // Espera pela inicialização da câmera
  await startCamera();
};

const startCamera = async () => {
  try {
    // Para garantir que a câmera sempre reinicie corretamente
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
    }

    stream.value = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value;
    }
  } catch (error) {
    console.error("Erro ao acessar a câmera:", error);
  }
};

// Função para manipular o upload de arquivo e salvar no localStorage
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      selectedAluno.value.imagem = reader.result;
      selectedAluno.value.imagemCapturada = true;

      // Salvar a imagem no localStorage com a chave específica do aluno
      localStorage.setItem(
        `aluno_${selectedAluno.value.id}_imagem`,
        reader.result
      );
    };
    reader.readAsDataURL(file);
  }
};

// Função para alternar entre as câmeras
const toggleCamera = async () => {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user"; // Alterna entre 'user' (frontal) e 'environment' (traseira)
  await openCamera(currentAlunoId.value); // Reabre a câmera com o novo modo
};
// Carregar imagens salvas no LocalStorage ao montar o componente
onMounted(() => {
  alunosData.value.forEach((aluno) => {
    const imagem = localStorage.getItem(`aluno_${aluno.id}_imagem`);
    if (imagem) {
      aluno.imagem = imagem;
      aluno.imagemCapturada = true;
    }
  });
});

const filteredAlunosBySearch = computed(() =>
  filteredAlunos.value.filter((aluno) =>
    aluno.nome.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
);

const filteredAlunos = computed(() =>
  alunosData.value.filter((aluno) => aluno.turma === selectedClass.value)
);

// Função para abrir a câmera
const openCamera = async (alunoId) => {
  try {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: currentFacingMode },
    });
    isCameraOpen.value = true;
    currentAlunoId.value = alunoId;
    capturedImage.value = null;

    await nextTick(); 

    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream; 
    }
  } catch (error) {
    console.error("Erro ao acessar a câmera:", error);
  }
};
// Função para capturar a imagem
const captureImage = () => {
  if (!videoElement.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

  capturedImage.value = canvas.toDataURL("image/png");
};

const saveImage = (alunoId) => {
  console.log("Captured Image:", capturedImage.value); // Verifique se a imagem foi capturada
  console.log("Current Aluno ID:", alunoId); // Verifique o ID do aluno

  if (capturedImage.value && alunoId) {
    // Salva a imagem no localStorage do aluno específico
    localStorage.setItem(`aluno_${alunoId}_imagem`, capturedImage.value);

    // Atualiza os dados do aluno no estado
    const aluno = alunosData.value.find((aluno) => aluno.id === alunoId);
    if (aluno) {
      aluno.imagemCapturada = true;
      aluno.imagem = capturedImage.value; // Atribuindo a imagem capturada ao aluno
    }

    // Fechar a câmera após salvar a imagem
    closeCamera();
  } else {
    console.error(
      "Erro: Nenhuma imagem foi capturada ou o aluno não foi selecionado."
    );
  }
};

// Função para tirar outra imagem
const retakeImage = () => {
  capturedImage.value = null;
  if (videoElement.value) {
    videoElement.value.srcObject = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }

  // Reabra a câmera e reatribua a referência do vídeo
  openCamera(currentAlunoId.value);
};

// Função para fechar a câmera
const closeCamera = () => {
  if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
  isCameraOpen.value = false;
  currentAlunoId.value = null;
  capturedImage.value = null;
};

onBeforeUnmount(closeCamera);
</script>
