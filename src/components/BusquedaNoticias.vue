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
const mostrarFavoritos = ref(false) // Estado de mostrar favoritos

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

// Función para verificar si un artículo es favorito
const esFavorito = (noticia) => {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  return favoritos.some(fav => fav.story_id === noticia.story_id);
};

// Función para agregar o quitar favoritos
const agregarFavoritos = (noticia) => {
  let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  const index = favoritos.findIndex(fav => fav.story_id === noticia.story_id);

  if (index === -1) {
    favoritos.push(noticia);
  } else {
    favoritos.splice(index, 1);
  }
  // Guardar la lista actualizada de favoritos en localStorage
  localStorage.setItem('favoritos', JSON.stringify(favoritos));

  // Actualiza la lista de noticias para reflejar los cambios de favoritos
  noticias.value = [...noticias.value];
};

// Función para obtener las noticias favoritas desde el localStorage
const obtenerFavoritos = () => {
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  return favoritos;
};

// Función para alternar la vista de favoritos
const alternarFavoritos = () => {
  mostrarFavoritos.value = !mostrarFavoritos.value;
  if (mostrarFavoritos.value) {
    // Mostrar solo los favoritos con paginación
    const favoritos = obtenerFavoritos();
    pagina.value = 1
    if (favoritos.length === 0) {
      alert("No tienes noticias favoritas guardadas.");
    }
    noticias.value = favoritos; // Mostrar los favoritos con paginación
    nResultados.value = favoritos.length; // Ajustar el número de resultados
  } else {
    // Solo volver a realizar la búsqueda cuando no se están mostrando favoritos
    realizarBusqueda(); // Volver a mostrar todos los resultados de la búsqueda
  }
};

const scrollToTop = () => {
  window.scrollTo(0,0);
};
</script>

<template>
  <!-- Buscador -->
  <v-card id="buscador"
    color="surface-light">
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

  <!-- Botón de Favoritos -->
  <v-btn @click="alternarFavoritos" class="mb-3">
    {{ mostrarFavoritos.value ? 'Mostrar todos' : 'Mostrar favoritos' }}
  </v-btn>

  <v-container>
    <v-data-iterator :items="mostrarFavoritos.value ? obtenerFavoritos() : noticias" :page="pagina" v-if="noticias.length">
      <template v-slot:default="{ items }">
        <template v-for="(noticia, i) in items" :key="i">
          <v-card id="noticias">
            <div class="card-header">
              <v-card-title class="title">
                <a :href="noticia.raw.url" target="_blank">{{ noticia.raw.title }}</a>
              </v-card-title>
              <v-icon :icon="esFavorito(noticia.raw) ? 'mdi-heart' : 'mdi-heart-outline'"  color="red" class="icon-end" @click="agregarFavoritos(noticia.raw)"/>
            </div>
            <v-card-item >Autor: {{ noticia.raw.author }}</v-card-item>
            <v-card-item>Fecha de publicación: {{ formatearFecha(noticia.raw.created_at) }}</v-card-item>
          </v-card>
        </template>
    </template>
  </v-data-iterator>

  <!-- Mostrar un mensaje si no hay resultados -->
  <div v-else-if="buscado && !cargando" class="sin-resultados">
    <p>No se encontraron resultados para "{{ query }}"</p>
  </div>

  <!-- Paginación -->
  <div id="paginacion" class="text-center" v-if="nResultados > itemsPorPagina">
      <v-pagination
        v-model="pagina"
        :length="Math.ceil(mostrarFavoritos.value ? obtenerFavoritos().length / itemsPorPagina : nResultados / itemsPorPagina)"
        rounded="circle"
        @click="scrollToTop()"
      ></v-pagination>
    </div>
  </v-container>

</template>

<style scoped>
#buscador {
  line-height: 1.5;
  position: fixed;
  top: 15px;
  left: 15px;
  width: 100%;
  max-width: 230px;
  z-index: 10;
}

.v-btn {
  line-height: 1.5;
  position: fixed;
  top: 90px;
  left: 15px;
  width: 100%;
  max-width: 230px;
  z-index: 10;
}

.v-container {
  margin-top: 10px;
  width: 100%;
}

#paginacion {
  margin-top: 20px;
  position: relative;
  bottom: 0;
}

#noticias {
  width: 100%;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10px;
  font-size: medium;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

#noticias:hover {
  transform: translateY(-5px);
  box-shadow: 0px 8px 12px rgba(0, 0, 0, 0.2);
}

.v-card-item {
  padding: 10px 16px;
  color: #555555;
}

.v-card-item:nth-child(odd) {
  background-color: #fafafa;
}

.v-card-item:nth-child(even) {
  background-color: #fafafa;
}

.card-header {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 5px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.title {
  flex-grow: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 40px);
  font-size: 100%;
}

.title a {
  display: inline-block;
  text-decoration: none;
  color: #1e88e5;
  font-weight: bold;
  transition: color 0.2s;
}

.title a:hover {
  color: #1565c0;
}

.icon-end {
  flex-shrink: 0;
  margin-right: 10px;
  color: #e53935;
}

.sin-resultados {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
}

@media (max-width: 1024px) {
  #buscador {
    top: 10px;
    left: 10px;
    width: 90%;
    position: relative;
  }

  .v-container {
    width: 100%;
    margin-top: 10px;
  }

  #noticias {
    width: 100%;
    max-width: 90%;
    margin-top: 5px;
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
    position: relative;
  }

  .v-container {
    width: 100%;
    margin-top: 10px;
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
    margin-top: 10px;
    width: 95%;
  }

  #noticias {
    width: 100%;
  }
}
</style>

