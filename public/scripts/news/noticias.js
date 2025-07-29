function atualizarRelogioHub() {
  const agora = new Date();
  const opcoesData = { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' };
  const dataFormatada = agora.toLocaleDateString('pt-BR', opcoesData);
  const hora = agora.getHours().toString().padStart(2, '0');
  const min = agora.getMinutes().toString().padStart(2, '0');
  const seg = agora.getSeconds().toString().padStart(2, '0');
  document.getElementById('relogio-hub').innerHTML = `${hora}:${min}:${seg} — ${dataFormatada}`;
}

function atualizarRelogioIphone() {
  const agora = new Date();
  const opcoesData = { weekday: 'long', day: '2-digit', month: 'long' };
  const dataFormatada = agora.toLocaleDateString('pt-BR', opcoesData);
  const hora = agora.getHours().toString().padStart(2, '0');
  const min = agora.getMinutes().toString().padStart(2, '0');
  const seg = agora.getSeconds().toString().padStart(2, '0');
  document.getElementById('relogio-data').innerHTML = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  document.getElementById('relogio-hora').innerHTML = `${hora}:${min}:${seg}`;
}
setInterval(atualizarRelogioIphone, 1000);
atualizarRelogioIphone();
