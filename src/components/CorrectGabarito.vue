<template>
  <div class="p-6 font-display relative">
    <!-- Cabeçalho -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Correção do Gabarito</h1>

      <!-- Seleção de Turma -->
      <div class="flex items-center space-x-4 mt-4">
        <div>
          <label for="class" class="block text-sm font-medium">Turma:</label>
          <select
            id="class"
            v-model="selectedClass"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option
              v-for="classOption in classes"
              :key="classOption.id"
              :value="classOption.name"
            >
              {{ classOption.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabela de Alunos -->
    <div class="overflow-x-auto w-full">
      <table class="table-auto w-full text-left">
        <thead class="text-[#6A7777]">
          <tr>
            <th class="px-6 py-4 text-sm font-medium text-left">
              Nome do Aluno
            </th>
            <th class="px-6 py-4 text-sm font-medium text-center">Câmera</th>
            <th class="px-6 py-4 text-sm font-medium text-center">Checklist</th>
            <th class="px-6 py-4 text-sm font-medium text-center">Excluir</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="aluno in filteredAlunos"
            :key="aluno.id"
            class="border-t border-[#D9D9D9] hover:bg-gray-100 transition"
          >
            <!-- Nome do Aluno -->
            <td
              class="px-6 py-4 font-medium text-[#003838] text-[14px] uppercase text-left"
            >
              {{ aluno.nome }}
            </td>

            <!-- Botão da Câmera -->
            <td class="px-6 py-4 text-center">
              <button
                @click="openCamera(aluno.id)"
                class="text-[#003838] hover:text-[#005151] transition-colors hover:bg-gray-200 p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
              >
                <IconCamera />
              </button>
            </td>

            <!-- Checklist -->
            <td class="px-6 py-4 text-center">
              <button
                @click="toggleChecklist(aluno)"
                class="flex items-center justify-center w-full"
              >
                <component
                  :is="aluno.imagemCapturada ? IconCheck : IconAlert"
                />
              </button>
            </td>

            <!-- Botão de Excluir -->
            <td class="px-6 py-4 text-center">
              <button
                @click="deleteAluno(aluno.id)"
                class="text-[#003838] hover:text-[#005151] transition-colors hover:bg-gray-200 p-2 rounded-lg inline-flex items-center justify-center cursor-pointer"
              >
                <IconLixeira />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Câmera -->
    <div
      v-if="isCameraOpen"
      class="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="overflow-hidden w-full sm:w-[400px] md:w-[500px] bg-white p-4 flex flex-col relative"
      >
        <!-- Cabeçalho do Modal -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Capture a Imagem</h2>
          <button
            @click="closeCamera"
            class="absolute top-2 right-2 cursor-pointer"
          >
            <IconFechar />
          </button>
        </div>

        <!-- Video e Imagem Capturada -->
        <div class="mt-4 flex-1">
          <video
            v-if="!capturedImage"
            ref="videoElement"
            class="aspect-[4/4] w-full h-auto object-cover"
            autoplay
            playsinline
          ></video>
          <img
            v-if="capturedImage"
            :src="capturedImage"
            class="aspect-[4/3] w-full h-auto object-cover"
          />
        </div>

        <!-- Botões para capturar, usar ou tirar outra imagem -->
        <div class="">
          <div v-if="!capturedImage" class="flex justify-center items-center">
            <button
              @click="captureImage"
              class="mt-2 bg-gray-100 text-white py-2 px-4 rounded inline-flex justify-center items-center cursor-pointer"
            >
              <IconCamera class="text-lg" />
            </button>
          </div>

          <div v-else class="mt-4 flex flex-col space-y-2">
            <p class="text-center font-bold">A imagem ficou boa?</p>
            <div class="flex space-x-2 mt-2">
              <button
                @click="saveImage"
                class="bg-[#003838] text-white py-2 px-4 rounded w-full cursor-pointer"
              >
                Usar esta imagem
              </button>
              <button
                @click="retakeImage"
                class="bg-[#fc6e4d] text-white py-2 px-4 rounded w-full cursor-pointer"
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
import IconLixeira from "../components/icons/IconLixiera.vue";
import IconCheck from "../components/icons/IconCheck.vue";
import IconAlert from "../components/icons/IconAlert.vue";
import IconFechar from "../components/icons/IconFechar.vue";
import Swal from "sweetalert2";

const classes = [
  { id: 1, name: "Turma A" },
  { id: 2, name: "Turma B" },
  { id: 3, name: "Turma C" },
];

const alunosData = ref([
  {
    id: 1,
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

const selectedClass = ref("Turma A");
const isCameraOpen = ref(false);
const videoElement = ref(null);
const currentAlunoId = ref(null);
const capturedImage = ref(null);
let mediaStream = null;

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

const filteredAlunos = computed(() =>
  alunosData.value.filter((aluno) => aluno.turma === selectedClass.value)
);

const openCamera = async (alunoId) => {
  try {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

const captureImage = () => {
  if (!videoElement.value) return;

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.value.videoWidth;
  canvas.height = videoElement.value.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);

  capturedImage.value = canvas.toDataURL("image/png");
};

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
      aluno.imagemCapturada = true; // Atualiza o estado local
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
const deleteAluno = (alunoId) => {
  Swal.fire({
    title: "Tem certeza que quer excluir esse aluno?",
    text: "Você não poderá reverter isso!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#f53d6b",
    cancelButtonColor: "#e8e8ed",
    confirmButtonText: "Sim, excluir!",
  }).then((result) => {
    if (result.isConfirmed) {
      // Remove o aluno da lista
      alunosData.value = alunosData.value.filter(
        (aluno) => aluno.id !== alunoId
      );

      Swal.fire({
        title: "Excluído!",
        text: "O aluno foi removido com sucesso.",
        icon: "success",
      });
    }
  });
};

const retakeImage = () => {
  capturedImage.value = null;
  videoElement.value.srcObject = null;

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
  }

  openCamera(currentAlunoId.value);
};

const closeCamera = () => {
  if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
  isCameraOpen.value = false;
  currentAlunoId.value = null;
  capturedImage.value = null;
};

onBeforeUnmount(closeCamera);
</script>
