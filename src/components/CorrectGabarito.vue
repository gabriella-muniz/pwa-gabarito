<template>
    <div class="p-6 font-font">
      <!-- Cabeçalho -->
      <div class="mb-6">
        <h1 class="text-3xl font-bold">Correção de Gabarito</h1>
  
        <!-- Cabeçalho de turma -->
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
  
        <!-- Cabeçalho Dinâmico de Turma -->
        <div v-if="selectedClass" class="mt-4">
          <p class="text-xl font-semibold">
            Turma: <span class="text-blue-500">{{ selectedClass }}</span>
          </p>
        </div>
      </div>
  
      <!-- Tabela de Alunos -->
      <div class="rounded-lg overflow-hidden">
        <table class="table-auto w-full text-left">
          <thead class="text-[#6A7777]">
            <tr>
              <th class="px-6 py-4 text-sm font-medium">Nome do Aluno</th>
              <th class="px-6 py-4 text-sm font-medium">Ações</th>
              <th class="px-6 py-4 text-sm font-medium">Ações</th>
              <th class="px-6 py-4 text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(aluno, index) in filteredAlunos" :key="index" class="border-t border-[#D9D9D9]  hover:bg-gray-100 transition ">
              <td class="px-6 py-4 font-medium text-[#003838] text-[14px] ">
                {{ aluno.nome }}
              </td>
              <td
                @click="openCamera"
                class="px-6 py-4 font-medium text-[#003838] text-[14px] cursor-pointer"
              >
                <IconCamera />
              </td>
              <td
                @click="toggleChecklist(aluno)"
                class="px-6 py-4 font-medium text-[#003838] text-[14px] cursor-pointer"
                :class="{
                  'text-green-500': aluno.checked,
                  'text-gray-500': !aluno.checked
                }"
              >
                <IconCheck/>
              </td>
              <td
                @click="deleteAluno(index)"
                class="px-6 py-4 font-medium text-[#003838] text-[14px] cursor-pointer "
              >
                <IconLixiera/>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Elemento de vídeo da câmera -->
      <div v-if="isCameraOpen" class="mt-4">
        <video ref="video" class="w-full max-w-md border-2" autoplay></video>
        <button
          @click="closeCamera"
          class="mt-2 bg-red-500 text-white py-2 px-4 rounded"
        >
          Fechar Câmera
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import IconCamera from "./icons/IconCamera.vue";
import IconLixiera from "./icons/IconLixiera.vue";
import IconCheck from "./icons/IconCheck.vue";
  
  // Dados mockados de turmas e alunos reais
  const classes = [
    { id: 1, name: "Turma A" },
    { id: 2, name: "Turma B" },
    { id: 3, name: "Turma C" },
  ];
  
  const alunosData = [
    { nome: "Ana Souza", turma: "Turma A", checked: false },
    { nome: "Carlos Oliveira", turma: "Turma A", checked: false },
    { nome: "Fernanda Costa", turma: "Turma B", checked: false },
    { nome: "Gabriel Silva", turma: "Turma C", checked: false },
    { nome: "Juliana Santos", turma: "Turma B", checked: false },
  ];
  
  const selectedClass = ref("Turma A");
  
  const isCameraOpen = ref(false);
  
  const filteredAlunos = computed(() => {
    return alunosData.filter((aluno) => aluno.turma === selectedClass.value);
  });
  
  // Função para abrir a câmera
  const openCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = $refs.video;
        videoElement.srcObject = stream;
        isCameraOpen.value = true;
      } catch (error) {
        console.error("Erro ao acessar a câmera:", error);
      }
    } else {
      alert("Câmera não disponível no seu navegador.");
    }
  };
  
  // Função para fechar a câmera
  const closeCamera = () => {
    const stream = $refs.video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    isCameraOpen.value = false;
  };
  
  // Função para alternar o status do checklist
  const toggleChecklist = (aluno) => {
    aluno.checked = !aluno.checked;
  };
  
  // Função para excluir um aluno
  const deleteAluno = (index) => {
    alunosData.splice(index, 1);
  };
  </script>
  
  <style scoped>
  /* Estilos adicionais podem ser colocados aqui */
  </style>
  