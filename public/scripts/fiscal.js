// fiscal.js

document.addEventListener('DOMContentLoaded', function () {
  const dasCard = document.getElementById('card-das');
  const xmlCard = document.getElementById('card-xml');
  const simulation = document.getElementById('fiscal-tool-simulation');

  function showSimulation(type) {
    simulation.classList.add('active');
    simulation.style.opacity = 0;
    setTimeout(() => { simulation.style.opacity = 1; }, 10);
    if (type === 'das') {
      simulation.innerHTML = `<h2 style='margin:0 0 8px 0;'>Calculadora DAS</h2>`;
    } else if (type === 'xml') {
      simulation.innerHTML = `<h2 style='margin:0 0 8px 0;'>XML Importer</h2>`;
    }
  }

  function hideSimulation() {
    simulation.style.opacity = 0;
    setTimeout(() => {
      simulation.classList.remove('active');
      simulation.innerHTML = '';
    }, 200);
  }

  dasCard.addEventListener('click', function () {
    if (simulation.classList.contains('active') && simulation.innerHTML.includes('Calculadora DAS')) {
      hideSimulation();
    } else {
      showSimulation('das');
    }
  });

  xmlCard.addEventListener('click', function () {
    if (simulation.classList.contains('active') && simulation.innerHTML.includes('XML Importer')) {
      hideSimulation();
    } else {
      showSimulation('xml');
    }
  });
}); 