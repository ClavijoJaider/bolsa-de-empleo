document.addEventListener('DOMContentLoaded', () => {
  // Ofertas de ejemplo
  const sampleOffers = [
    {
      id: 1,
      titulo: 'Desarrollador Frontend React',
      empresa: 'TechCorp Solutions',
      ubicacion: 'Bogotá, Colombia',
      salario: '$4.000.000 - $5.500.000 COP',
      descripcion: 'Buscamos un desarrollador con 3+ años de experiencia en React, HTML5, CSS3 y Bootstrap.',
      logo: 'img/logo-techcorp.jpg'
    },
    {
      id: 2,
      titulo: 'Analista Financiero Senior',
      empresa: 'FinanceCo',
      ubicacion: 'Medellín, Colombia',
      salario: '$6.000.000 - $8.000.000 COP',
      descripcion: 'Responsable de modelos financieros, análisis de inversiones y reportes para la gerencia.',
      logo: 'img/logo-financeco.jpg'
    },
    {
      id: 3,
      titulo: 'Enfermero Clínico',
      empresa: 'HealthPlus',
      ubicacion: 'Cali, Colombia',
      salario: '$3.000.000 - $4.200.000 COP',
      descripcion: 'Atención directa al paciente, gestión de historiales clínicos y apoyo en procedimientos médicos.',
      logo: 'img/logo-healthplus.jpg'
    }
  ];

  // Actualizar contadores de ofertas y empresas
  const ofertasCountEl = document.getElementById('ofertas-count');
  const empresasCountEl = document.getElementById('empresas-count');
  if (ofertasCountEl) ofertasCountEl.textContent = sampleOffers.length;
  if (empresasCountEl) {
    const empresasUnicas = new Set(sampleOffers.map(o => o.empresa));
    empresasCountEl.textContent = empresasUnicas.size;
  }

  // Renderizar las ofertas con botón que abre modal
  const renderOffers = list => {
    const container = document.getElementById('featured-jobs-container');
    container.innerHTML = '';
    list.forEach(o => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${o.logo}" class="card-img-top p-4" alt="Logo ${o.empresa}"
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

  // Cuando se muestra el modal, llenamos los datos
  const jobDetailModal = document.getElementById('jobDetailModal');
  jobDetailModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    const id = +button.getAttribute('data-id');
    const oferta = sampleOffers.find(o => o.id === id);
    if (!oferta) return;

    document.getElementById('modal-logo').src = oferta.logo;
    document.getElementById('modal-title').textContent = oferta.titulo;
    document.getElementById('modal-company').textContent = oferta.empresa;
    document.getElementById('modal-location').textContent = oferta.ubicacion;
    document.getElementById('modal-salary').textContent = oferta.salario;
    document.getElementById('modal-description').textContent = oferta.descripcion;
    // Pon aquí la ruta de aplicación real:
    document.getElementById('modal-apply').href = `#`;
  });

  // Inicialmente renderizamos
  renderOffers(sampleOffers);
});
