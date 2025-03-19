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
        </div>

        <div class="flex justify-start mt-6">
          <button
            @click="openUploadModal"
            class="border border-gray-400 text-black py-2 px-4 rounded-lg hover:bg-gray-100 w-fit cursor-pointer font-semibold flex items-center gap-2"
          >
            <IconUpload /> Enviar Gabarito
          </button>
        </div>
      </div>
    </div>
    <!-- Modal de Seleção -->
    <div
      v-if="isUploadModalOpen"
      class="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white w-full max-w-[400px] rounded-lg shadow-lg p-6 relative"
      >
        <!-- Cabeçalho -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold">Enviar Imagem do Gabarito</h2>
          <button @click="closeUploadModal" class="cursor-pointer">
            <IconFechar />
          </button>
        </div>

        <!-- Área de Upload -->
        <label
          for="fileInput"
          class="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-gray-50 transition"
        >
          <IconImagem class="text-gray-400 text-4xl" />
          <p class="text-gray-500 mt-2">Clique para selecionar uma imagem</p>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            @change="handleFileUpload"
            class="hidden"
          />
        </label>

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
        class="bg-white w-full max-w-[500px] rounded-lg shadow-lg p-4 relative"
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
        <div class="flex-1">
          <video
            v-if="!capturedImage"
            ref="videoElement"
            class="aspect-[16/9] w-full h-[80vh] object-cover"
            autoplay
            playsinline
          ></video>
          <img
            v-if="capturedImage"
            :src="capturedImage"
            class="aspect-[16/9] w-full h-[75vh] object-cover"
          />
        </div>

        <!-- Botões de Captura -->
        <div class="mt-4 flex flex-col space-y-2">
          <div v-if="!capturedImage" class="flex justify-center">
            <button
              @click="captureImage"
              class="bg-gray-100 text-black py-2 px-4 rounded cursor-pointer"
            >
              <IconCamera class="text-lg" />
            </button>
          </div>

          <div v-else>
            <p class="text-center font-bold">A imagem ficou boa?</p>
            <div class="flex space-x-2 mt-2">
              <button
                @click="saveImage"
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
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onBeforeUnmount, onMounted } from "vue";
import IconCamera from "../components/icons/IconCamera.vue";
import IconCheck from "../components/icons/IconCheck.vue";
import IconAlert from "../components/icons/IconAlert.vue";
import IconFechar from "../components/icons/IconFechar.vue";
import Swal from "sweetalert2";
import IconModoCamera from "./icons/IconModoCamera.vue";
import IconUpload from "./icons/IconUpload.vue";
import IconBusca from "./icons/IconBusca.vue";

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
  },
  {
    id: 2,
    nome: "Carlos Oliveira",
    turma: "Turma A",
    checked: false,
    imagemCapturada: false,
  },
  {
    id: 3,
    nome: "Fernanda Costa",
    turma: "Turma B",
    checked: false,
    imagemCapturada: false,
  },
  {
    id: 4,
    nome: "Gabriel Silva",
    turma: "Turma C",
    checked: false,
    imagemCapturada: false,
  },
  {
    id: 5,
    nome: "Juliana Santos",
    turma: "Turma B",
    checked: false,
    imagemCapturada: false,
  },
  {
    id: 6,
    nome: "Anny Ferreira",
    turma: "Turma C",
    checked: false,
    imagemCapturada: false,
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
let currentFacingMode = "environment"; // Modo de câmera traseira

const isUploadModalOpen = ref(false);

const selectedFile = ref(null);

const openUploadModal = () => {
  isUploadModalOpen.value = true;
};

const closeUploadModal = () => {
  isUploadModalOpen.value = false;
};

const openCameraModal = async () => {
  closeUploadModal(); // Fecha o modal de seleção
  isCameraOpen.value = true;
  await startCamera(); // Inicia a câmera assim que o modal abre
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

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = URL.createObjectURL(file);
    closeUploadModal(); // Fecha o modal de seleção
  }
};

// Função para alternar entre as câmeras
const toggleCamera = async () => {
  currentFacingMode = currentFacingMode === "user" ? "environment" : "user"; // Alterna entre 'user' (frontal) e 'environment' (traseira)
  await openCamera(currentAlunoId.value); // Reabre a câmera com o novo modo
};

// Carregar as imagens do localStorage ao montar o componente
onMounted(() => {
  alunosData.value.forEach((aluno) => {
    const imagem = localStorage.getItem(`aluno_${aluno.id}_imagem`);
    if (imagem) {
      aluno.imagemCapturada = true;
    } else {
      aluno.imagemCapturada = false;
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

// Função para salvar a imagem
const saveImage = () => {
  if (capturedImage.value && currentAlunoId.value) {
    localStorage.setItem(
      `aluno_${currentAlunoId.value}_imagem`,
      capturedImage.value
    );

    const aluno = alunosData.value.find(
      (aluno) => aluno.id === currentAlunoId.value
    );
    if (aluno) {
      aluno.imagemCapturada = true;
    }

    Swal.fire({
      title: "Imagem salva!",
      text: "A imagem foi salva com sucesso.",
      icon: "success",
      confirmButtonText: "OK",
      timer: 2000,
      timerProgressBar: true,
    });

    closeCamera();
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
