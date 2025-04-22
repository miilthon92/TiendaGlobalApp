// Inicializar el mapa
const map = L.map('map').setView([-34.6037, -58.3816], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let negociosGlobal = [];
let productosGlobal = [];
let marcadores = [];

async function cargarNegocios() {
    const respuesta = await fetch('data/productos.json');
    const negocios = await respuesta.json();
    negociosGlobal = negocios;

    extraerProductosUnicos(negocios);
    mostrarTodosNegocios(negocios);
}

function extraerProductosUnicos(negocios) {
    const productosSet = new Set();
    negocios.forEach(negocio => {
        negocio.productos.forEach(producto => {
            productosSet.add(producto.nombre.toLowerCase());
        });
    });
    productosGlobal = Array.from(productosSet);
}

function limpiarMarcadores() {
    marcadores.forEach(marker => {
        map.removeLayer(marker);
    });
    marcadores = [];
}

// Crear ícono personalizado según el rubro
function obtenerIcono(rubro) {
    return L.icon({
        iconUrl: `images/icons/${rubro}.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

function mostrarTodosNegocios(negocios) {
    const businessList = document.getElementById('businessList');
    businessList.innerHTML = '';

    limpiarMarcadores();

    negocios.forEach(negocio => {
        const card = document.createElement('div');
        card.className = 'business-card';

        let productosHTML = '';
        negocio.productos.forEach(prod => {
            productosHTML += `<li>${prod.nombre} - $${prod.precio}</li>`;
        });

        card.innerHTML = `
            <h4>${negocio.comercio}</h4>
            <p><strong>Dirección:</strong> ${negocio.direccion}</p>
            <ul>${productosHTML}</ul>
            <button class="btn btn-primary btn-sm mt-2" onclick="verEnMapa(${negocio.latitud}, ${negocio.longitud}, '${negocio.comercio}')">
                Ver en Mapa
            </button>
        `;

        businessList.appendChild(card);

        const icono = obtenerIcono(negocio.rubro || "default");

        const marker = L.marker([negocio.latitud, negocio.longitud], { icon: icono }).addTo(map);
        marker.bindPopup(`<b>${negocio.comercio}</b><br>${negocio.direccion}`);
        marcadores.push(marker);
    });

    ajustarVistaMapa(); // Ajustar zoom después de mostrar negocios
}

function buscarProducto(query) {
    const resultados = [];

    negociosGlobal.forEach(negocio => {
        negocio.productos.forEach(producto => {
            if (producto.nombre.toLowerCase().includes(query.toLowerCase())) {
                resultados.push({
                    nombre: producto.nombre,
                    precio: producto.precio,
                    comercio: negocio.comercio,
                    direccion: negocio.direccion,
                    latitud: negocio.latitud,
                    longitud: negocio.longitud,
                    rubro: negocio.rubro
                });
            }
        });
    });

    resultados.sort((a, b) => a.precio - b.precio);

    mostrarResultadosBusqueda(resultados);
}

function mostrarResultadosBusqueda(resultados) {
    const businessList = document.getElementById('businessList');
    const suggestionsDiv = document.getElementById('suggestions');
    businessList.innerHTML = '';

    limpiarMarcadores();

    if (resultados.length === 0) {
        businessList.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }

    resultados.forEach(item => {
        const card = document.createElement('div');
        card.className = 'business-card';

        card.innerHTML = `
            <h4>${item.nombre}</h4>
            <p><strong>Precio:</strong> $${item.precio}</p>
            <p><strong>Comercio:</strong> ${item.comercio}</p>
            <p><strong>Dirección:</strong> ${item.direccion}</p>
            <button class="btn btn-success btn-sm mt-2" onclick="verEnMapa(${item.latitud}, ${item.longitud}, '${item.comercio}')">
                Ver en Mapa
            </button>
        `;

        businessList.appendChild(card);

        const icono = obtenerIcono(item.rubro || "default");

        const marker = L.marker([item.latitud, item.longitud], { icon: icono }).addTo(map);
        marker.bindPopup(`<b>${item.comercio}</b><br>${item.direccion}`);
        marcadores.push(marker);
    });

    suggestionsDiv.innerHTML = '';

    ajustarVistaMapa(); // Ajustar zoom después de mostrar resultados
}

function verEnMapa(latitud, longitud, nombre) {
    map.setView([latitud, longitud], 17);
    L.popup()
     .setLatLng([latitud, longitud])
     .setContent(`<b>${nombre}</b>`)
     .openOn(map);

    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
}

// Botón limpiar búsqueda
const clearButton = document.getElementById('clearButton');

clearButton.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('suggestions').innerHTML = '';
    clearButton.style.display = 'none';
    mostrarTodosNegocios(negociosGlobal);
});

// Buscador + sugerencias + mostrar/ocultar botón limpiar
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    const suggestionsDiv = document.getElementById('suggestions');

    if (query.length > 0) {
        buscarProducto(query);
        clearButton.style.display = 'inline-block';

        const sugerenciasFiltradas = productosGlobal.filter(producto =>
            producto.includes(query.toLowerCase())
        );

        suggestionsDiv.innerHTML = '';

        sugerenciasFiltradas.forEach(sugerencia => {
            const sugerenciaItem = document.createElement('div');
            sugerenciaItem.className = 'list-group-item suggestion-item';
            sugerenciaItem.textContent = sugerencia;
            sugerenciaItem.onclick = () => {
                document.getElementById('searchInput').value = sugerencia;
                buscarProducto(sugerencia);
                suggestionsDiv.innerHTML = '';
            };
            suggestionsDiv.appendChild(sugerenciaItem);
        });

    } else {
        mostrarTodosNegocios(negociosGlobal);
        suggestionsDiv.innerHTML = '';
        clearButton.style.display = 'none';
    }
});

// Ajustar automáticamente la vista del mapa según marcadores
function ajustarVistaMapa() {
    if (marcadores.length === 0) return;

    const grupo = new L.featureGroup(marcadores);

    if (marcadores.length === 1) {
        map.setView(marcadores[0].getLatLng(), 18);
    } else {
        map.fitBounds(grupo.getBounds(), { padding: [50, 50] });
    }
}

// Ejecutar al cargar
cargarNegocios();