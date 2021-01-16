const api_route = 'http://localhost/akademija-generacija-5/api';

let zadaci = [];

// Neki flegovi koje koristim za filtriranje
let checkActive = false;
let searchActive = false;

const searchText = document.getElementById('search-text');
const searchOpis = document.getElementById('search-opis');
const searchZavrseno = document.getElementById('search-zavrseno');
const clearSearch = document.querySelector('.btn-clear-search');
const checkLabel = document.querySelector('.form-check-label');

// Deep copy arraya koji ima objekte kao elemente
function copyArr(arrOfObjects) {
  return arrOfObjects.map((obj) => Object.assign({}, obj));
}

// Funkcija koja filtrira rezultate po search poljima
function filterZadaci() {
  if (searchActive) {
    const filteredZadaci = copyArr(zadaci)
      .filter((zadatak) =>
        zadatak.tekst.toLowerCase().includes(searchText.value.toLowerCase())
      )
      .filter((zadatak) =>
        zadatak.opis.toLowerCase().includes(searchOpis.value.toLowerCase())
      )
      .filter((zadatak) => {
        if (!checkActive) return true;
        if (searchZavrseno.checked) {
          if (zadatak.zavrseno === 'true' || zadatak.zavrseno === true)
            return true;
        }
        if (!searchZavrseno.checked) {
          if (zadatak.zavrseno === 'false' || zadatak.zavrseno === false)
            return true;
        }
        return false;
      });
    return filteredZadaci;
  }
}

function citajZadatke() {
  return $.ajax({
    type: 'GET',
    url: api_route + '/get_tasks.php',
    success: (result) => {
      zadaci = JSON.parse(result);
    },
  });
}

function prikaziZadatke(tasks = zadaci) {
  let tabela_body = $('#tabela_svih_body');
  let tabela = [];

  // Koristim novi niz za manipulacije i prikaze
  let sortedZadaci = copyArr(tasks)
    .reverse()
    .filter((task) => task.zavrseno === 'false' || task.zavrseno === false)
    .concat(
      ...copyArr(tasks)
        .reverse()
        .filter((task) => task.zavrseno === 'true' || task.zavrseno === true)
    );

  sortedZadaci.forEach((zadatak) => {
    let zavrseno_chk = '';
    let klasa_zavrseno = '';
    if (zadatak.zavrseno === 'true' || zadatak.zavrseno === true) {
      zavrseno_chk = 'checked';
      klasa_zavrseno = 'zavrseno';
    }
    let chk_box = `<input 
        type="checkbox" 
        onchange="zavrsiZadatak(${zadatak.id})" 
        ${zavrseno_chk} 
        />`;
    let dugme_brisanje = `<button 
        class="btn btn-sm btn-danger " 
        onclick="ukloniZadatak(${zadatak.id})">
            <i class="fa fa-times"></i>
        </button>`;
    let dugme_izmjena = `<button 
        class="btn btn-sm btn-primary " 
        onclick="izmijeniZadatak(${zadatak.id})">
            <i class="fa fa-edit"></i>
        </button>`;
    tabela.push(
      `<tr id="red_${zadatak.id}" class="${klasa_zavrseno}">
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

// Ovom funkcijom radim sve promjene u bazi
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

function zavrsiZadatak(id) {
  const index = zadaci.findIndex((zadatak) => zadatak.id == id);
  zadaci[index].zavrseno = !(
    zadaci[index].zavrseno === 'true' || zadaci[index].zavrseno === true
  );
  updateDB().then(() => {
    $('#red_' + id).toggleClass('zavrseno');
    prikaziZadatke(filterZadaci());
  });
}

function ukloniZadatak(id) {
  const index = zadaci.findIndex((zadatak) => zadatak.id == id);
  if (confirm('Da li ste sigurni?')) {
    zadaci.splice(index, 1);
    prikaziZadatke(filterZadaci());
    updateDB();
  }
}

function izmijeniZadatak(id) {
  const index = zadaci.findIndex((zadatak) => zadatak.id == id);
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

    updateDB().then(() => prikaziZadatke(filterZadaci()));
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

    updateDB().then(() => prikaziZadatke(filterZadaci()));
    $('#modal_izmjena').modal('hide');
    isprazniPolja('izmjena');
  });

// Event listeneri za search
searchText.addEventListener('keyup', () => {
  searchActive = true;
  prikaziZadatke(filterZadaci());
});

searchOpis.addEventListener('keyup', () => {
  searchActive = true;
  prikaziZadatke(filterZadaci());
});

searchZavrseno.addEventListener('change', () => {
  searchActive = true;
  checkActive = true;
  if (searchZavrseno.checked) checkLabel.textContent = 'Samo završeni';
  else checkLabel.textContent = 'Samo nezavršeni';
  prikaziZadatke(filterZadaci());
});

clearSearch.addEventListener('click', () => {
  searchText.value = '';
  searchOpis.value = '';
  searchZavrseno.checked = false;
  checkActive = false;
  searchActive = false;
  checkLabel.textContent = 'Prikaži samo završene';
  prikaziZadatke();
});
