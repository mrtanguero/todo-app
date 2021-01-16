let zadaci = [];
const api_route = 'http://localhost/akademija-generacija-5/todo-list/api';

function citajZadatke() {
  return $.ajax({
    type: 'GET',
    url: api_route + '/get_tasks.php',
    success: (result) => {
      zadaci = JSON.parse(result);
    },
  });
}

function prikaziZadatke() {
  // let tabela_body = document.getElementById('tabela_svih_body');
  let tabela_body = $('#tabela_svih_body');
  let tabela = [];
  zadaci.forEach((zadatak, i) => {
    let zavrseno_chk = '';
    let klasa_zavrseno = '';
    if (zadatak.zavrseno === 'true') {
      zavrseno_chk = 'checked';
      klasa_zavrseno = 'zavrseno';
    }
    let chk_box = `<input 
        type="checkbox" 
        onchange="zavrsiZadatak(${i})" 
        ${zavrseno_chk} 
        />`;
    let dugme_brisanje = `<button 
        class="btn btn-sm btn-danger " 
        onclick="ukloniZadatak(${i})">
            <i class="fa fa-times"></i>
        </button>`;
    let dugme_izmjena = `<button 
        class="btn btn-sm btn-primary " 
        onclick="izmijeniZadatak(${i})">
            <i class="fa fa-edit"></i>
        </button>`;
    tabela.push(
      `<tr id="red_${i}" class="${klasa_zavrseno}">
            <td>${zadatak.id}</td>
            <td>${zadatak.tekst}</td>
            <td>${zadatak.opis}</td>
            <td>${chk_box}</td> 
            <td>${dugme_brisanje}</td>
            <td>${dugme_izmjena}</td> 
        </tr>`
    );
  });
  tabela_body.html(tabela.join(''));
}

function generisiNoviID() {
  let max = 0;
  for (let i = 0; i < zadaci.length; i++) {
    if (Number(zadaci[i].id) > max) max = Number(zadaci[i].id);
  }
  return max + 1;
}

function updateDB() {
  return $.ajax({
    type: 'POST',
    url: api_route + '/update_tasks.php',
    data: { zadaci },
    success: (response) => {
      console.log(response);
    },
  });
}

function zavrsiZadatak(index) {
  zadaci[index].zavrseno = !(zadaci[index].zavrseno === 'true');
  updateDB().then(() => $('#red_' + index).toggleClass('zavrseno'));
}

function ukloniZadatak(index) {
  if (confirm('Da li ste sigurni?')) {
    zadaci.splice(index, 1);
    prikaziZadatke();
    updateDB();
  }
}

function izmijeniZadatak(index) {
  let zadatak = zadaci[index];
  document.getElementById('izmjena_tekst').value = zadatak.tekst;
  document.getElementById('izmjena_opis').value = zadatak.opis;
  document.getElementById('index_izmjena').value = index;
  $('#modal_izmjena').modal('show');
}

function isprazniPolja(tip) {
  if (tip == 'izmjena') {
    document.getElementById('izmjena_tekst').value = '';
    document.getElementById('izmjena_opis').value = '';
    document.getElementById('index_izmjena').value = -1;
  } else if (tip == 'dodavanje') {
    document.getElementById('novi_zadatak_tekst').value = '';
    document.getElementById('novi_zadatak_opis').value = '';
  }
}

citajZadatke().then(() => {
  prikaziZadatke();
});

// dodavanje event listener-a
document
  .getElementById('dodaj_novi_forma')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    let novi_tekst = document.getElementById('novi_zadatak_tekst').value;
    let novi_opis = document.getElementById('novi_zadatak_opis').value;
    let novi_zadatak = {
      id: generisiNoviID(),
      tekst: novi_tekst,
      opis: novi_opis,
      zavrseno: false,
    };
    zadaci.push(novi_zadatak);
    prikaziZadatke();

    updateDB();
    $('#modal_dodavanje').modal('hide');
    isprazniPolja('dodavanje');
  });

document
  .getElementById('izmjena_zadatka_forma')
  .addEventListener('submit', function (e) {
    e.preventDefault();
    let index = document.getElementById('index_izmjena').value;
    zadaci[index].tekst = document.getElementById('izmjena_tekst').value;
    zadaci[index].opis = document.getElementById('izmjena_opis').value;

    updateDB().then(() => prikaziZadatke());
    $('#modal_izmjena').modal('hide');
    isprazniPolja('izmjena');
  });
