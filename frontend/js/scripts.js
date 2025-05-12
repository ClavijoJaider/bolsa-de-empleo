document.addEventListener('DOMContentLoaded', () => {
  let currentUser = null;

  // ======== Funciones de API ======== //
  const api = {
    get: async (url) => {
      const response = await fetch(url);
      return await response.json();
    },
    post: async (url, data, token = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });
      return await response.json();
    }
  };

  // ======== Funciones Comunes ======== //
  const actualizarContadores = async () => {
    const ofertas = await api.get('/api/ofertas');
    const empresas = new Set(ofertas.map(o => o.empresa));
    
    document.getElementById('ofertas-count').textContent = ofertas.length;
    document.getElementById('empresas-count').textContent = empresas.size;
  };

  const renderizarOfertas = (ofertas) => {
    const container = document.getElementById('featured-jobs-container');
    container.innerHTML = '';
    
    ofertas.forEach(o => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${o.logo}" class="card-img-top p-4" alt="${o.empresa}"
               style="height:150px; object-fit:contain; background:#fff;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${o.titulo}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${o.empresa}</h6>
            <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${o.ubicacion}</p>
            <p class="mb-2"><i class="fas fa-euro-sign"></i> ${o.salario}</p>
            <p class="flex-grow-1 small text-muted">${o.descripcion}</p>
            <button 
              class="btn btn-primary mt-auto" 
              data-bs-toggle="modal" 
              data-bs-target="#jobDetailModal"
              data-id="${o.id}"
            >Ver oferta</button>
          </div>
        </div>`;
      container.appendChild(col);
    });
  };

  // ======== Login/Registro ======== //
  // Manejar formulario de registro
  document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      nombre: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      es_empresa: confirm('¿Eres una empresa?') // Cambiar por checkbox en producción
    };
    
    try {
      const { id } = await api.post('/api/registro', formData);
      alert(`Registro exitoso! ID: ${id}`);
      window.location.href = 'login.html';
    } catch (error) {
      alert('Error en registro: ' + (error.message || ''));
    }
  });

  // Manejar formulario de login
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
      email: e.target.email.value,
      password: e.target.password.value
    };
    
    try {
      const { token, usuario } = await api.post('/api/login', formData);
      localStorage.setItem('token', token);
      currentUser = usuario;
      
      if (usuario.es_empresa) {
        window.location.href = '/empresa.html'; // Crear esta página si es necesario
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  });

  // ======== Carga Inicial ======== //
  const cargarDatosIniciales = async () => {
    try {
      const ofertas = await api.get('/api/ofertas');
      renderizarOfertas(ofertas);
      actualizarContadores();
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };
  
  cargarDatosIniciales();
});