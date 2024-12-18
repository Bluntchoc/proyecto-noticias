<script setup>
import { buscarNoticias } from '@/services/query_api';
import { ref } from 'vue';

const query = ref(""); // Almacena el término de búsqueda
const cargando = ref(false); // Estado de carga inicial
const noticias = ref([]); // Resultados de la búsqueda
const buscado = ref(false); // Estado de la búsqueda (no realizada)
const pagina = ref(1); // Página actual
const itemsPorPagina = 5; // Noticias por página
const nResultados = ref(0); // Resultados de la búsqueda

// Función para realizar la búsqueda
const realizarBusqueda = async () => {
  if (!query.value.trim()) {
    alert("Por favor, escribe un término de búsqueda");
    return;
  }

  cargando.value = true; // Activa el indicador de carga
  buscado.value = true; // Marca el estado debusqueda a realizada

  try {
    const data = await buscarNoticias(query.value); // Llama a la API con la consulta
    noticias.value = data.hits; // Almacena los resultados o hits
    nResultados.value = noticias.value.length; // Almacena la cantidad de resultados
  } catch (error) {
    console.error("Error al buscar noticias", error);
  } finally {
    cargando.value = false; // Desactiva el indicador de carga
  }
};

// Actualizar el estado de la búsqueda
const actualizarQuery = () => {
  buscado.value = false; // Resetear estado de busqueda
  pagina.value = 1; // Resetear a la primera página
};

// Función para formatear la fecha
const formatearFecha = (fechaString) => {
  const fecha = new Date(fechaString);

  // Formato de fecha
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Formato de hora
  const horaFormateada = fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return `${fechaFormateada} ${horaFormateada}`;
};
</script>

<template>
  <!-- Buscador -->
  <v-card id="buscador"
    class="mx-auto"
    color="surface-light"
    max-width="250">
    <v-card-text>
      <v-text-field
        v-model="query"
        :loading="cargando"
        append-inner-icon="mdi-magnify"
        density="compact"
        label="Ingrese búsqueda"
        variant="solo"
        hide-details
        @keyup.enter="realizarBusqueda"
        @input="actualizarQuery"
      ></v-text-field>
    </v-card-text>
  </v-card>

  <v-container>
    <v-data-iterator :items="noticias" :page="pagina" v-if="noticias.length">
      <template v-slot:default="{ items }">
        <template v-for="(noticia, i) in items" :key="i">
          <v-card id="noticias">
            <v-card-title><a :href=noticia.raw.url target="_blank">{{ noticia.raw.title }}</a></v-card-title>
            <v-card-item>Autor: {{ noticia.raw.author }}</v-card-item>
            <v-card-item>Fecha de publicación: {{ formatearFecha(noticia.raw.created_at) }}</v-card-item>
          </v-card>
        </template>
    </template>
  </v-data-iterator>

  <!-- Mostrar un mensaje si no hay resultados -->
  <div v-else-if="buscado && !cargando">
    <p>No se encontraron resultados para "{{ query }}"</p>
  </div>

  <!-- Indicador de carga -->
  <v-progress-circular v-if="cargando" indeterminate color="primary"></v-progress-circular>

  <!-- Paginación -->
  <div id="paginacion" class="text-center" v-if="nResultados > itemsPorPagina">
      <v-pagination
        v-model="pagina"
        :length="Math.ceil(nResultados / itemsPorPagina)"
        rounded="circle"
      ></v-pagination>
    </div>
  </v-container>

</template>

<style scoped>
#buscador{
  line-height: 1.5;
  position: fixed;
  top: 15px;
  left: 15px;
  width: 100%;
  max-width: 350px;
  z-index: 10;
}

.v-container{
  margin-top: 10px;
  width: 100%;

}

#paginacion{
  margin-top: 20px;
  position: relative;
  bottom: 0;
}

#noticias{
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 2px;
}

.v-card-item{
  padding: 7px;
}

@media (max-width: 1024px) {
  #buscador {
    top: 10px;
    left: 10px;
    width: 90%;
  }

  .v-container {
    width: 100%;
    margin-top: 100px;
  }

  #noticias {
    width: 100%;
    max-width: 90%;
  }

  #paginacion {
    width: 100%;
    margin-top: 10px;
  }
}

@media (max-width: 768px) {
  #buscador {
    top: 10px;
    left: 10px;
    width: 90%;
  }

  .v-container {
    width: 100%;
    margin-top: 150px;

  }

  #noticias {
    width: 100%;
  }

  #paginacion {
    width: 100%;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  #buscador {
    width: 100%;
    top: 5px;
    left: 5px;
  }

  .v-container {
    margin-top: 120px;
    width: 95%;

  #noticias {
    width: 100%;
  }
}
}
</style>
